import { Reveal } from '@/components/Reveal';

/** Judul section gaya editorial: eyebrow kecil + judul serif + sub-teks. */
export function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-3 px-5 text-center">
      <p className="text-[11px] tracking-[3px] text-sub">{eyebrow}</p>
      <h2 className="font-display text-4xl font-medium lg:text-[44px]">
        {title}
      </h2>
      {sub && <p className="text-[13px] leading-relaxed text-sub">{sub}</p>}
    </Reveal>
  );
}
