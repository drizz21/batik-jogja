import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Landmark,
  QrCode,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/lib/api";
import { Reveal } from "@/components/Reveal";
import { useCart } from "@/stores/cart";
import { formatIDR } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Skema validasi one-page checkout (pesan Bahasa Indonesia).
 * Tanpa login: email dipakai untuk notifikasi & invoice.
 */
const schema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(9, "Nomor HP minimal 9 digit"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  city: z.string().min(3, "Kota wajib diisi"),
  postalCode: z.string().min(5, "Kode pos minimal 5 digit"),
  shipping: z.enum(["standar", "ekspres"]),
  payment: z.enum(["transfer", "gopay", "ovo", "qris"]),
});
type FormValues = z.infer<typeof schema>;

const SHIPPING = {
  standar: { label: "Standar - tiba (3-5 hari)", cost: 0 },
  ekspres: { label: "Ekspres - besok tiba (Jawa)", cost: 20000 },
} as const;

const PAYMENTS = [
  {
    id: "transfer",
    label: "Transfer Bank",
    sub: "BCA · BRI · Mandiri",
    icon: Landmark,
  },
  { id: "gopay", label: "GoPay", sub: "Saldo & PayLater", icon: Wallet },
  { id: "ovo", label: "OVO", sub: "Saldo OVO", icon: Smartphone },
  { id: "qris", label: "QRIS", sub: "Semua e-wallet", icon: QrCode },
] as const;

/** Style input checkout sesuai Pencil: latar #FBF9F5, radius halus, placeholder $sub. */
const inputCls =
  "rounded-[4px] bg-[#FBF9F5] px-3.5 placeholder:text-sub lg:rounded-[2px]";

/**
 * Judul seksi checkout: nomor (display) + label kapital - meniru pola
 * "01 KONTAK" pada frame Pencil (mobile & desktop).
 */
function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5">
      <span className="font-display text-xl text-sub lg:text-[22px]">
        {num}
      </span>
      <span className="text-[13px] font-semibold tracking-[1px] lg:text-[15px]">
        {title}
      </span>
    </h2>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[1px] text-ink">
        {label.toUpperCase()}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-brand-red">{error}</span>
      )}
    </label>
  );
}

/**
 * One-page checkout: email + alamat + pengiriman + pembayaran + ringkasan
 * dalam satu layar. Tanpa login; pembayaran via Midtrans (tahap backend).
 */
export function Checkout() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());
  const clear = useCart((s) => s.clear);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping: "standar", payment: "qris" },
  });

  const shipKey = watch("shipping");
  const payKey = watch("payment");
  const shipCost = SHIPPING[shipKey].cost;
  const total = useMemo(() => subtotal + shipCost, [subtotal, shipCost]);

  // Layar sukses setelah "bayar" (simulasi - diganti Snap Midtrans).
  if (orderId) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-700" />
        <h1 className="mt-4 font-display text-4xl">Pesanan Diterima!</h1>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          Nomor pesanan <b className="text-ink">{orderId}</b>. Tautan pembayaran
          dan invoice dikirim ke email kamu. Stok produk otomatis kami amankan
          selama 24 jam.
          {simulated && (
            <span className="mt-2 block text-xs">
              Mode simulasi - pembayaran Midtrans asli aktif setelah kredensial
              merchant dipasang.
            </span>
          )}
        </p>
        <Button className="mt-8">
          <Link to="/">Kembali Belanja</Link>
        </Button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="font-display text-4xl">Checkout Kosong</h1>
        <p className="mt-3 text-sm text-sub">
          Keranjangmu masih kosong - pilih batik dulu yuk.
        </p>
        <Button className="mt-8">
          <Link to="/terbaru">Lihat Koleksi</Link>
        </Button>
      </main>
    );
  }

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    // ID numerik (API) bisa dikirim; id mock ("p01") tidak - langsung simulasi.
    const apiItems = items.map((i) => ({ ...i, pid: Number(i.productId) }));
    const canPost = apiItems.every((i) => Number.isInteger(i.pid));
    if (canPost) {
      try {
        const res = await createOrder({
          email: v.email,
          name: v.name,
          phone: v.phone,
          address: v.address,
          city: v.city,
          postalCode: v.postalCode,
          shipping: v.shipping,
          payment: v.payment,
          items: apiItems.map((i) => ({
            productId: i.pid,
            size: i.size,
            qty: i.qty,
          })),
        });
        setOrderId(res.code);
        setSimulated(res.simulated);
        clear();
        return;
      } catch (e) {
        // Server mati / validasi gagal: tampilkan pesan, beri opsi simulasi.
        setSubmitError(
          e instanceof Error ? e.message : "Gagal membuat pesanan.",
        );
        setSubmitting(false);
        return;
      }
    }
    // Fallback: simulasi lokal (perilaku lama sebelum backend ada).
    console.log("checkout payload (simulasi lokal)", { ...v, total });
    setOrderId(`BJ-${Date.now().toString().slice(-6)}`);
    setSimulated(true);
    clear();
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-14">
      <Reveal>
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-sm text-sub">
          Tanpa daftar akun - cukup email untuk notifikasi pembayaran.
        </p>
      </Reveal>

      {/*
        Ringkasan ringkas versi mobile (frame Pencil "M — Checkout"):
        pita full-bleed berisi daftar produk + subtotal di atas form.
        Digantikan aside lengkap mulai breakpoint md.
      */}
      <section
        aria-label="Ringkasan produk"
        className="-mx-5 mt-6 border border-line bg-[#FBF9F5] px-5 py-4 md:hidden"
      >
        <p className="text-[11px] font-bold tracking-[1px]">
          RINGKASAN — {count} PRODUK · {formatIDR(subtotal)}
        </p>
        <ul className="mt-3 space-y-2.5">
          {items.map((i) => (
            <li
              key={`${i.productId}-${i.size}`}
              className="flex items-center gap-2.5"
            >
              <img
                src={i.image}
                alt={i.name}
                className="h-[54px] w-11 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="break-words text-xs font-semibold leading-snug">
                  {i.name}
                </p>
                <p className="mt-0.5 text-[11px] text-sub">
                  {i.size} · {i.qty} pcs
                </p>
              </div>
              <p className="shrink-0 text-xs font-bold">
                {formatIDR(i.price * i.qty)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid items-start gap-8 md:grid-cols-[1fr_300px] lg:mt-8 lg:grid-cols-[1fr_400px] lg:gap-10"
      >
        {/* Kiri: form */}
        <Reveal className="min-w-0">
          <div className="space-y-6 lg:space-y-8">
            <section>
              <SectionHead num="01" title="KONTAK" />
              <div className="mt-3">
                <Field label="Email" error={errors.email?.message}>
                  <Input
                    type="email"
                    placeholder="kamu@email.com"
                    className={inputCls}
                    {...register("email")}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionHead num="02" title="ALAMAT PENGIRIMAN" />
              <div className="mt-3 space-y-4">
                <Field label="Nama lengkap" error={errors.name?.message}>
                  <Input
                    placeholder="Nama penerima"
                    className={inputCls}
                    {...register("name")}
                  />
                </Field>
                <Field label="No. HP / WhatsApp" error={errors.phone?.message}>
                  <Input
                    placeholder="08xx-xxxx-xxxx"
                    className={inputCls}
                    {...register("phone")}
                  />
                </Field>
                <Field label="Jalan & nomor" error={errors.address?.message}>
                  <Input
                    placeholder="Jl. Malioboro No. 123"
                    className={inputCls}
                    {...register("address")}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
                  <Field label="Kota" error={errors.city?.message}>
                    <Input
                      placeholder="Yogyakarta"
                      className={inputCls}
                      {...register("city")}
                    />
                  </Field>
                  <Field label="Kode pos" error={errors.postalCode?.message}>
                    <Input
                      placeholder="55165"
                      className={inputCls}
                      {...register("postalCode")}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section>
              <SectionHead num="03" title="PENGIRIMAN" />
              <div className="mt-3 space-y-3">
                {(Object.keys(SHIPPING) as (keyof typeof SHIPPING)[]).map(
                  (k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setValue("shipping", k)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 border p-3.5 text-left lg:p-4",
                        shipKey === k
                          ? "border-ink bg-[#FBF9F5]"
                          : "border-line",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 rounded-full border",
                            shipKey === k && "border-[5px] border-ink",
                          )}
                        />
                        <span className="min-w-0">{SHIPPING[k].label}</span>
                      </span>
                      <span className="shrink-0 text-sm text-sub">
                        {SHIPPING[k].cost === 0
                          ? "Gratis"
                          : formatIDR(SHIPPING[k].cost)}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </section>

            <section>
              <SectionHead num="04" title="PEMBAYARAN" />
              <div className="mt-3 grid grid-cols-1 gap-3 min-[500px]:grid-cols-2">
                {PAYMENTS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setValue("payment", p.id)}
                    className={cn(
                      "flex items-center gap-3 border p-3.5 text-left lg:p-4",
                      payKey === p.id
                        ? "border-ink bg-[#FBF9F5]"
                        : "border-line",
                    )}
                  >
                    <p.icon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {p.label}
                      </span>
                      <span className="block text-xs text-sub">{p.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-sub">
                Pembayaran aman via Midtrans - kartu, transfer, e-wallet, QRIS.
              </p>
            </section>
          </div>
        </Reveal>

        {/* Kanan: ringkasan */}
        <Reveal delay={120} className="min-w-0">
          <aside className="border border-line bg-[#FBF9F5] p-5 sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Ringkasan</h2>
            {/* Daftar produk tampil di aside mulai md; di mobile sudah ada
                di pita "RINGKASAN" atas (frame M — Checkout). */}
            <ul className="mt-4 hidden space-y-4 md:block">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-3">
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-16 w-12 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug">
                      {i.name}
                    </p>
                    <p className="mt-0.5 text-xs text-sub">
                      {i.size} · {i.qty} pcs
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-bold">
                    {formatIDR(i.price * i.qty)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="shrink-0 text-right">
                  {formatIDR(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Pengiriman</span>
                <span className="shrink-0 text-right">
                  {shipCost === 0 ? "Gratis" : formatIDR(shipCost)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-base font-bold">
                <span>Total</span>
                <span className="shrink-0 text-right">{formatIDR(total)}</span>
              </div>
            </div>
            <Button
              type="submit"
              className="mt-5 h-[54px] w-full"
              disabled={submitting}
            >
              {submitting
                ? "Memproses…"
                : `Buat Pesanan — ${formatIDR(total)}`}
            </Button>
            {submitError && (
              <p className="mt-3 text-xs leading-relaxed text-brand-red">
                {submitError} Periksa koneksi ke server API lalu coba lagi.
              </p>
            )}
          </aside>
        </Reveal>
      </form>
    </main>
  );
}
