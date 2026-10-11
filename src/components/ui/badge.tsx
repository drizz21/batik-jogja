import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

/** Label kecil di atas foto produk: NEW (merah) & BEST SELLER. */
const badgeVariants = cva(
  'inline-block px-2.5 py-1 text-[10px] font-bold tracking-widest text-cream',
  {
    variants: {
      tone: {
        new: 'bg-new-red',
        best: 'bg-brand-red',
        dark: 'bg-ink',
      },
    },
    defaultVariants: { tone: 'new' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}
