import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

/** Input teks standar (form checkout, newsletter, pencarian admin). */
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full border border-line bg-white px-4 text-sm text-ink',
        'placeholder:text-muted-light focus:border-ink focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}
