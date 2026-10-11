import { create } from 'zustand';

/**
 * State UI global: buka/tutup drawer keranjang.
 * Dipisah dari cart store agar concern-nya jelas (data vs tampilan).
 */
interface UiState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useUi = create<UiState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
