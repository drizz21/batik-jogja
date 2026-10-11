/**
 * Logo resmi Batik Jogja (SVG).
 * File `logo-batik-jogja.svg` WAJIB ada di folder `public/` agar tampil
 * di navbar, footer, dan favicon. Tanpa file itu, browser hanya
 * menampilkan teks alt "Batik Jogja".
 */
export function Logo({
  height = 40,
  className = '',
}: {
  /** Tinggi logo dalam px; lebar mengikuti proporsi SVG. */
  height?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo-batik-jogja.svg"
      alt="Batik Jogja"
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
    />
  );
}
