import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Kolom tautan footer. */
const COLS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Belanja",
    links: [
      { to: "/wanita", label: "Wanita" },
      { to: "/pria", label: "Pria" },
      { to: "/anak", label: "Anak" },
      { to: "/terbaru", label: "Koleksi Terbaru" },
    ],
  },
  {
    title: "Toko",
    links: [
      { to: "/", label: "Tentang Kami" },
      { to: "/", label: "Perajin" },
      { to: "/", label: "Butik" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { to: "/", label: "Pengiriman" },
      { to: "/", label: "Retur" },
      { to: "/", label: "Kontak" },
    ],
  },
];

/** Footer gelap - 1 kolom di mobile, 4 kolom di desktop. */
export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-14">
        <div>
          {/* Latar terang agar logo tetap terbaca di footer gelap */}
          <div className="inline-block rounded bg-cream p-2">
            <Logo height={48} />
          </div>
          <p className="mt-4 max-w-60 text-[13px] leading-relaxed text-muted-light">
            Batik tulis &amp; cap khas Yogyakarta. Pewarna alami, dikerjakan
            perajin sejak 1994.
          </p>
        </div>

        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-[13px] font-semibold tracking-[2px]">
              {c.title}
            </p>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-muted-light hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-5 pb-10 lg:px-14">
        <p className="font-display text-2xl">Gabung daftar kami</p>
        {done ? (
          <p className="mt-3 text-sm text-muted-light">
            Terima kasih! Cek email untuk konfirmasi.
          </p>
        ) : (
          <form
            className="mt-4 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setDone(true);
            }}
          >
            <Input
              type="email"
              required
              placeholder="Alamat email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/20 bg-transparent text-cream"
            />
            <Button type="submit" variant="light" className="shrink-0">
              Berlangganan
            </Button>
          </form>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-light sm:flex-row sm:justify-between lg:px-14">
          <span>© 2026 Batik Jogja</span>
          <span className="tracking-widest">
            Instagram&nbsp;&nbsp;&nbsp;Pinterest&nbsp;&nbsp;&nbsp;TikTok
          </span>
        </div>
      </div>
    </footer>
  );
}
