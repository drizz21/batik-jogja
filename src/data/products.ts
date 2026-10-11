import type { Category, Product } from "@/types";

/**
 * Katalog mock - isi dan harga disalin dari desain Pencil.
 * Seluruh `image` memakai foto asli folder public/images/.
 * Dipakai sebagai cat tampil + fallback bila API tidak terjangkau.
 */
export const CATEGORIES: Category[] = [
  { slug: "wanita", label: "Wanita" },
  { slug: "pria", label: "Pria" },
  { slug: "anak", label: "Anak" },
  { slug: "aksesori", label: "Aksesori" },
];

export const PRODUCTS: Product[] = [
  // ---- Wanita ----
  {
    id: "p01",
    slug: "kebaya-batik-mega-mendung",
    name: "Kebaya Batik Mega Mendung",
    category: "wanita",
    price: 585000,
    image: "/images/kebaya-batik-mega-mendung.jpg",
    isNew: true,
    isBestSeller: true,
    rating: 4.8,
    reviews: 126,
  },
  {
    id: "p02",
    slug: "dress-batik-sarimuka",
    name: "Dress Batik Sarimuka",
    category: "wanita",
    price: 425000,
    image: "/images/dress-batik-sarimuka.jpg",
  },
  {
    id: "p03",
    slug: "kemeja-tunic-batik",
    name: "Kemeja Tunic Batik",
    category: "wanita",
    price: 365000,
    image: "/images/kemeja-tunic-batik.jpg",
  },
  {
    id: "p04",
    slug: "blus-batik-kawung",
    name: "Blus Batik Kawung",
    category: "wanita",
    price: 315000,
    image: "/images/blus-batik-kawung.jpg",
  },
  {
    id: "p05",
    slug: "rok-lilit-batik",
    name: "Rok Lilit Batik",
    category: "wanita",
    price: 285000,
    image: "/images/rok-lilit-batik.jpg",
  },
  {
    id: "p06",
    slug: "cardigan-batik-print",
    name: "Cardigan Batik Print",
    category: "wanita",
    price: 345000,
    image: "/images/cardigan-batik-print.jpg",
  },
  {
    id: "p07",
    slug: "syal-batik-lemah",
    name: "Syal Batik Lemah",
    category: "aksesori",
    price: 165000,
    image: "/images/syal-batik-lemah.jpg",
  },
  {
    id: "p08",
    slug: "dress-batik-sekar-jagad",
    name: "Dress Batik Sekar Jagad",
    category: "wanita",
    price: 495000,
    image: "/images/dress-batik-sekar-jagad.jpg",
    isNew: true,
  },
  // ---- Pria ----
  {
    id: "p10",
    slug: "kemeja-batik-sekar-jagad",
    name: "Kemeja Batik Sekar Jagad",
    category: "pria",
    price: 345000,
    image: "/images/koleksi-pria-1.jpg",
  },
  {
    id: "p11",
    slug: "celana-batik-lurik",
    name: "Celana Batik Lurik",
    category: "pria",
    price: 265000,
    image: "/images/celana-batik-lurik.jpg",
  },
  {
    id: "p12",
    slug: "jaket-batik-abstrak",
    name: "Jaket Batik Abstrak",
    category: "pria",
    price: 475000,
    image: "/images/batik-ceplok.jpg",
    isBestSeller: true,
  },
  {
    id: "p13",
    slug: "sweater-batik-motif-halus",
    name: "Sweater Batik Motif Halus",
    category: "pria",
    price: 425000,
    image: "/images/sweater-batik-motif-halus.jpg",
  },
  {
    id: "p15",
    slug: "sarung-batik",
    name: "Sarung Batik",
    category: "pria",
    price: 245000,
    image: "/images/sarung-batik.jpg",
  },
  {
    id: "p16",
    slug: "sakro-batik-canting",
    name: "Sakro Batik Canting",
    category: "aksesori",
    price: 295000,
    image: "/images/sakro-batik-canting.jpg",
  },
  // ---- Anak ----
  {
    id: "p17",
    slug: "kebaya-anak-koral",
    name: "Kebaya Anak Koral",
    category: "anak",
    price: 215000,
    image: "/images/kebaya-anak-koral.jpg",
    isNew: true,
  },
  {
    id: "p18",
    slug: "set-kemeja-batik-anak",
    name: "Set Kemeja Batik Anak",
    category: "anak",
    price: 195000,
    image: "/images/batik-anak-2.jpg",
  },
  {
    id: "p19",
    slug: "rok-batik-anak",
    name: "Rok Batik Anak",
    category: "anak",
    price: 165000,
    image: "/images/rok-batik-anak.jpg",
  },
  {
    id: "p20",
    slug: "kaos-batik-tulis-anak",
    name: "Kaos Batik Tulis Anak",
    category: "anak",
    price: 145000,
    image: "/images/batik-anak-1.jpg",
  },
  {
    id: "p21",
    slug: "celana-batik-anak",
    name: "Celana Batik Anak",
    category: "anak",
    price: 155000,
    image: "/images/celana-batik-anak.jpg",
  },
  {
    id: "p22",
    slug: "dress-batik-anak",
    name: "Dress Batik Anak",
    category: "anak",
    price: 225000,
    image: "/images/batik-anak-3.jpg",
    isNew: true,
  },
  {
    id: "p23",
    slug: "jaket-batik-anak",
    name: "Jaket Batik Anak",
    category: "anak",
    price: 245000,
    image: "/images/jaket-batik-anak.jpg",
  },
  {
    id: "p24",
    slug: "topi-batik-anak",
    name: "Topi Batik Anak",
    category: "aksesori",
    price: 95000,
    image: "/images/topi-batik-anak.jpg",
  },
  // ---- Koleksi Terbaru (sorotan) ----
  {
    id: "p25",
    slug: "kebaya-mega-mendung-tulis",
    name: "Kebaya Mega Mendung Tulis",
    category: "wanita",
    price: 690000,
    image: "/images/batik-tulis.jpg",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p26",
    slug: "dress-mega-mendung",
    name: "Dress Mega Mendung",
    category: "wanita",
    price: 465000,
    image: "/images/dress-mega-mendung.jpg",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p27",
    slug: "kemeja-parang-rusak",
    name: "Kemeja Parang Rusak",
    category: "pria",
    price: 355000,
    image: "/images/kemeja-parang-rusak.jpg",
    isNew: true,
  },
  {
    id: "p28",
    slug: "jaket-batik-malam",
    name: "Jaket Batik Malam",
    category: "pria",
    price: 525000,
    image: "/images/jaket-batik-malam.jpg",
    isNew: true,
  },
];

/** Ambil produk berdasar id (dipakai cart store & halaman detail). */
export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Daftar id untuk section "Koleksi Terbaru" di Home. */
export const NEW_ARRIVALS: string[] = ["p01", "p10", "p26", "p17"];

/** Daftar id untuk section "Best Seller" di Home. */
export const BEST_SELLERS: string[] = ["p25", "p01", "p12", "p26"];

/** Foto editorial - aset asli folder public/images/. */
export const EDITORIAL = {
  hero: "/images/batik-parang-main.png",
  wanita: "/images/editorial-wanita.jpg",
  pria: "/images/editorial-pria.jpg",
  anak: "/images/editorial-anak.jpg",
  keluarga: "/images/editorial-keluarga.jpg",
  motif: "/images/batik-semen.jpg",
  tokoh: "/images/tokoh-perajin.jpg",
};
