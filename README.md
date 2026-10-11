# Batik Jogja — Storefront

Website toko **batik tulis & cap khas Yogyakarta**. Frontend statis
(React 19 + Vite + TypeScript + Tailwind CSS v4) yang di-deploy ke
**Cloudflare Pages**.

- **Live:** https://batik-jogja.pages.dev
- **Repo:** https://github.com/drizz21/batik-jogja

Backend Laravel (API) berada di repo/folder terpisah (`batik-jogja-api`).
Selama backend belum di-deploy, katalog memakai data lokal
(`src/data/products.ts`) sebagai fallback sehingga situs tetap utuh.

---

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil ke dist/
npm run preview    # pratinjau hasil build
```

Konfigurasi API: salin `.env.example` -> `.env`, lalu set `VITE_API_URL`
ke basis URL backend (default `http://127.0.0.1:8000/api/v1`).

---

## CI/CD — deploy otomatis dari GitHub

Setiap `git push` ke branch `main` akan otomatis: install -> build ->
deploy ke Cloudflare Pages (lihat `.github/workflows/deploy.yml`).

### Sekali saja: set secrets di GitHub

Buka **https://github.com/drizz21/batik-jogja/settings/secrets/actions**
lalu tambahkan dua *Repository secrets*:

| Nama secret | Nilai |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API Token Cloudflare (buat di https://dash.cloudflare.com/profile/api-tokens -> template **Edit Cloudflare Workers**, ATAU custom dengan permission **Cloudflare Pages: Edit** + **Account: Read**) |
| `CLOUDFLARE_ACCOUNT_ID` | `b90d067cf871d409f90569770febcc99` |

> Opsional: tambahkan secret `VITE_API_URL` bila backend API sudah live,
> agar build menunjuk ke backend itu. Bila kosong, situs memakai data
> katalog lokal (mock).

### Setelah secrets terisi

Ubah apa pun lalu push:

```bash
git add -A
git commit -m "update"
git push
```

Buka tab **Actions** di repo untuk melihat progres. Setelah hijau,
situs di https://batik-jogja.pages.dev ikut ter-update dalam ~1-2 menit.

### Deploy manual (cadangan)

```bash
npm run build
npx wrangler pages deploy dist --project-name batik-jogja --branch main
```

---

## Struktur singkat

| Path | Isi |
|---|---|
| `src/pages/` | Halaman: Home, katalog kategori, detail produk, checkout, admin |
| `src/data/products.ts` | Katalog lokal (fallback) + daftar kategori |
| `src/data/gallery.ts` | Galeri detail produk (foto tambahan per produk) |
| `src/lib/images.ts` | Pemetaan foto utama produk -> `public/images/` |
| `src/lib/api.ts` | Klien REST ke backend Laravel |
| `public/images/` | Aset foto lokal (38 berkas) |
| `public/_redirects` | SPA fallback (`/* /index.html 200`) untuk Cloudflare Pages |
