import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { resolveImage } from "@/lib/images";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Kartu produk - ukuran SELALU seragam:
 * - foto rasio 3:4 (object-cover),
 * - nama dipotong maks. 2 baris dengan tinggi minimum sama,
 * - harga bold di bawah nama (tanpa teks ukuran).
 *
 * `badge`: "auto" (NEW bila isNew) | "best-seller" (paksa BEST SELLER,
 * dipakai section Best Seller) | "none" (tanpa label, dipakai split
 * Wanita/Pria/Anak/Keluarga di Home).
 */
export function ProductCard({
  product,
  badge = "auto",
}: {
  product: Product;
  badge?: "auto" | "best-seller" | "none";
}) {
  const showNew = badge === "auto" && product.isNew;
  const showBest =
    badge === "best-seller" ||
    (badge === "auto" && product.isBestSeller && !product.isNew);

  return (
    <Link to={`/produk/${product.slug}`} className="group block h-full">
      <div className="relative overflow-hidden bg-cream-deep">
        <img
          src={resolveImage(product.id, product.image)}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showNew && (
          <Badge tone="new" className="absolute left-3 top-3">
            NEW
          </Badge>
        )}
        {showBest && (
          <Badge tone="best" className="absolute left-3 top-3">
            BEST SELLER
          </Badge>
        )}
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-xs font-medium leading-snug sm:text-sm">
        {product.name}
      </p>
      <p className="mt-1 text-[13px] font-bold sm:text-sm">
        {formatIDR(product.price)}
      </p>
    </Link>
  );
}
