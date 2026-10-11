import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/product/SectionHeader";
import { PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/types";
import type { Product } from "@/types";

/** Konfigurasi tiap halaman katalog. */
export interface CategoryConfig {
  eyebrow: string;
  title: string;
  sub: string;
  /** Filter pills: label + pencocokan nama produk (kata kunci). */
  pills: { label: string; match?: string }[];
  /** Kriteria produk yang tampil di halaman ini. */
  select: (slug: CategorySlug, isNew?: boolean) => boolean;
}

export const CATEGORY_PAGES: Record<string, CategoryConfig> = {
  wanita: {
    eyebrow: "KOLEKSI WANITA",
    title: "Anggun Tanpa Upaya",
    sub: "Kebaya modern sampai blus harian. Motif Yogyakarta klasik dengan potongan yang mengikuti tubuh.",
    pills: [
      { label: "Semua" },
      { label: "Kebaya", match: "kebaya" },
      { label: "Dress", match: "dress" },
      { label: "Blus", match: "blus" },
    ],
    select: (slug) => slug === "wanita",
  },
  pria: {
    eyebrow: "KOLEKSI PRIA",
    title: "Rapi Setiap Suasana",
    sub: "Kemeja dan celana batik yang rapi untuk rapat, santai untuk akhir pekan.",
    pills: [
      { label: "Semua" },
      { label: "Kemeja", match: "kemeja" },
      { label: "Celana", match: "celana" },
      { label: "Jaket", match: "jaket" },
    ],
    select: (slug) => slug === "pria",
  },
  anak: {
    eyebrow: "KOLEKSI ANAK",
    title: "Tahan Main, Tetap Rapi",
    sub: "Batik yang tahan main. Lembut di kulit, kuat di jahitan.",
    pills: [
      { label: "Semua" },
      { label: "Kemeja", match: "kemeja" },
      { label: "Dress", match: "dress" },
      { label: "Rok", match: "rok" },
    ],
    select: (slug) => slug === "anak",
  },
  terbaru: {
    eyebrow: "BARU SETIAP BULAN",
    title: "Koleksi Terbaru",
    sub: "Motif baru langsung dari studio kami di Kotagede.",
    pills: [
      { label: "Semua" },
      { label: "Wanita", match: "__cat:wanita" },
      { label: "Pria", match: "__cat:pria" },
      { label: "Anak", match: "__cat:anak" },
    ],
    select: (_slug, isNew) => isNew === true,
  },
};

/**
 * Halaman katalog generik - dipakai /wanita, /pria, /anak, /terbaru.
 * Grid 2 kolom (mobile) → 4 kolom (desktop), pills filter lokal.
 * Data awal mock, disegarkan dari API bila terjangkau.
 */
export function CategoryPage({ page }: { page: string }) {
  const cfg = CATEGORY_PAGES[page];
  const [active, setActive] = useState("Semua");
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    let alive = true;
    const params: Record<string, string> =
      page === "terbaru" ? { is_new: "1" } : { category: page };
    fetchProducts(params)
      .then((list) => {
        if (alive && list.length > 0) setCatalog(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [page]);

  const items = useMemo(() => {
    const base = catalog.filter((p) => cfg.select(p.category, p.isNew));
    const pill = cfg.pills.find((x) => x.label === active);
    if (!pill?.match) return base;
    if (pill.match.startsWith("__cat:")) {
      const cat = pill.match.slice("__cat:".length);
      return base.filter((p) => p.category === cat);
    }
    return base.filter((p) =>
      p.name.toLowerCase().includes(pill.match!.toLowerCase()),
    );
  }, [cfg, active, catalog]);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-14 lg:pt-[72px]">
      <SectionHeader eyebrow={cfg.eyebrow} title={cfg.title} sub={cfg.sub} />
      <div className="no-scrollbar mt-8 flex justify-start gap-2 overflow-x-auto sm:justify-center">
        {cfg.pills.map((f) => (
          <button
            key={f.label}
            onClick={() => setActive(f.label)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[13px]",
              active === f.label
                ? "bg-ink text-cream"
                : "border border-line text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="mt-12 text-center text-sm text-sub">
          Belum ada produk pada filter ini.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
