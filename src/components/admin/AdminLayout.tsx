import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  User,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/utils";

/** Menu sidebar admin - Bahasa Indonesia penuh (sesuai desain Pencil). */
const MENU = [
  { to: "/admin", label: "Dasbor", icon: LayoutDashboard, exact: true },
  { to: "/admin/produk", label: "Produk", icon: Package, exact: false },
  { to: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart, exact: false },
  { to: "/admin/pelanggan", label: "Pelanggan", icon: Users, exact: false },
  {
    to: "/admin/pengaturan",
    label: "Pengaturan",
    icon: Settings,
    exact: false,
  },
];

/**
 * Kerangka halaman admin: sidebar kiri (desktop) / drawer (mobile+tablet),
 * topbar dengan judul halaman + tombol hamburger.
 * Lebar konten dibatasi agar tabel nyaman di tablet.
 */
export function AdminLayout({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const { pathname } = useLocation();

  const sidebar = (onNav: () => void) => (
    <div className="flex h-full flex-col bg-ink text-cream">
      <Link
        to="/admin"
        onClick={onNav}
        className="flex items-center justify-center border-b border-white/10 px-6 py-6"
        aria-label="Dasbor Batik Jogja"
      >
        {/* Logo terang di atas latar gelap */}
        <span className="rounded bg-cream px-3 py-1.5">
          <Logo height={28} />
        </span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {MENU.map((m) => {
          const active = m.exact
            ? pathname === m.to
            : pathname === m.to || pathname.startsWith(m.to + "/");
          return (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-cream font-semibold text-ink"
                  : "text-cream/70 hover:bg-white/10 hover:text-cream",
              )}
            >
              <m.icon className="h-5 w-5 shrink-0" />
              {m.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => {
            onNav();
            logout().finally(() => navigate("/admin/login"));
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        {sidebar(() => {})}
      </aside>

      {/* Drawer mobile/tablet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
          />
          <aside className="anim-drawer absolute left-0 top-0 h-full w-72 max-w-[85vw]">
            {sidebar(() => setOpen(false))}
            <button
              aria-label="Tutup menu admin"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 text-cream/70 hover:text-cream"
            >
              <X className="h-6 w-6" />
            </button>
          </aside>
        </div>
      )}

      {/* Kolom konten */}
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <button
              className="rounded-lg border border-line p-2 lg:hidden"
              aria-label="Buka menu admin"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-medium sm:text-3xl">
                {title}
              </h1>
              {sub && (
                <p className="truncate text-xs text-sub sm:text-sm">{sub}</p>
              )}
            </div>
            {action && (
              <div className="hidden shrink-0 items-center gap-2 min-[480px]:flex">
                {action}
              </div>
            )}
            {/* Ikon akun (sesuai Topbar frame Pencil: Menu + Logo + User) */}
            <Link
              to="/admin/pengaturan"
              aria-label="Akun admin"
              className="shrink-0 rounded-lg border border-line p-2 hover:border-ink"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
