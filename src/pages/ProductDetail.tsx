import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Scale,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS } from "@/data/products";
import { PINTEREST_GALLERY } from "@/data/gallery";
import { fetchProductRaw, toProduct } from "@/lib/api";
import type { ApiProductRaw } from "@/lib/api";
import { LOCAL_GALLERY } from "@/lib/images";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { getDetail } from "@/types";
import type { Product, ProductColor } from "@/types";
import { cn, formatIDR } from "@/lib/utils";

/** Bintang rating kecil (4 penuh + 1 redup ala desain). */
function Stars({ value = 4 }: { value?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Rating ${value} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < value ? "fill-gold text-gold" : "fill-line text-line",
          )}
        />
      ))}
    </span>
  );
}

const ACCORDIONS = ["SIZE GUIDE", "MATERIAL & CARE", "SHIPPING & RETURNS"];

/**
 * Halaman detail produk (/produk/:slug).
 * Galeri kiri + info kanan (desktop), menumpuk di mobile.
 */
export function ProductDetail() {
  const { slug } = useParams();
  // Data awal mock (cat tampil), disegarkan dari API bila terjangkau.
  const [api, setApi] = useState<ApiProductRaw | null>(null);
  useEffect(() => {
    if (!slug) return;
    let alive = true;
    fetchProductRaw(slug)
      .then((raw) => {
        if (alive) setApi(raw);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  const mock = PRODUCTS.find((p) => p.slug === slug);
  const product: Product | undefined = api ? toProduct(api) : mock;
  const addItem = useCart((s) => s.addItem);
  const openCart = useUi((s) => s.openCart);

  // Hooks harus di atas early-return.
  const gallery = useMemo(() => {
    // Galeri API (terurut) diutamakan bila ada.
    if (api?.images && api.images.length > 0) {
      return api.images.map((i) => i.url);
    }
    if (!product) return [];
    // Galeri detail: foto utama lokal + 3 foto Pinterest yang BERBEDA
    // untuk tiap produk (lihat src/data/gallery.ts).
    const pinterest = PINTEREST_GALLERY[product.id] ?? [];
    if (pinterest.length > 0) {
      return [product.image, ...pinterest];
    }
    // Fallback: foto lokal tambahan + produk sejenis.
    const extras = (LOCAL_GALLERY[product.id] ?? []).map((f) => `/images/${f}`);
    const siblings = PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id,
    ).slice(0, 2);
    return [product.image, ...extras, ...siblings.map((s) => s.image)].slice(
      0,
      3,
    );
  }, [api, product]);
  const [photo, setPhoto] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState<string | null>("SIZE GUIDE");

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-24 text-center">
        <p className="font-display text-3xl">Produk tidak ditemukan</p>
        <Link to="/" className="mt-4 inline-block text-sm underline">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const detail = getDetail(product);

  // Varian live dari API (warna/ukuran/stok) menimpa default mock.
  const apiColors: ProductColor[] | null = useMemo(() => {
    if (!api?.variants || api.variants.length === 0) return null;
    const seen = new Map<string, string>();
    for (const v of api.variants) {
      if (!seen.has(v.color_name)) seen.set(v.color_name, v.color_hex);
    }
    return [...seen].map(([name, hex]) => ({ name, hex }));
  }, [api]);

  const stockBySize: Record<string, number> | null = useMemo(() => {
    if (!api?.variants || api.variants.length === 0) return null;
    const acc: Record<string, number> = {};
    for (const v of api.variants) {
      acc[v.size] = (acc[v.size] ?? 0) + v.stock;
    }
    return acc;
  }, [api]);

  const colors = apiColors ?? detail.colors;
  const liveSizes = stockBySize ? Object.keys(stockBySize) : null;
  // Tampilkan 2XL sebagai nonaktif bila tak tersedia (sesuai desain).
  const sizes = (liveSizes ?? detail.sizes).includes("2XL")
    ? (liveSizes ?? detail.sizes)
    : [...(liveSizes ?? detail.sizes), "2XL"];
  const isOff = (s: string) =>
    stockBySize ? (stockBySize[s] ?? 0) <= 0 : !detail.sizes.includes(s);

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
      },
      qty,
    );
    openCart();
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-6 lg:px-14 lg:pt-10">
      {/* Breadcrumb ringkas */}
      <nav className="flex gap-2 text-[11px] tracking-wide text-sub">
        <Link to="/" className="hover:text-ink">
          BERANDA
        </Link>
        <span>/</span>
        <Link to={`/${product.category}`} className="uppercase hover:text-ink">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate font-semibold text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galeri */}
        <Reveal>
          <div>
            <img
              src={gallery[photo]}
              alt={product.name}
              className="aspect-[3/4] w-full bg-cream-deep object-cover"
            />
            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setPhoto(i)} aria-label={`Foto ${i + 1}`}>
                  <img
                    src={g}
                    alt={`${product.name} - foto ${i + 1}`}
                    loading="lazy"
                    className={cn(
                      "aspect-square w-full rounded-sm object-cover transition-opacity",
                      i === photo
                        ? "outline outline-2 outline-ink"
                        : "opacity-80 hover:opacity-100",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Info */}
        <Reveal delay={120}>
          <div className="flex flex-col gap-4">
            <p className="text-[11px] tracking-[3px] text-sub">
              KOLEKSI {product.category.toUpperCase()} · BATIK TULIS
            </p>
            <h1 className="font-display text-4xl font-medium lg:text-[38px]">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <Stars value={Math.round(product.rating ?? 4)} />
              <span className="text-[13px] text-sub underline">
                {product.rating ?? 4.8} · {product.reviews ?? 126} ulasan
              </span>
            </div>
            <p className="text-2xl font-bold">{formatIDR(product.price)}</p>
            <p className="text-sm leading-relaxed text-sub">
              {api?.description ?? detail.description}
            </p>
            <p className="text-xs text-muted-light">
              SKU {api?.sku ?? detail.sku} · Kategori {product.category} ·{" "}
              {api?.motif ?? detail.motif}
            </p>

            {/* Warna */}
            <div>
              <p className="text-xs font-semibold tracking-[2px]">
                WARNA -{" "}
                <span className="font-normal text-sub">
                  {colors[color]?.name ?? detail.colors[0].name}
                </span>
              </p>
              <div className="mt-2 flex gap-3">
                {colors.map((c, i) => (
                  <button
                    key={c.name}
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => setColor(i)}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      i === color &&
                        "outline outline-2 outline-offset-2 outline-ink",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Ukuran */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[2px]">UKURAN</p>
                <button className="text-xs text-sub underline">
                  Panduan Ukuran
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const off = isOff(s);
                  const sel = size === s && !off;
                  return (
                    <button
                      key={s}
                      disabled={off}
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-12 min-w-14 border px-3 text-[13px]",
                        sel
                          ? "border-ink bg-ink font-bold text-cream"
                          : "border-line text-ink",
                        off && "cursor-not-allowed text-muted-light",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty + CTA - menumpuk vertikal di HP sangat kecil */}
            <div className="mt-2 flex flex-col gap-3 min-[420px]:flex-row">
              <div className="flex h-[54px] w-full items-center justify-between border border-line px-4 min-[420px]:w-32">
                <button
                  aria-label="Kurangi"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold">{qty}</span>
                <button
                  aria-label="Tambah"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                className="h-auto min-h-[54px] flex-1 px-3 py-3 text-xs tracking-wide sm:text-sm"
                onClick={handleAdd}
              >
                TAMBAH KE KERANJANG
              </Button>
            </div>

            <div className="flex gap-6 text-xs tracking-wide text-sub">
              <button className="flex items-center gap-2 hover:text-ink">
                <Heart className="h-4 w-4" /> Wishlist
              </button>
              <button className="flex items-center gap-2 hover:text-ink">
                <Scale className="h-4 w-4" /> Bandingkan
              </button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-sub">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Retur 30 hari
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> Gratis ongkir min. Rp250rb
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Luntur alami wajar
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Deskripsi + akordeon */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Deskripsi Produk</h2>
          <p className="mt-4 text-sm leading-loose text-sub">
            {api?.description ?? detail.description} Potongan modern dengan
            bukaan kancing tanam dan belahan samping rendah - nyaman dipakai
            duduk maupun bergerak.
          </p>
          <dl className="mt-6 space-y-4">
            {[
              ["Material", api?.material ?? detail.material],
              ["Motif", api?.motif ?? detail.motif],
              ["Perawatan", "Cuci tangan dengan lerak, jemur di tempat teduh"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] tracking-[2px] text-muted-light">
                  {k.toUpperCase()}
                </dt>
                <dd className="mt-1 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          {ACCORDIONS.map((a) => (
            <div key={a} className="border-t border-line last:border-b">
              <button
                onClick={() => setOpenAcc(openAcc === a ? null : a)}
                className="flex w-full items-center justify-between py-5 text-[13px] font-semibold tracking-[2px]"
              >
                {a}
                <span
                  className={`text-lg font-normal transition-transform duration-300 ${openAcc === a ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <div className={`acc-panel ${openAcc === a ? "open" : ""}`}>
                <div className="acc-inner">
                  <p className="pb-5 text-sm leading-relaxed text-sub">
                    {a === "SIZE GUIDE"
                      ? "S: LD 88 · M: LD 92 · L: LD 96 · XL: LD 100. Jika di antara dua ukuran, pilih yang lebih besar."
                      : a === "MATERIAL & CARE"
                        ? "100% katun primisima, pewarna alami indigo dan soga. Cuci tangan, jangan diperas, setrika suhu sedang berlapis kain."
                        : "Gratis ongkir min. belanja Rp250.000 (Jawa). Retur 30 hari untuk produk belum dipakai dengan label terpasang."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
