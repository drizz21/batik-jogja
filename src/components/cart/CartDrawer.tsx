import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/stores/cart';
import { useUi } from '@/stores/ui';
import { formatIDR } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Drawer keranjang geser-kanan (pop-up cart versi mobile-first).
 * - Ubah qty, hapus item, lihat subtotal.
 * - Tombol checkout mengarah ke one-page checkout (/checkout).
 */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUi();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  return (
    <div
      className={cn('fixed inset-0 z-50', !cartOpen && 'pointer-events-none')}
      aria-hidden={!cartOpen}
    >
      {/* Latar gelap */}
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity',
          cartOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      {/* Panel */}
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[#FBF9F5] transition-transform duration-300',
          cartOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <p className="font-display text-2xl">Keranjang</p>
            <p className="text-xs text-sub">
              {items.length} produk · {formatIDR(subtotal)}
            </p>
          </div>
          <button aria-label="Tutup keranjang" onClick={closeCart}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-light" />
            <p className="text-sm text-sub">
              Keranjang masih kosong. Yuk pilih batik favoritmu!
            </p>
            <Button size="sm" onClick={closeCart}>
              <Link to="/terbaru">Lihat Koleksi</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-5 overflow-y-auto p-5">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.size}`}
                  className="flex gap-3"
                >
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-[90px] w-[72px] shrink-0 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-[13px] font-semibold">
                      {i.name}
                    </p>
                    <p className="text-xs text-sub">Ukuran {i.size}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        aria-label="Kurangi"
                        onClick={() =>
                          setQty(i.productId, i.size, i.qty - 1)
                        }
                        className="text-sub hover:text-ink"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-[13px] font-semibold">
                        {i.qty}
                      </span>
                      <button
                        aria-label="Tambah"
                        onClick={() =>
                          setQty(i.productId, i.size, i.qty + 1)
                        }
                        className="text-sub hover:text-ink"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <p className="text-[13px] font-bold">
                      {formatIDR(i.price * i.qty)}
                    </p>
                    <button
                      aria-label="Hapus item"
                      onClick={() => removeItem(i.productId, i.size)}
                      className="text-sub hover:text-brand-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-line p-5">
              <div className="flex justify-between text-[13px]">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>Pengiriman</span>
                <span className="text-sub">Dihitung saat checkout</span>
              </div>
              <Button
                className="mt-2 w-full"
                onClick={closeCart}
              >
                <Link to="/checkout" className="w-full">
                  Lanjut ke Pembayaran
                </Link>
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
