import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminOrders, adminProducts, adminStats, ApiError } from "@/lib/api";
import type { AdminOrderRaw, AdminStats, ApiProductRaw } from "@/lib/api";
import { SALES_BARS, STATUS_STYLE } from "@/data/admin";
import { useAuth } from "@/stores/auth";
import { formatIDR } from "@/lib/utils";

/** Grafik batang SVG murni - responsif, tanpa dependensi chart. */
function SalesChart() {
  const max = Math.max(...SALES_BARS);
  const W = 600;
  const H = 220;
  const gap = 12;
  const bw = (W - gap * (SALES_BARS.length - 1)) / SALES_BARS.length;
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-52 min-w-[480px] w-full sm:h-56"
        role="img"
        aria-label="Grafik penjualan 12 bulan"
      >
        {SALES_BARS.map((v, i) => {
          const h = (v / max) * (H - 30);
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={H - 20 - h}
              width={bw}
              height={h}
              rx={4}
              className={i === SALES_BARS.length - 2 ? "fill-ink" : "fill-line"}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** Tanggal ISO → "28 Sep 2026". */
function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso.slice(0, 10)
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/**
 * Dasbor admin: 4 kartu statistik, grafik penjualan, pesanan terbaru,
 * dan stok menipis - angka live dari API (grafik tren masih contoh
 * karena backend belum punya agregat harian).
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrderRaw[]>([]);
  const [lowStock, setLowStock] = useState<ApiProductRaw[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, o, p] = await Promise.all([
          adminStats(),
          adminOrders({ page: 1 }),
          adminProducts({ page: 1 }),
        ]);
        if (!alive) return;
        setStats(s);
        setOrders(o.data.slice(0, 5));
        // Stok menipis: 4 produk dengan total stok varian terkecil.
        setLowStock(
          [...p.data]
            .sort((a, b) => (a.stock_sum ?? 0) - (b.stock_sum ?? 0))
            .slice(0, 4),
        );
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setError(e instanceof Error ? e.message : "Gagal memuat dasbor.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [logout, navigate]);

  const cards = [
    {
      label: "Total Omzet",
      value: stats ? formatIDR(stats.omzet) : "…",
      delta: "Akumulasi di luar yang dibatalkan",
      icon: Wallet,
    },
    {
      label: "Pesanan",
      value: stats ? String(stats.orders) : "…",
      delta: "Seluruh pesanan masuk",
      icon: ShoppingCart,
    },
    {
      label: "Produk Aktif",
      value: stats ? String(stats.products) : "…",
      delta: "Tampil di katalog",
      icon: Package,
    },
    {
      label: "Pelanggan",
      value: stats ? stats.customers.toLocaleString("id-ID") : "…",
      delta: "Terdaftar via checkout",
      icon: Users,
    },
  ];

  return (
    <AdminLayout
      title="Dasbor"
      sub={`Hari ini · ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
      action={
        <Link
          to="/admin/produk/baru"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:opacity-90"
        >
          + Tambah Produk
        </Link>
      }
    >
      {error && (
        <p className="mb-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {error}
        </p>
      )}

      {/* Kartu statistik: 2 kolom (HP, sesuai frame M) → 2 tablet → 4 desktop */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="min-w-0 border border-line bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[10px] tracking-[1px] text-sub sm:text-xs">
                {c.label.toUpperCase()}
              </p>
              <c.icon className="h-4 w-4 shrink-0 text-sub sm:h-5 sm:w-5" />
            </div>
            <p className="mt-2 break-words font-display text-xl font-medium sm:text-2xl xl:text-3xl">
              {c.value}
            </p>
            <p className="mt-1 text-[11px] text-green-700 sm:text-xs">
              {c.delta}
            </p>
          </div>
        ))}
      </section>

      {/* grid-cols-1 eksplisit agar kolom tak melebar ikut min-content grafik */}
      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px] sm:mt-6">
        {/* Grafik */}
        <div className="border border-line bg-white p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Penjualan</h2>
            <p className="text-xs text-sub">
              Contoh tren · agregat harian menyusul
            </p>
          </div>
          <div className="mt-4">
            <SalesChart />
          </div>
        </div>

        {/* Stok menipis */}
        <div className="border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-2xl">Stok Menipis</h2>
          <ul className="mt-4 space-y-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt=""
                  className="h-12 w-10 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-brand-red">
                    Sisa {p.stock_sum ?? 0} pcs
                  </p>
                </div>
                <Link
                  to={`/admin/produk/${p.id}/ubah`}
                  className="shrink-0 text-xs font-semibold underline"
                >
                  Restok
                </Link>
              </li>
            ))}
            {lowStock.length === 0 && (
              <li className="text-sm text-sub">Memuat…</li>
            )}
          </ul>
        </div>
      </section>

      {/* Pesanan terbaru - tabel di sm+, kartu di HP */}
      <section className="mt-4 border border-line bg-white sm:mt-6">
        <div className="flex items-center justify-between p-5 sm:p-6 sm:pb-2">
          <h2 className="font-display text-2xl">Pesanan Terbaru</h2>
          <Link
            to="/admin/pesanan"
            className="flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Tabel (tablet ke atas) */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-[1px] text-sub">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">PELANGGAN</th>
                <th className="px-6 py-3 font-semibold">TOTAL</th>
                <th className="px-6 py-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-line last:border-0 hover:bg-cream/60"
                >
                  <td className="px-6 py-3 font-semibold">{o.code}</td>
                  <td className="px-6 py-3">{o.name}</td>
                  <td className="px-6 py-3 font-bold">{formatIDR(o.total)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status as keyof typeof STATUS_STYLE] ?? "bg-cream-deep text-sub"}`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Kartu (HP) */}
        <ul className="space-y-3 p-4 sm:hidden">
          {orders.map((o) => (
            <li key={o.id} className="border border-line p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{o.code}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[o.status as keyof typeof STATUS_STYLE] ?? "bg-cream-deep text-sub"}`}
                >
                  {o.status}
                </span>
              </div>
              <p className="mt-1 text-sm">{o.name}</p>
              <p className="mt-1 flex items-center justify-between text-sm">
                <span className="text-xs text-sub">
                  {shortDate(o.created_at)}
                </span>
                <span className="font-bold">{formatIDR(o.total)}</span>
              </p>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="text-sm text-sub">Belum ada pesanan.</li>
          )}
        </ul>
      </section>
    </AdminLayout>
  );
}
