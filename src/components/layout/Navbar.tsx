import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils";

/** Tautan navigasi utama toko. */
const LINKS = [
  { to: "/wanita", label: "Wanita" },
  { to: "/pria", label: "Pria" },
  { to: "/anak", label: "Anak" },
  { to: "/terbaru", label: "Koleksi Terbaru" },
];

/**
 * Navbar toko - sticky, responsif:
 * - Desktop (>=lg): wordmark kiri, link tengah, ikon kanan.
 * - Mobile/tablet: hamburger membuka panel menu geser.
 * TODO: ganti wordmark teks dengan <img src="/logo-batik-jogja.png">.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useUi((s) => s.openCart);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-[88px] lg:px-14">
        {/* Kiri: hamburger (mobile) + wordmark */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" aria-label="Batik Jogja">
            <Logo height={40} />
          </Link>
        </div>

        {/* Tengah: link desktop */}
        <div className="hidden items-center gap-9 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn("text-sm", isActive ? "font-semibold text-ink" : "text-sub")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Kanan: ikon aksi + badge jumlah keranjang */}
        <div className="flex items-center gap-5">
          <button aria-label="Cari" className="hidden sm:block">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Akun" className="hidden sm:block">
            <User className="h-5 w-5" />
          </button>
          <button
            aria-label="Keranjang"
            className="relative"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-cream">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Panel menu mobile/tablet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="anim-drawer absolute left-0 top-0 flex h-full w-72 flex-col bg-cream p-6">
            <div className="flex items-center justify-between">
              <Logo height={32} />
              <button aria-label="Tutup menu" onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-1">
              {[{ to: "/", label: "Beranda" }, ...LINKS].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "border-b border-line py-4 font-display text-2xl",
                      isActive ? "text-ink" : "text-sub",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
