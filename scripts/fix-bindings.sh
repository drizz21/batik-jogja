#!/usr/bin/env bash
# Memasang binding native untuk Linux SEKALIGUS Windows secara berdampingan.
#
# Latar belakang: folder ini dipakai dua sistem (dev di Windows, asisten AI
# di Linux/WSL) dengan SATU node_modules. `npm install` biasa hanya menyimpan
# binding milik OS yang menjalankannya dan MENGHAPUS milik OS lain, sehingga
# `npm run dev` bergantian rusak ("Cannot find native binding").
#
# Script ini mengunduh tarball binding (tanpa npm install, jadi tidak ada
# yang di-prune) dan mengekstraknya langsung ke node_modules.
# Jalankan ulang script ini setiap kali ada yang menjalankan `npm install`.
set -euo pipefail
cd "$(dirname "$0")/.."

# Versi HARUS sama dengan yang diminta parent package-nya:
#  rolldown @ node_modules/rolldown/package.json
#  oxide    @ node_modules/@tailwindcss/oxide/package.json
#  lightningcss @ node_modules/lightningcss/package.json
PKGS=(
  "@rolldown/binding-linux-x64-gnu@1.2.12"
  "@rolldown/binding-win32-x64-msvc@1.2.12"
  "@tailwindcss/oxide-linux-x64-gnu@4.3.3"
  "@tailwindcss/oxide-win32-x64-msvc@4.3.3"
  "lightningcss-linux-x64-gnu@1.33.0"
  "lightningcss-win32-x64-msvc@1.33.0"
)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
for spec in "${PKGS[@]}"; do
  name="${spec%@*}"
  echo "== $spec"
  (cd "$TMP" && npm pack "$spec" >/dev/null 2>&1)
  tgz="$TMP"/*.tgz
  # npm pack hanya menghasilkan satu file per panggilan; pindahkan manual:
  latest=$(ls -t "$TMP"/*.tgz | head -1)
  rm -rf "node_modules/$name"
  mkdir -p "node_modules/$name"
  tar -xzf "$latest" -C "node_modules/$name" --strip-components=1
  rm -f "$latest"
done
echo "OK - binding linux + win32 terpasang berdampingan."
