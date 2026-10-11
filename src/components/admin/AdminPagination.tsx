import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination admin - gaya frame Pencil (teks "I" + tombol P1/P2/P3):
 * "Menampilkan X–Y dari Z" + nomor halaman. Dipakai Produk/Pesanan/
 * Pelanggan. Tombol cukup besar untuk sentuhan mobile.
 */
export function AdminPagination({
  page,
  pages,
  onPage,
  from,
  to,
  total,
  unit = "data",
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
  from: number;
  to: number;
  total: number;
  unit?: string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border border-line bg-white px-4 py-3 sm:flex-row">
      <p className="text-xs text-sub">
        Menampilkan {from}–{to} dari {total} {unit}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          aria-label="Halaman sebelumnya"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-line p-2 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            aria-label={`Halaman ${i + 1}`}
            aria-current={page === i + 1 ? "page" : undefined}
            onClick={() => onPage(i + 1)}
            className={cn(
              "h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold",
              page === i + 1
                ? "border-ink bg-ink text-cream"
                : "border-line bg-white hover:border-ink",
            )}
          >
            {i + 1}
          </button>
        ))}
        <button
          aria-label="Halaman berikutnya"
          disabled={page === pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-line p-2 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
