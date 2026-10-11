import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Input } from "@/components/ui/input";
import {
  adminDeleteProduct,
  adminProducts,
  ApiError,
  fetchCategories,
} from "@/lib/api";
import type { ApiProductRaw, CategoryRaw, Paged } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { formatIDR } from "@/lib/utils";

const CAT_FALLBACK: CategoryRaw[] = [
  { id: 1, slug: "wanita", label: "Wanita" },
  { id: 2, slug: "pria", label: "Pria" },
  { id: 3, slug: "anak", label: "Anak" },
  { id: 4, slug: "aksesori", label: "Aksesori" },
];

/**
 * Daftar produk admin - data live dari API (cari + filter + paginasi
 * sisi server). Struktur mengikuti frame M: R1 thumb + N + S + Acts,
 * R2 Stok + pill Aktif. Hapus via DELETE + modal konfirmasi.
 */
export function AdminProducts() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [page, setPage] = useState(1);
  const [cats, setCats] = useState<CategoryRaw[]>(CAT_FALLBACK);
  const [paged, setPaged] = useState<Paged<ApiProductRaw> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<ApiProductRaw | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    // Debounce ringan agar tiap ketikan tidak menghantam server.
    const t = setTimeout(async () => {
      try {
        const res = await adminProducts({
          q: query,
          category: cat === "Semua" ? "" : cat.toLowerCase(),
          page,
        });
        if (alive) setPaged(res);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setError(e instanceof Error ? e.message : "Gagal memuat produk.");
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, cat, page, logout, navigate]);

  const items = paged?.data ?? [];
  const pages = paged?.last_page ?? 1;

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(String(toDelete.id));
      setToDelete(null);
      const res = await adminProducts({
        q: query,
        category: cat === "Semua" ? "" : cat.toLowerCase(),
        page: items.length === 1 && page > 1 ? page - 1 : page,
      });
      setPaged(res);
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus.");
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const acts = (p: ApiProductRaw) => (
    <>
      <Link
        to={`/admin/produk/${p.id}`}
        aria-label="Lihat detail produk"
        className="rounded-lg border border-line p-2 hover:border-ink"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        to={`/admin/produk/${p.id}/ubah`}
        aria-label="Ubah produk"
        className="rounded-lg border border-line p-2 hover:border-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        aria-label="Hapus produk"
        onClick={() => setToDelete(p)}
        className="rounded-lg border border-line p-2 text-brand-red hover:border-brand-red"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <AdminLayout
      title="Produk"
      sub={paged ? `${paged.total} produk ditampilkan.` : "Memuat…"}
      action={
        <Link
          to="/admin/produk/baru"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:opacity-90"
        >
          + Tambah Produk
        </Link>
      }
    >
      {/* Tombol Add full-width (mobile, sesuai frame M) */}
      <Link
        to="/admin/produk/baru"
        className="flex h-12 items-center justify-center gap-2 bg-ink text-sm font-semibold text-cream min-[480px]:hidden"
      >
        <Plus className="h-4 w-4" /> Tambah Produk
      </Link>

      {/* Toolbar: Search + dropdown kategori (frame: Search + DDs) */}
      <div className="mt-4 flex flex-col gap-3 min-[480px]:mt-0 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
          <Input
            placeholder="Cari nama atau SKU…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="bg-white pl-9"
          />
        </div>
        <select
          aria-label="Filter kategori"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(1);
          }}
          className="h-11 border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none"
        >
          <option value="Semua">Semua Kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.label}>
              {c.label}
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
              <th className="px-5 py-3 font-semibold">PRODUK</th>
              <th className="px-5 py-3 font-semibold">KATEGORI</th>
              <th className="px-5 py-3 font-semibold">HARGA</th>
              <th className="px-5 py-3 font-semibold">STOK</th>
              <th className="px-5 py-3 font-semibold">STATUS</th>
              <th className="px-5 py-3 text-right font-semibold">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className="border-b border-line last:border-0 hover:bg-cream/60"
              >
                <td className="px-5 py-3">
                  <Link
                    to={`/admin/produk/${p.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="h-12 w-10 shrink-0 object-cover"
                    />
                    <span>
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block text-xs text-sub">{p.sku}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3">{p.category?.label}</td>
                <td className="px-5 py-3 font-bold">{formatIDR(p.price)}</td>
                <td className="px-5 py-3">{p.stock_sum ?? 0} pcs</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "aktif" ? "bg-green-100 text-green-800" : "bg-cream-deep text-sub"}`}
                  >
                    {p.status === "aktif" ? "Aktif" : "Arsip"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center justify-end gap-2">
                    {acts(p)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-5 text-sm text-sub">Memuat…</p>}
      </div>

      {/* List kartu (HP) - struktur frame M: R1 thumb + N + S + Acts, R2 Stok + Aktif */}
      <ul className="mt-4 space-y-3 sm:hidden">
        {items.map((p) => (
          <li key={p.id} className="border border-line bg-white p-3">
            <div className="flex gap-3">
              <Link to={`/admin/produk/${p.id}`} className="shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-20 w-16 object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/produk/${p.id}`}>
                  <p className="truncate text-sm font-semibold hover:underline">
                    {p.name}
                  </p>
                </Link>
                <p className="mt-0.5 truncate text-xs text-sub">
                  {p.sku} · {formatIDR(p.price)}
                </p>
                <div className="mt-2 flex gap-2">{acts(p)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
              <span className="text-sub">Stok {p.stock_sum ?? 0}</span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${p.status === "aktif" ? "bg-green-100 text-green-800" : "bg-cream-deep text-sub"}`}
              >
                {p.status === "aktif" ? "Aktif" : "Arsip"}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {paged && paged.total === 0 && !loading && (
        <p className="mt-8 text-center text-sm text-sub">
          Tidak ada produk yang cocok dengan pencarian.
        </p>
      )}

      {paged && (
        <AdminPagination
          page={paged.current_page}
          pages={pages}
          onPage={setPage}
          from={paged.from ?? 0}
          to={paged.to ?? 0}
          total={paged.total}
          unit="produk"
        />
      )}

      {/* Modal konfirmasi hapus */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md bg-white p-6">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-2xl">Hapus produk?</h2>
              <button
                aria-label="Tutup"
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-sub">
              “{toDelete.name}” akan dihapus permanen dari katalog dan tidak
              bisa dikembalikan.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="h-12 border border-line text-sm font-semibold hover:border-ink disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="h-12 bg-brand-red text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
