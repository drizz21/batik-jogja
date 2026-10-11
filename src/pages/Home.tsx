import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/product/SectionHeader";
import { EDITORIAL, PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Ambil produk berdasar daftar id dari katalog yang diberikan.
 * ID numerik API (String(id)) dan id mock ("p01") bisa hidup berdampingan:
 * pencocokan hanya berdasar id yang ada di katalog aktif.
 */
function byIds(list: Product[], ids: string[]): Product[] {
  return ids
    .map((id) => list.find((p) => p.slug === id))
    .filter((p): p is Product => p !== undefined);
}

/* ------------------------------------------------------------------ */
/* HERO - badge + headline serif tengah + foto full-width (kenburns)   */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section>
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 pb-10 pt-10 text-center sm:pt-12 lg:pt-[72px]">
        <h1 className="font-display text-4xl font-medium leading-[1.05] sm:text-6xl lg:text-[76px]">
          Warisan Budaya Kota Yogyakarta.
        </h1>
      </Reveal>
      <div className="overflow-hidden">
        <img
          src={EDITORIAL.hero}
          alt="Model berkebaya batik"
          className="kenburns h-[380px] w-full object-cover sm:h-[480px] lg:h-[640px]"
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* KOLEKSI TERBARU - pills filter fungsional + grid produk             */
/* ------------------------------------------------------------------ */
const FILTERS = ["Semua", "Wanita", "Pria", "Anak"] as const;

function NewArrivals({ all }: { all: Product[] }) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("Semua");

  const items = useMemo(() => {
    const news = all.filter((p) => p.isNew);
    const list =
      active === "Semua"
        ? news
        : news.filter((p) => p.category === active.toLowerCase());
    return list.slice(0, 4);
  }, [active, all]);

  return (
    <section className="mx-auto max-w-7xl py-14 lg:px-14 lg:py-[88px]">
      <SectionHeader eyebrow="KOLEKSI TERBARU" title="Koleksi Terbaru" />
      <div className="no-scrollbar mt-8 flex justify-start gap-2 overflow-x-auto px-5 sm:justify-center lg:justify-center">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors",
              active === f
                ? "bg-ink text-cream"
                : "border border-line text-ink hover:border-ink",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 px-4 sm:gap-x-4 sm:px-5 md:grid-cols-4 lg:gap-6 lg:px-0">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SPLIT SECTION - hero + carousel geser (2 terlihat, panah aktif).    */
/* Tiap section punya 4 produk sendiri; tanpa label NEW (sesuai        */
/* revisi). Desktop 55/45, mobile & tablet menumpuk.                   */
/* ------------------------------------------------------------------ */
function SplitSection({
  all,
  image,
  line1,
  line2,
  cta,
  ctaTo,
  slugs,
  flip = false,
}: {
  all: Product[];
  image: string;
  line1: string;
  line2: string;
  cta: string;
  ctaTo: string;
  /** Slug produk (stabil antara mock dan API - lihat seeder). */
  slugs: [string, string, string, string];
  flip?: boolean;
}) {
  const products = byIds(all, slugs);
  /** Indeks kartu pertama yang terlihat (0 .. jumlah-2). */
  const [index, setIndex] = useState(0);
  const max = Math.max(0, products.length - 2);

  const go = (dir: 1 | -1) =>
    setIndex((i) => Math.min(max, Math.max(0, i + dir)));

  return (
    <Reveal>
      {/* Kolom carousel SELALU di trek 55% agar ukuran kartu identik di
          semua section (Pria jadi acuan - tidak dikecilkan; Wanita/Anak/
          Keluarga menyesuaikan membesar). Mobile/tablet 1 kolom penuh. */}
      <section
        className={cn(
          "grid grid-cols-1",
          flip ? "lg:grid-cols-[55%_45%]" : "lg:grid-cols-[45%_55%]",
        )}
      >
        {/* Kiri: foto hero + judul overlay + CTA */}
        <div className="relative min-w-0 overflow-hidden">
          <img
            src={image}
            alt={`${line1} ${line2}`}
            loading="lazy"
            className="h-[300px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[420px] lg:h-[640px]"
          />
          <div className="absolute bottom-8 left-5 flex flex-col items-start gap-4 sm:left-8 lg:bottom-auto lg:left-14 lg:top-[348px]">
            <p className="text-[26px] font-extrabold leading-tight text-white sm:text-3xl lg:text-[44px]">
              {line1}
              <br />
              {line2}
            </p>
            <Link
              to={ctaTo}
              className="inline-flex h-9 items-center bg-cream px-5 text-[11px] font-medium text-ink transition-colors hover:bg-cream-deep sm:text-[13px]"
            >
              {cta}
            </Link>
          </div>
        </div>

        {/* Kanan: carousel geser + panah + dots */}
        <div
          className={cn(
            "flex min-w-0 flex-col justify-center gap-4 bg-white px-4 py-8 sm:px-6 lg:px-7",
            flip && "lg:order-first",
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              aria-label="Produk sebelumnya"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="shrink-0 rounded-full p-1 transition hover:bg-cream-deep disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            {/* Rel geser: tiap slide selebar 1/2 viewport carousel */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 50}%)` }}
              >
                {products.map((p) => (
                  <div key={p.id} className="w-1/2 shrink-0 px-2">
                    <ProductCard product={p} badge="none" />
                  </div>
                ))}
              </div>
            </div>
            <button
              aria-label="Produk berikutnya"
              onClick={() => go(1)}
              disabled={index === max}
              className="shrink-0 rounded-full p-1 transition hover:bg-cream-deep disabled:opacity-30"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
          {/* Indikator posisi */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: max + 1 }).map((_, i) => (
              <button
                key={i}
                aria-label={`Ke slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-ink" : "w-1.5 bg-line hover:bg-sub",
                )}
              />
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* BEST SELLER - selalu berlabel BEST SELLER (bukan NEW)               */
/* ------------------------------------------------------------------ */
function BestSeller({ all }: { all: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl py-14 lg:px-14 lg:py-20">
      <SectionHeader eyebrow="PALING LARIS" title="Best Seller" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 px-4 sm:gap-x-4 sm:px-5 md:grid-cols-4 lg:gap-6 lg:px-0">
        {byIds(all, [
          "kebaya-mega-mendung-tulis",
          "kebaya-batik-mega-mendung",
          "jaket-batik-abstrak",
          "dress-mega-mendung",
        ]).map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 80}>
            <ProductCard product={p} badge="best-seller" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BATIK KHAS - blok gelap editorial                                   */
/* ------------------------------------------------------------------ */
function Heritage() {
  return (
    <section className="bg-ink text-cream">
      <div className="overflow-hidden">
        <img
          src={EDITORIAL.motif}
          alt="Motif batik khas Yogyakarta"
          loading="lazy"
          className="h-[200px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[320px] lg:h-[560px]"
        />
      </div>
      <Reveal className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-5 py-10 lg:px-14 lg:py-12">
        <p className="text-[11px] tracking-[3px] text-muted-light">
          WARISAN KOTA
        </p>
        <h2 className="font-display text-4xl font-medium sm:text-5xl lg:text-[52px]">
          Batik Khas Yogyakarta
        </h2>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-light">
          Mega Mendung, Parang, Kawung, Sekar Jagad - motif yang lahir dari
          keraton.
        </p>
        <Button
          variant="light"
          size="pill"
          className="border border-cream bg-transparent text-cream hover:bg-cream hover:text-ink"
        >
          Kenali Motifnya
        </Button>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TOKOH KAMI - potret perajin + kutipan                               */
/* ------------------------------------------------------------------ */
const QUOTES = [
  {
    text: "Tangan yang telaten akan menghasilkan motif yang jujur. Batik kami tidak pernah diburu-buru.",
    by: "Ibu Sri Rahayu · Kepala Perajin, sejak 1994",
  },
  {
    text: "Merah soga dan biru indigo adalah warna jalan kita. Kami tetap memilihnya sendiri.",
    by: "Pak Hendar · Seniman Cap & Pewarna Alami",
  },
  {
    text: "Batik itu bukan sekadar kain. Ia adalah cerita, warisan, dan doa yang kami titipkan di setiap helai.",
    by: "Ibu Hanum · Perajin Batik Tulis",
  },
];

function Figures() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-14 lg:py-[88px]">
      <SectionHeader
        eyebrow="DI BALIK MOTIF"
        title="Tokoh Kami"
        sub="Perajin yang kami hormati - mereka yang memegang canting, membuat cap, dan mewarnai sejak kecil."
      />
      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[520px_1fr]">
        <Reveal>
          <img
            src={EDITORIAL.tokoh}
            alt="Perajin batik"
            loading="lazy"
            className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[600px]"
          />
        </Reveal>
        <div className="flex flex-col gap-6">
          {QUOTES.map((q, i) => (
            <Reveal key={q.by} delay={i * 120}>
              <blockquote className="border border-line p-6 transition-shadow hover:shadow-lg lg:p-7">
                <p className="font-display text-xl leading-snug lg:text-2xl">
                  “{q.text}”
                </p>
                <cite className="mt-3 block text-xs not-italic tracking-wide text-sub">
                  {q.by}
                </cite>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Halaman Beranda - susunan section sesuai desain Pencil (mobile-first).
 * Katalog awal = mock (cat langsung tampil), lalu diganti data API
 * saat `php artisan serve` terjangkau; gagal = tetap mock. */
export function Home() {
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    let alive = true;
    fetchProducts()
      .then((list) => {
        if (alive && list.length > 0) setCatalog(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main>
      <Hero />
      <NewArrivals all={catalog} />
      <SplitSection
        all={catalog}
        image={EDITORIAL.wanita}
        line1="KOLEKSI"
        line2="WANITA"
        cta="LIHAT KOLEKSI"
        ctaTo="/wanita"
        slugs={[
          "kebaya-batik-mega-mendung",
          "dress-mega-mendung",
          "dress-batik-sarimuka",
          "dress-batik-sekar-jagad",
        ]}
      />
      <SplitSection
        all={catalog}
        image={EDITORIAL.pria}
        line1="KOLEKSI"
        line2="PRIA"
        cta="LIHAT KOLEKSI"
        ctaTo="/pria"
        slugs={[
          "kemeja-batik-sekar-jagad",
          "celana-batik-lurik",
          "kemeja-parang-rusak",
          "jaket-batik-abstrak",
        ]}
        flip
      />
      <SplitSection
        all={catalog}
        image={EDITORIAL.anak}
        line1="KOLEKSI"
        line2="ANAK"
        cta="LIHAT KOLEKSI"
        ctaTo="/anak"
        slugs={[
          "set-kemeja-batik-anak",
          "kaos-batik-tulis-anak",
          "kebaya-anak-koral",
          "jaket-batik-anak",
        ]}
      />
      <SplitSection
        all={catalog}
        image={EDITORIAL.keluarga}
        line1="COUPLE & FAMILY"
        line2="COLLECTION"
        cta="CLICK HERE"
        ctaTo="/terbaru"
        slugs={[
          "kebaya-batik-mega-mendung",
          "kemeja-batik-sekar-jagad",
          "kebaya-mega-mendung-tulis",
          "dress-mega-mendung",
        ]}
        flip
      />
      <BestSeller all={catalog} />
      <Heritage />
      <Figures />
    </main>
  );
}
