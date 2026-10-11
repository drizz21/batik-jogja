import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminGetProduct,
  adminSaveProduct,
  adminUploadImage,
  ApiError,
  fetchCategories,
} from "@/lib/api";
import type { CategoryRaw } from "@/lib/api";
import { useAuth } from "@/stores/auth";

/** Validasi form tambah/ubah produk (pesan Bahasa Indonesia). */
const schema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category_id: z
    .number({ error: "Pilih kategori" })
    .int()
    .min(1, "Pilih kategori"),
  price: z
    .number({ error: "Harga wajib diisi" })
    .min(1000, "Harga minimal Rp1.000"),
  stock: z
    .number({ error: "Stok wajib diisi" })
    .min(0, "Stok tidak boleh negatif"),
  motif: z.string().min(3, "Motif wajib diisi"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  status: z.enum(["aktif", "arsip"]),
});
type Values = z.infer<typeof schema>;

/**
 * Form tambah / ubah produk - data live:
 * daftar kategori dari API, prefill dari GET produk saat ubah,
 * simpan via POST/PUT. Foto lewat tombol UNGGAH FOTO (input file
 * tersembunyi - memilih gambar dari komputer/galeri HP); mode ubah
 * langsung menempel ke produk di DB, mode tambah menunggu Simpan.
 */
export function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id || id === "baru";
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [cats, setCats] = useState<CategoryRaw[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: 0,
      stock: 10,
      motif: "",
      description: "",
      name: "",
      price: 0,
      status: "aktif",
    },
  });

  useEffect(() => {
    fetchCategories()
      .then(setCats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    adminGetProduct(id!)
      .then((p) => {
        if (!alive) return;
        setCurrentImage(p.image);
        reset({
          name: p.name,
          category_id: p.category_id ?? p.category?.id ?? 0,
          price: p.price,
          stock: (p.variants ?? []).reduce((s, v) => s + v.stock, 0),
          motif: p.motif ?? "",
          description: p.description ?? "",
          status: (p.status === "arsip" ? "arsip" : "aktif") as
            | "aktif"
            | "arsip",
        });
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate("/admin/login"));
          return;
        }
        setLoadError(e instanceof Error ? e.message : "Gagal memuat produk.");
      });
    return () => {
      alive = false;
    };
  }, [id, isNew, reset, logout, navigate]);

  const field = (label: string, errorMsg?: string, child?: React.ReactNode) => (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[1px]">
        {label.toUpperCase()}
      </span>
      {child}
      {errorMsg && (
        <span className="mt-1 block text-xs text-brand-red">{errorMsg}</span>
      )}
    </label>
  );

  /** Pilih file (komputer/galeri HP) lalu unggah ke backend. */
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // izinkan pilih file yang sama lagi
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const res = await adminUploadImage(file, isNew ? undefined : id);
      setCurrentImage(res.url);
      if (isNew) setUploadedUrl(res.url);
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Unggahan gagal. Coba lagi.",
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (v: Values) => {
    setSaveError(null);
    setSaving(true);
    try {
      const saved = await adminSaveProduct(isNew ? null : id!, {
        name: v.name,
        category_id: v.category_id,
        price: v.price,
        stock: v.stock,
        motif: v.motif,
        description: v.description,
        status: v.status,
        // Foto hasil unggah di mode tambah baru menempel saat disimpan.
        ...(isNew && uploadedUrl ? { image: uploadedUrl } : {}),
      });
      navigate(isNew ? "/admin/produk" : `/admin/produk/${saved.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        logout().finally(() => navigate("/admin/login"));
        return;
      }
      setSaveError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isNew ? "Tambah Produk" : "Ubah Produk"}
      sub={
        isNew ? "Daftarkan motif baru ke katalog." : "Perbarui data katalog."
      }
    >
      {/* Kembali - di area konten agar tetap ada di mobile */}
      <Link
        to={isNew ? "/admin/produk" : `/admin/produk/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      {loadError && (
        <p className="mb-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {loadError}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid items-start gap-4 lg:grid-cols-[1fr_320px] sm:gap-6"
      >
        {/* Kiri: data utama */}
        <div className="space-y-4 border border-line bg-white p-5 sm:p-6">
          {field(
            "Nama produk",
            errors.name?.message,
            <Input
              placeholder="cth. Kebaya Batik Mega Mendung"
              {...register("name")}
            />,
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field(
              "Kategori",
              errors.category_id?.message,
              <select
                {...register("category_id", { valueAsNumber: true })}
                className="h-11 w-full border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none"
              >
                <option value={0}>- Pilih kategori -</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>,
            )}
            {field(
              "Motif",
              errors.motif?.message,
              <Input placeholder="cth. Parang Rusak" {...register("motif")} />,
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field(
              "Harga (Rp)",
              errors.price?.message,
              <Input
                type="number"
                inputMode="numeric"
                placeholder="cth. 585000"
                {...register("price", { valueAsNumber: true })}
              />,
            )}
            {field(
              "Stok total (pcs)",
              errors.stock?.message,
              <Input
                type="number"
                inputMode="numeric"
                {...register("stock", { valueAsNumber: true })}
              />,
            )}
          </div>
          {field(
            "Deskripsi",
            errors.description?.message,
            <textarea
              rows={5}
              placeholder="Ceritakan motif, bahan, dan potongannya…"
              {...register("description")}
              className="w-full border border-line bg-white p-3 text-sm focus:border-ink focus:outline-none"
            />,
          )}
          {field(
            "Status",
            errors.status?.message,
            <select
              {...register("status")}
              className="h-11 w-full border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none sm:max-w-xs"
            >
              <option value="aktif">Aktif - tampil di katalog</option>
              <option value="arsip">Arsip - sembunyikan dari katalog</option>
            </select>,
          )}
        </div>

        {/* Kanan: foto + aksi (menumpuk di bawah pada HP) */}
        <aside className="space-y-4 border border-line bg-white p-5 sm:p-6">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold tracking-[1px]">
              FOTO PRODUK
            </p>
            {currentImage ? (
              <img
                src={currentImage}
                alt="Foto produk"
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center border border-dashed border-line bg-cream text-center text-xs text-sub">
                Belum ada foto.
                <br />
                Klik UNGGAH FOTO untuk memilih
                <br />
                dari komputer / galeri HP.
              </div>
            )}
            {/* Input file tersembunyi - tombol di bawah yang memicunya. */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              data-testid="input-foto-produk"
              onChange={onPickFile}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-11 w-full"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Mengunggah…" : "Unggah Foto"}
            </Button>
            <p className="mt-2 text-xs text-sub">
              JPG, PNG, atau WebP &middot; maksimal 5 MB. Foto langsung
              tersimpan ke database.
            </p>
            {uploadError && (
              <p className="mt-1 text-xs text-brand-red">{uploadError}</p>
            )}
          </div>
          {saveError && (
            <p className="text-xs leading-relaxed text-brand-red">
              {saveError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3">
            <Button type="submit" className="h-12 w-full" disabled={saving}>
              {saving
                ? "Menyimpan…"
                : isNew
                  ? "Simpan Produk"
                  : "Simpan Perubahan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full"
              onClick={() => navigate("/admin/produk")}
            >
              Batal
            </Button>
          </div>
        </aside>
      </form>
    </AdminLayout>
  );
}
