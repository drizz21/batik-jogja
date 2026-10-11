import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/stores/auth";

/** Validasi form masuk admin (pesan Bahasa Indonesia). */
const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});
type Values = z.infer<typeof schema>;

/**
 * Halaman masuk admin - logo "BATIK JOGJA" di tengah (sesuai frame Login).
 * Autentikasi nyata via POST /api/v1/admin/login (Sanctum Bearer).
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-[400px] border border-line bg-white p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo height={44} />
          <h1 className="mt-5 font-display text-3xl font-medium sm:text-4xl">
            BATIK JOGJA
          </h1>
          <p className="mt-1 text-sm text-sub">Masuk ke panel admin</p>
        </div>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(async (v) => {
            setError(null);
            setBusy(true);
            try {
              await login(v.email, v.password);
              navigate("/admin");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Gagal masuk.");
            } finally {
              setBusy(false);
            }
          })}
        >
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[1px]">
              EMAIL
            </span>
            <Input
              type="email"
              placeholder="admin@batikjogja.id"
              autoComplete="username"
              {...register("email")}
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-brand-red">
                {errors.email.message}
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[1px]">
              KATA SANDI
            </span>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-11"
                {...register("password")}
              />
              <button
                type="button"
                aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sub"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="mt-1 block text-xs text-brand-red">
                {errors.password.message}
              </span>
            )}
          </label>
          <Button type="submit" className="h-12 w-full" disabled={busy}>
            {busy ? "Memeriksa…" : "MASUK"}
          </Button>
          {error && (
            <p className="text-center text-xs leading-relaxed text-brand-red">
              {error}
            </p>
          )}
        </form>
        <p className="mt-6 text-center text-xs text-sub">
          Lupa kata sandi? Hubungi pemilik toko.
        </p>
      </div>
    </main>
  );
}
