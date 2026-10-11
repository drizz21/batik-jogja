import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminDeleteProduct, adminGetProduct, ApiError } from "@/lib/api";
import type { ApiProductRaw } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { formatIDR } from "@/lib/utils";

/**
 * Detail produk admin - data live (galeri + varian + stok agregat).
 * Struktur mengikuti frame M - Admin Detail: Title, Gallery,
 * Info (SKU/Kategori/Harga/Stok), Actions (Edit + Hapus + modal).
 */
export function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [product, setProduct] = useState<ApiProductRaw | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    adminGetProduct(id)
      .then((p) => {
        if (alive) setProduct(p);
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setError(e instanceof Error ? e.message : "Gagal memuat produk.");
      });
    return () => {
      alive = false;
    };
  }, [id, logout, navigate]);

  if (!id) return <Navigate to="/admin/produk" replace />;

  const gallery =
    product?.images && product.images.length > 0
      ? product.images.map((i) => i.url)
      : product
        ? [product.image]
        : [];

  const stock = product
    ? (product.variants ?? []).reduce((s, v) => s + v.stock, 0)
    : 0;

  const rows: Array<[string, string]> = product
    ? [
        ["SKU", product.sku ?? "-"],
        ["Kategori", product.category?.label ?? "-"],
        ["Harga", formatIDR(product.price)],
        ["Stok", `${stock} pcs tersedia`],
      ]
    : [];

  const doDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(String(product.id));
      navigate("/admin/produk");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus.");
      setConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Detail Produk"
      sub={product ? `Produk / ${product.name}` : "Memuat…"}
    >
      <Link
        to="/admin/produk"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
      </Link>

      {error && (
        <p className="mb-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {error}
        </p>
      )}

      {product ? (
        <div className="grid items-start gap-4 lg:grid-cols-[400px_1fr] sm:gap-6">
          {/* Galeri: foto utama + thumbs */}
          <div className="border border-line bg-white p-4">
            <img
              src={gallery[photo]}
              alt={product.name}
              className="aspect-[3/4] w-full bg-cream-deep object-cover"
            />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setPhoto(i)}
                  aria-label={`Foto ${i + 1}`}
                >
                  <img
                    src={g}
                    alt=""
                    className={`aspect-square w-full object-cover ${i === photo ? "outline outline-2 outline-ink" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info + aksi */}
          <div className="space-y-4">
            <section className="border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-medium sm:text-3xl">
                  {product.name}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === "aktif" ? "bg-green-100 text-green-800" : "bg-cream-deep text-sub"}`}
                >
                  {product.status === "aktif" ? "Aktif" : "Arsip"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                {product.description}
              </p>
              <dl className="mt-4 divide-y divide-line border-t border-line">
                {rows.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <dt className="text-[11px] tracking-[2px] text-sub">
                      {k.toUpperCase()}
                    </dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to={`/admin/produk/${product.id}/ubah`}
                className="flex h-12 items-center justify-center gap-2 bg-ink text-sm font-semibold text-cream hover:opacity-90"
              >
                <Pencil className="h-4 w-4" /> Edit Produk
              </Link>
              <button
                onClick={() => setConfirm(true)}
                className="flex h-12 items-center justify-center gap-2 border border-brand-red text-sm font-semibold text-brand-red hover:bg-brand-red hover:text-white"
              >
                <Trash2 className="h-4 w-4" /> Hapus Produk
              </button>
            </section>
          </div>
        </div>
      ) : (
        !error && <p className="text-sm text-sub">Memuat…</p>
      )}

      {/* Modal konfirmasi hapus */}
      {confirm && product && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md bg-white p-6">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-2xl">Hapus produk?</h2>
              <button
                aria-label="Tutup"
                onClick={() => setConfirm(false)}
                disabled={deleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-sub">
              “{product.name}” akan dihapus permanen dari katalog dan tidak bisa
              dikembalikan.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={deleting}
                className="h-12 border border-line text-sm font-semibold hover:border-ink disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={doDelete}
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
