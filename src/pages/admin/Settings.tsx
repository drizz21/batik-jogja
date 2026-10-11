import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminSaveSettings, adminSettings, ApiError } from '@/lib/api';
import { useAuth } from '@/stores/auth';

/** Validasi profil toko + ongkir (pesan Bahasa Indonesia). */
const schema = z.object({
  storeName: z.string().min(3, 'Nama toko minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(9, 'Nomor HP minimal 9 digit'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  freeShipMin: z.number({ error: 'Batas wajib diisi' }).min(0, 'Tidak boleh negatif'),
});
type Values = z.infer<typeof schema>;

/**
 * Pengaturan toko: profil + batas gratis ongkir + metode pembayaran.
 * Menumpuk satu kolom di HP, dua kolom di desktop.
 * Dibaca/disimpan via GET/PUT /api/v1/admin/settings.
 */
export function AdminSettings() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: '',
      email: '',
      phone: '',
      address: '',
      freeShipMin: 0,
    },
  });

  useEffect(() => {
    let alive = true;
    adminSettings()
      .then((s) => {
        if (!alive) return;
        reset({
          storeName: s.storeName ?? '',
          email: s.email ?? '',
          phone: s.phone ?? '',
          address: s.address ?? '',
          freeShipMin: Number(s.freeShipMin ?? 0),
        });
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          logout().finally(() => navigate('/admin/login'));
          return;
        }
        setLoadError(e instanceof Error ? e.message : 'Gagal memuat pengaturan.');
      });
    return () => {
      alive = false;
    };
  }, [reset, logout, navigate]);

  const field = (label: string, error?: string, child?: React.ReactNode) => (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[1px]">
        {label.toUpperCase()}
      </span>
      {child}
      {error && <span className="mt-1 block text-xs text-brand-red">{error}</span>}
    </label>
  );

  return (
    <AdminLayout title="Pengaturan" sub="Profil toko, ongkir, dan pembayaran.">
      {loadError && (
        <p className="mb-4 border border-brand-red/30 bg-brand-red/5 p-4 text-sm text-brand-red">
          {loadError}
        </p>
      )}
      <form
        onSubmit={handleSubmit(async (v) => {
          setSaveError(null);
          setSaving(true);
          try {
            await adminSaveSettings({ ...v });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
              logout().finally(() => navigate('/admin/login'));
              return;
            }
            setSaveError(e instanceof Error ? e.message : 'Gagal menyimpan.');
          } finally {
            setSaving(false);
          }
        })}
        className="grid items-start gap-4 lg:grid-cols-2 sm:gap-6"
      >
        {/* Profil toko */}
        <section className="space-y-4 border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-2xl">Profil Toko</h2>
          {field('Nama toko', errors.storeName?.message, (
            <Input {...register('storeName')} />
          ))}
          {field('Email toko', errors.email?.message, (
            <Input type="email" {...register('email')} />
          ))}
          {field('No. HP / WhatsApp', errors.phone?.message, (
            <Input {...register('phone')} />
          ))}
          {field('Alamat toko', errors.address?.message, (
            <textarea
              rows={3}
              {...register('address')}
              className="w-full border border-line bg-white p-3 text-sm focus:border-ink focus:outline-none"
            />
          ))}
        </section>

        {/* Ongkir + pembayaran */}
        <div className="space-y-4 sm:space-y-6">
          <section className="space-y-4 border border-line bg-white p-5 sm:p-6">
            <h2 className="font-display text-2xl">Pengiriman</h2>
            {field('Min. belanja gratis ongkir (Rp)', errors.freeShipMin?.message, (
              <Input type="number" inputMode="numeric" {...register('freeShipMin', { valueAsNumber: true })} />
            ))}
            <p className="text-xs leading-relaxed text-sub">
              Berlaku untuk pengiriman Standar ke Pulau Jawa. Ekspres menambah
              Rp20.000 per pesanan.
            </p>
          </section>

          <section className="border border-line bg-white p-5 sm:p-6">
            <h2 className="font-display text-2xl">Pembayaran</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {['Transfer Bank (BCA · BRI · Mandiri)', 'GoPay', 'OVO', 'QRIS'].map((m) => (
                <li key={m} className="flex items-center justify-between border border-line px-4 py-3">
                  <span>{m}</span>
                  <span className="text-xs font-semibold text-green-700">Aktif</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-sub">
              Kunci API Midtrans diisi lewat file .env backend (tidak ditampilkan
              di sini demi keamanan).
            </p>
          </section>

          <Button type="submit" className="h-12 w-full" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
          </Button>
          {saveError && (
            <p className="text-center text-xs text-brand-red">{saveError}</p>
          )}
          {saved && (
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Pengaturan tersimpan.
            </p>
          )}
        </div>
      </form>
    </AdminLayout>
  );
}
