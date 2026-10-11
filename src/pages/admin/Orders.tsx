import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Input } from "@/components/ui/input";
import { adminOrders, ApiError } from "@/lib/api";
import type { AdminOrderRaw, Paged } from "@/lib/api";
import { STATUS_STYLE } from "@/data/admin";
import { useAuth } from "@/stores/auth";
import { formatIDR } from "@/lib/utils";

const FILTERS = [
  "Semua",
  "Menunggu",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
] as const;

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
 * Daftar pesanan admin - data live (cari + filter status + paginasi
 * server). Kartu mobile mengikuti frame M: R1 ID + pill, R2 pelanggan + total.
 */
export function AdminOrders() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<(typeof FILTERS)[number]>("Semua");
  const [page, setPage] = useState(1);
  const [paged, setPaged] = useState<Paged<AdminOrderRaw> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const res = await adminOrders({
          q: query,
          status: active === "Semua" ? "" : active,
          page,
        });
        if (alive) setPaged(res);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setError(e instanceof Error ? e.message : "Gagal memuat pesanan.");
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, active, page, logout, navigate]);

  const items = paged?.data ?? [];

  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout
      title="Pesanan"
      sub={
        paged
          ? `${paged.total} pesanan ${active === "Semua" ? "masuk" : `berstatus ${active}`}.`
          : "Memuat…"
      }
    >
      {/* Tools: Search + dropdown status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
          <Input
            placeholder="Cari ID, nama, atau email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="bg-white pl-9"
          />
        </div>
        <select
          aria-label="Filter status pesanan"
          value={active}
          onChange={(e) => {
            setActive(e.target.value as (typeof FILTERS)[number]);
            setPage(1);
          }}
          className="h-11 border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "Semua" ? "Semua Status" : f}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {error}
        </p>
      )}

      {/* Tabel (tablet ke atas) */}
      <div className="mt-4 hidden overflow-x-auto border border-line bg-white sm:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-[1px] text-sub">
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">PELANGGAN</th>
              <th className="px-5 py-3 font-semibold">KOTA</th>
              <th className="px-5 py-3 font-semibold">ITEM</th>
              <th className="px-5 py-3 font-semibold">TOTAL</th>
              <th className="px-5 py-3 font-semibold">STATUS</th>
              <th className="px-5 py-3 font-semibold">TANGGAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                className="border-b border-line last:border-0 hover:bg-cream/60"
              >
                <td className="px-5 py-3 font-semibold">{o.code}</td>
                <td className="px-5 py-3">
                  {o.name}
                  <span className="block text-xs text-sub">{o.email}</span>
                </td>
                <td className="px-5 py-3">{o.city}</td>
                <td className="px-5 py-3">{o.items_count ?? "-"}</td>
                <td className="px-5 py-3 font-bold">{formatIDR(o.total)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status as keyof typeof STATUS_STYLE] ?? "bg-cream-deep text-sub"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sub">
                  {shortDate(o.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-5 text-sm text-sub">Memuat…</p>}
      </div>

      {/* Kartu (HP) - struktur frame M: R1 ID + pill, R2 pelanggan + total */}
      <ul className="mt-4 space-y-3 sm:hidden">
        {items.map((o) => (
          <li key={o.id} className="border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold">{o.code}</p>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[o.status as keyof typeof STATUS_STYLE] ?? "bg-cream-deep text-sub"}`}
              >
                {o.status}
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm">{o.name}</p>
                <p className="text-xs text-sub">
                  {o.city} · {shortDate(o.created_at)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold">{formatIDR(o.total)}</p>
            </div>
          </li>
        ))}
      </ul>

      {paged && paged.total === 0 && !loading && (
        <p className="mt-8 text-center text-sm text-sub">
          Belum ada pesanan yang cocok.
        </p>
      )}

      {paged && (
        <AdminPagination
          page={paged.current_page}
          pages={paged.last_page}
          onPage={goPage}
          from={paged.from ?? 0}
          to={paged.to ?? 0}
          total={paged.total}
          unit="pesanan"
        />
      )}
    </AdminLayout>
  );
}
