/**
 * Tipe domain toko - cerminan skema database yang akan dibuat di Laravel:
 * categories -> products -> product_variants (warna x ukuran) -> product_images.
 * Saat migrasi ke Inertia, tipe ini dipakai untuk props dari controller.
 */

export type CategorySlug = "wanita" | "pria" | "anak" | "aksesori";

export interface Category {
  slug: CategorySlug;
  label: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  /** Harga jual aktif dalam Rupiah (tanpa titik/koma). */
  price: number;
  /** Coret harga bila ada diskon; opsional. */
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  reviews?: number;
}

/** Item keranjang (disimpan di zustand + localStorage, tanpa login). */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
}

/** Warna varian produk. */
export interface ProductColor {
  name: string;
  hex: string;
}

/**
 * Info detail produk untuk PDP. Nantinya diisi dari API
 * (products + variants + images); sementara diturunkan dari katalog.
 */
export interface ProductDetailInfo {
  sku: string;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  material: string;
  motif: string;
}

const DEFAULT_COLORS: ProductColor[] = [
  { name: "Biru Mega Mendung", hex: "#2B3A55" },
  { name: "Marun Soga", hex: "#7A2E2E" },
  { name: "Indigo", hex: "#4A5568" },
];

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

/** Deskripsi generik per kategori (dipakai bila produk tak punya khusus). */
const CATEGORY_BLURB: Record<CategorySlug, string> = {
  wanita:
    "Siluet ramping yang mengikuti tubuh dengan bukaan kancing tanam - nyaman untuk kerja maupun kondangan.",
  pria: "Potongan presisi dengan kerah rapi - transisi mulus dari rapat ke acara keluarga.",
  anak: "Katun lembut yang tahan main - jahitan kuat dan warna alami yang tidak luntur.",
  aksesori:
    "Pelengkap gaya batik harian - material pilihan dengan motif khas Yogyakarta.",
};

/** Override detail untuk produk unggulan. */
const DETAIL_OVERRIDES: Record<string, Partial<ProductDetailInfo>> = {
  p01: {
    sku: "BY-W-KMM-001",
    description:
      "Motif Mega Mendung melambangkan ketenangan - deretan awan bergradasi yang dicanthing satu per satu oleh perajin kami di Kotagede. Setiap helai membutuhkan 14 hari kerja, dari ngelowong hingga ngelorot.",
    motif: "Mega Mendung (tulis tangan)",
  },
  p10: {
    sku: "BY-M-KSJ-002",
    description:
      "Kemeja batik Sekar Jagad dengan komposisi motif yang rapi dan elegan. Dikerjakan dengan canting dan cap kayu, lalu diwarnai indigo alami yang semakin nyaman dipakai.",
    motif: "Sekar Jagad",
  },
};

/** Susun info detail lengkap untuk sebuah produk. */
export function getDetail(product: Product): ProductDetailInfo {
  const over = DETAIL_OVERRIDES[product.id] ?? {};
  return {
    sku: over.sku ?? `BJ-${product.id.toUpperCase()}`,
    description:
      over.description ??
      `${product.name} - ${CATEGORY_BLURB[product.category]}`,
    colors: over.colors ?? DEFAULT_COLORS,
    sizes: over.sizes ?? DEFAULT_SIZES,
    material: over.material ?? "Katun primisima, pewarna alami",
    motif: over.motif ?? "Motif khas Yogyakarta",
  };
}
