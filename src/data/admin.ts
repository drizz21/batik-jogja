import { PRODUCTS } from "@/data/products";

/** Status pesanan (Bahasa Indonesia, sesuai frame admin Pencil). */
export type OrderStatus =
  | "Menunggu"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dibatalkan";

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  city: string;
  total: number;
  items: number;
  status: OrderStatus;
  date: string;
  productIds: string[];
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  joined: string;
}

/** Nama pelanggan fiktif untuk mock dasbor admin. */
const BUYERS: Array<[string, string, string]> = [
  ["Sinta Prabowo", "sinta@email.com", "Yogyakarta"],
  ["Andini Laras", "andini@email.com", "Jakarta"],
  ["Raka Pradana", "raka@email.com", "Surabaya"],
  ["Dewi Anggraini", "dewi@email.com", "Bandung"],
  ["Bagus Setiawan", "bagus@email.com", "Semarang"],
  ["Nadia Putri", "nadia@email.com", "Denpasar"],
  ["Fajar Nugroho", "fajar@email.com", "Solo"],
  ["Kirana Ayu", "kirana@email.com", "Malang"],
];

const STATUSES: OrderStatus[] = [
  "Selesai",
  "Dikirim",
  "Diproses",
  "Menunggu",
  "Selesai",
  "Dikirim",
  "Selesai",
  "Diproses",
];

/** 8 pesanan contoh - total dihitung dari harga produk mock. */
export const ADMIN_ORDERS: AdminOrder[] = BUYERS.map(
  ([name, email, city], i) => {
    const pick = [
      PRODUCTS[i % PRODUCTS.length],
      PRODUCTS[(i + 5) % PRODUCTS.length],
    ];
    return {
      id: `BJ-${2500 + i * 7}`,
      customer: name,
      email,
      city,
      items: (i % 3) + 1,
      total: pick.reduce((s, p) => s + p.price, 0),
      status: STATUSES[i % STATUSES.length],
      date: `2026-09-${String(28 - i).padStart(2, "0")}`,
      productIds: pick.map((p) => p.id),
    };
  },
);

/** Pelanggan contoh yang diturunkan dari daftar pembeli. */
export const ADMIN_CUSTOMERS: AdminCustomer[] = BUYERS.map(
  ([name, email, city], i) => ({
    id: `C-${101 + i}`,
    name,
    email,
    city,
    orders: (i % 4) + 1,
    spent: PRODUCTS[i % PRODUCTS.length].price * ((i % 4) + 1),
    joined: `2025-0${(i % 9) + 1}-1${i % 9}`,
  }),
);

/** Ringkasan angka dasbor. */
export const ADMIN_STATS = {
  omzet: 48650000,
  omzetDelta: "+12,4% bulan ini",
  orders: 342,
  ordersDelta: "+8,1% bulan ini",
  products: PRODUCTS.length,
  productsDelta: `${PRODUCTS.filter((p) => p.isNew).length} motif baru`,
  customers: 1284,
  customersDelta: "+96 pelanggan baru",
};

/** Data 12 batang grafik penjualan (tanpa library chart). */
export const SALES_BARS = [42, 58, 50, 70, 64, 82, 76, 90, 68, 84, 96, 88];

/** Warna badge tiap status pesanan. */
export const STATUS_STYLE: Record<OrderStatus, string> = {
  Menunggu: "bg-gold/15 text-[#8a6d1b]",
  Diproses: "bg-sky-100 text-sky-800",
  Dikirim: "bg-violet-100 text-violet-800",
  Selesai: "bg-green-100 text-green-800",
  Dibatalkan: "bg-brand-red/10 text-brand-red",
};
