import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

/** Varian tombol gaya shadcn/ui, disesuaikan token Batik Jogja. */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4',
  {
    variants: {
      variant: {
        // Tombol utama gelap (CTA "Tambah ke Keranjang", dsb.)
        primary: 'bg-ink text-cream hover:bg-ink/90',
        // Tombol garis tepi (aksi sekunder "Explore", dsb.)
        outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
        // Tombol terang di atas latar gelap
        light: 'bg-cream text-ink hover:bg-cream-deep',
        ghost: 'text-sub hover:text-ink',
      },
      size: {
        sm: 'h-9 px-4 text-[13px]',
        md: 'h-12 px-6 text-sm tracking-wide',
        lg: 'h-14 px-8 text-sm tracking-widest',
        pill: 'h-10 px-5 text-[13px] rounded-full',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
