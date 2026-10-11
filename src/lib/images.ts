/**
 * Manifest foto lokal - SEMUA gambar website berasal dari folder
 * `public/images/` (aset asli desain Pencil). Tidak ada URL eksternal.
 *
 * Kunci: id produk mock (p01..p28, lihat src/data/products.ts) atau
 * kunci editorial: hero, wanita, pria, anak, keluarga, motif, tokoh.
 *
 * Catatan pemetaan:
 * - p12 (Jaket Batik Abstrak) memakai foto kemeja-parang-rusak.jpg sebagai
 *   foto utama kartu; galeri detailnya memakai foto Pinterest (lihat
 *   src/data/gallery.ts).
 * - p25 memakai foto proses canting (batik-tulis.jpg) yang temanya pas.
 */
export const LOCAL_IMAGES: Record<string, string> = {
  // Produk - foto asli folder public/images/.
  p01: "kebaya-batik-mega-mendung.jpg",
  p02: "dress-batik-sarimuka.jpg",
  p03: "kemeja-tunic-batik.jpg",
  p04: "blus-batik-kawung.jpg",
  p05: "rok-lilit-batik.jpg",
  p06: "cardigan-batik-print.jpg",
  p07: "syal-batik-lemah.jpg",
  p08: "dress-batik-sekar-jagad.jpg",
  p10: "koleksi-pria-1.jpg",
  p11: "celana-batik-lurik.jpg",
  p12: "batik-ceplok.jpg",
  p13: "sweater-batik-motif-halus.jpg",
  p15: "sarung-batik.jpg",
  p16: "sakro-batik-canting.jpg",
  p17: "kebaya-anak-koral.jpg",
  p18: "batik-anak-2.jpg",
  p19: "rok-batik-anak.jpg",
  p20: "batik-anak-1.jpg",
  p21: "celana-batik-anak.jpg",
  p22: "batik-anak-3.jpg",
  p23: "jaket-batik-anak.jpg",
  p24: "topi-batik-anak.jpg",
  p25: "batik-tulis.jpg",
  p26: "dress-mega-mendung.jpg",
  p27: "kemeja-parang-rusak.jpg",
  p28: "jaket-batik-malam.jpg",
  // Editorial.
  hero: "batik-parang-main.png",
  wanita: "editorial-wanita.jpg",
  pria: "editorial-pria.jpg",
  anak: "editorial-anak.jpg",
  keluarga: "editorial-keluarga.jpg",
  motif: "batik-semen.jpg",
  tokoh: "tokoh-perajin.jpg",
};

/** Foto lokal default bila kunci tak terdaftar (tidak pernah eksternal). */
export const DEFAULT_IMAGE = "/images/batik-tulis.jpg";

/** Foto galeri tambahan per produk (id mock) - close-up motif & sudut
 * lain. Dipakai PDP saat API tidak terjangkau; saat API hidup, galeri
 * berasal dari tabel product_images (terisi sama via seeder). */
export const LOCAL_GALLERY: Record<string, string[]> = {
  p04: ["batik-kawung.jpeg"],
  p10: ["koleksi-pria-2.jpg"],
  p13: ["batik-ceplok.jpg"],
  p18: ["set-kemeja-batik-anak.jpg", "batik-anak-1.jpg"],
  p22: ["batik-anak-2.jpg"],
};

/**
 * URL foto yang disajikan backend lokal (unggahan admin di
 * public/uploads/ - localhost/127.0.0.1) tetap dipakai apa adanya;
 * URL host lain tetap dijaga agar tidak pernah tampil (aturan desain:
 * nol URL gambar eksternal).
 */
function isLocalBackendUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

/**
 * Kembalikan path foto lokal untuk kunci tersebut.
 * `fallback` hanya dipakai untuk URL yang sudah lokal.
 */
export function resolveImage(key: string, fallback: string): string {
  if (isLocalBackendUrl(fallback)) return fallback;
  const file = LOCAL_IMAGES[key];
  if (file) return `/images/${file}`;
  return fallback.startsWith("http") ? DEFAULT_IMAGE : fallback;
}
