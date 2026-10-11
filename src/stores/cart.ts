import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

/**
 * State keranjang belanja sisi klien (tanpa login).
 * - Disimpan ke localStorage agar tidak hilang saat refresh (persist).
 * - Nantinya dikirim ke Laravel saat checkout one-page (POST /api/v1/orders).
 */
interface CartState {
  items: CartItem[];
  /** Tambah produk (gabung qty bila id+ukuran sama). */
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  /** Ubah jumlah; qty <= 0 akan menghapus item. */
  setQty: (productId: string, size: string, qty: number) => void;
  removeItem: (productId: string, size: string) => void;
  clear: () => void;
  /** Total jumlah pcs di keranjang (untuk badge navbar). */
  count: () => number;
  /** Total harga seluruh keranjang. */
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) =>
        set((s) => {
          const found = s.items.find(
            (i) => i.productId === item.productId && i.size === item.size,
          );
          if (found) {
            return {
              items: s.items.map((i) =>
                i === found ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),

      setQty: (productId, size, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter(
                  (i) => !(i.productId === productId && i.size === size),
                )
              : s.items.map((i) =>
                  i.productId === productId && i.size === size
                    ? { ...i, qty }
                    : i,
                ),
        })),

      removeItem: (productId, size) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && i.size === size),
          ),
        })),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.qty, 0),

      subtotal: () =>
        get().items.reduce((n, i) => n + i.qty * i.price, 0),
    }),
    { name: 'batik-jogja-cart' },
  ),
);
