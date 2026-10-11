import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Input } from "@/components/ui/input";
import { adminCustomers, ApiError } from "@/lib/api";
import type { AdminCustomerRaw, Paged } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { formatIDR } from "@/lib/utils";

/** Bergabung ISO → "Jan 2025". */
function joinedOn(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso.slice(0, 10)
    : d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

/**
 * Daftar pelanggan admin - data live (cari + paginasi server) beserta
 * agregat jumlah pesanan & total belanja dari API.
 */
export function AdminCustomers() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [paged, setPaged] = useState<Paged<AdminCustomerRaw> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const res = await adminCustomers({ q: query, page });
        if (alive) setPaged(res);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setError(e instanceof Error ? e.message : "Gagal memuat pelanggan.");
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, page, logout, navigate]);

  const items = paged?.data ?? [];

  return (
    <AdminLayout
      title="Pelanggan"
      sub={paged ? `${paged.total} pelanggan terdaftar.` : "Memuat…"}
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
        <Input
          placeholder="Cari nama atau email…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="bg-white pl-9"
        />
      </div>

      {error && (
        <p className="mt-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {error}
        </p>
      )}

      {/* Tabel (tablet ke atas) */}
      <div className="mt-4 hidden overflow-x-auto border border-line bg-white sm:block">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-[1px] text-sub">
              <th className="px-5 py-3 font-semibold">NAMA</th>
              <th className="px-5 py-3 font-semibold">KOTA</th>
              <th className="px-5 py-3 font-semibold">PESANAN</th>
              <th className="px-5 py-3 font-semibold">TOTAL BELANJA</th>
              <th className="px-5 py-3 font-semibold">BERGABUNG</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="border-b border-line last:border-0 hover:bg-cream/60"
              >
                <td className="px-5 py-3">
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-xs text-sub">{c.email}</span>
                </td>
                <td className="px-5 py-3">{c.city ?? "-"}</td>
                <td className="px-5 py-3">{c.orders_count}x</td>
                <td className="px-5 py-3 font-bold">
                  {formatIDR(Number(c.spent_sum ?? 0))}
                </td>
                <td className="px-5 py-3 text-sub">{joinedOn(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-5 text-sm text-sub">Memuat…</p>}
      </div>

      {/* Kartu (HP) */}
      <ul className="mt-4 space-y-3 sm:hidden">
        {items.map((c) => (
          <li key={c.id} className="border border-line bg-white p-4">
            <p className="text-sm font-bold">{c.name}</p>
            <p className="text-xs text-sub">{c.email}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-sub">
                {c.city ?? "-"} · {c.orders_count}x pesan
              </span>
              <span className="font-bold">
                {formatIDR(Number(c.spent_sum ?? 0))}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {paged && paged.total === 0 && !loading && (
        <p className="mt-8 text-center text-sm text-sub">
          Pelanggan tidak ditemukan.
        </p>
      )}

      {paged && (
        <AdminPagination
          page={paged.current_page}
          pages={paged.last_page}
          onPage={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          from={paged.from ?? 0}
          to={paged.to ?? 0}
          total={paged.total}
          unit="pelanggan"
        />
      )}
    </AdminLayout>
  );
}
