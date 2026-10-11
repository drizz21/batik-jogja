import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gabung class Tailwind secara kondisional (pola shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka ke Rupiah: 585000 -> "Rp585.000" (gaya penulisan di desain). */
export function formatIDR(value: number): string {
  const n = Number(value);
  return 'Rp' + (Number.isFinite(n) ? n : 0).toLocaleString('id-ID');
}
