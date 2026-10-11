import type { CategorySlug, Product } from "@/types";

/**
 * Klien REST untuk Laravel API (batik-jogja-api).
 * - Basis URL dari VITE_API_URL, default ke serve lokal :8000.
 * - Token admin dibaca dari localStorage (ditulis store auth).
 * - Timeout 8 detik; bila server mati, pemanggil memutuskan fallback mock.
 */

export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

const TOKEN_KEY = "batik-jogja-admin-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan - mode privat */
  }
}

/** Error HTTP API dengan status + pesan siap tampil. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    };
    if (auth) {
      const token = getToken();
      if (!token)
        throw new ApiError(401, "Sesi admin berakhir. Masuk kembali.");
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (data as { message?: string }).message ??
        (res.status === 401
          ? "Email atau kata sandi salah."
          : `Server mengembalikan ${res.status}.`);
      throw new ApiError(res.status, msg);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      0,
      "Server API tidak terjangkau. Pastikan `php artisan serve` berjalan.",
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Bentuk produk mentah dari Laravel (id numerik + relasi). */
export interface ApiProductRaw {
  id: number;
  slug: string;
  name: string;
  sku?: string;
  price: number;
  original_price?: number | null;
  image: string;
  description?: string;
  material?: string;
  motif?: string;
  is_new: boolean;
  is_best_seller: boolean;
  rating?: number;
  reviews?: number;
  status?: string;
  stock_sum?: number;
  category?: { id: number; slug: string; label: string };
  category_id?: number;
  variants?: Array<{
    color_name: string;
    color_hex: string;
    size: string;
    stock: number;
  }>;
  images?: Array<{ url: string }>;
}

/** Petakan produk API → tipe Product frontend (id string, kategori slug). */
export function toProduct(raw: ApiProductRaw): Product {
  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    category: (raw.category?.slug ?? "wanita") as CategorySlug,
    price: raw.price,
    originalPrice: raw.original_price ?? undefined,
    image: raw.image,
    isNew: raw.is_new,
    isBestSeller: raw.is_best_seller,
    rating: raw.rating ?? 4.8,
    reviews: raw.reviews ?? 0,
  };
}

export interface Paged<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/* ---------------- Katalog publik ---------------- */

export async function fetchProducts(
  params: Record<string, string | number | boolean> = {},
): Promise<Product[]> {
  const q = new URLSearchParams();
  q.set("per_page", "50");
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  const paged = await request<Paged<ApiProductRaw>>(`/products?${q}`);
  return paged.data.map(toProduct);
}

export async function fetchProductRaw(slug: string): Promise<ApiProductRaw> {
  return request<ApiProductRaw>(`/products/${slug}`);
}

export interface CategoryRaw {
  id: number;
  slug: string;
  label: string;
}

export async function fetchCategories(): Promise<CategoryRaw[]> {
  return request<CategoryRaw[]>("/categories");
}

/* ---------------- Checkout ---------------- */

export interface CheckoutPayload {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  shipping: "standar" | "ekspres";
  payment: "transfer" | "gopay" | "ovo" | "qris";
  items: Array<{ productId: number; size: string; qty: number }>;
}

export interface OrderResult {
  code: string;
  total: number;
  snap_token: string | null;
  simulated: boolean;
}

export async function createOrder(
  payload: CheckoutPayload,
): Promise<OrderResult> {
  return request<OrderResult>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ---------------- Admin ---------------- */

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ admin: AdminUser; token: string }> {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogout(): Promise<void> {
  try {
    await request("/admin/logout", { method: "POST" }, true);
  } catch {
    /* token kadaluarsa - tetap lanjut hapus lokal */
  }
}

export async function adminProducts(
  params: Record<string, string | number> = {},
): Promise<Paged<ApiProductRaw>> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  return request<Paged<ApiProductRaw>>(`/admin/products?${q}`, {}, true);
}

export async function adminGetProduct(id: string): Promise<ApiProductRaw> {
  return request<ApiProductRaw>(`/admin/products/${id}`, {}, true);
}

export async function adminSaveProduct(
  id: string | null,
  body: Record<string, unknown>,
): Promise<ApiProductRaw> {
  return request<ApiProductRaw>(
    id ? `/admin/products/${id}` : "/admin/products",
    {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    },
    true,
  );
}

/** Hasil unggah foto: URL lengkap yang disajikan backend. */
export interface UploadedImage {
  url: string;
  file?: string;
}

/**
 * Unggah foto produk (multipart/form-data) ke POST /admin/images.
 * - `productId` diisi pada mode ubah: backend langsung menempelkan
 *   foto ke kolom image + galeri produk tersebut.
 * - Content-Type tidak di-set manual - biar browser menambahkan
 *   boundary multipart. Timeout 45 detik (file bisa besar di HP).
 */
export async function adminUploadImage(
  file: File,
  productId?: string | number,
): Promise<UploadedImage> {
  const token = getToken();
  if (!token) throw new ApiError(401, "Sesi admin berakhir. Masuk kembali.");

  const form = new FormData();
  form.append("file", file);
  if (productId !== undefined && productId !== "") {
    form.append("product_id", String(productId));
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45_000);
  try {
    const res = await fetch(`${API_BASE}/admin/images`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as UploadedImage & {
      message?: string;
    };
    if (!res.ok) {
      throw new ApiError(
        res.status,
        data.message ?? `Server mengembalikan ${res.status}.`,
      );
    }
    if (!data.url) throw new ApiError(0, "Unggahan gagal - URL tidak diterima.");
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      0,
      "Unggahan gagal. Periksa koneksi lalu coba lagi.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await request(`/admin/products/${id}`, { method: "DELETE" }, true);
}

export interface AdminOrderRaw {
  id: number;
  code: string;
  name: string;
  email: string;
  city: string;
  total: number;
  items_count?: number;
  status: string;
  created_at: string;
  customer?: { name: string; email: string } | null;
}

export async function adminOrders(
  params: Record<string, string | number> = {},
): Promise<Paged<AdminOrderRaw>> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  return request<Paged<AdminOrderRaw>>(`/admin/orders?${q}`, {}, true);
}

export interface AdminCustomerRaw {
  id: number;
  name: string;
  email: string;
  city: string | null;
  orders_count: number;
  spent_sum: string | number | null;
  created_at: string;
}

export async function adminCustomers(
  params: Record<string, string | number> = {},
): Promise<Paged<AdminCustomerRaw>> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  return request<Paged<AdminCustomerRaw>>(`/admin/customers?${q}`, {}, true);
}

export interface AdminStats {
  omzet: number;
  orders: number;
  products: number;
  customers: number;
}

export async function adminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats", {}, true);
}

export async function adminSettings(): Promise<Record<string, string>> {
  return request<Record<string, string>>("/admin/settings", {}, true);
}

export async function adminSaveSettings(
  body: Record<string, string | number>,
): Promise<void> {
  await request(
    "/admin/settings",
    { method: "PUT", body: JSON.stringify(body) },
    true,
  );
}
