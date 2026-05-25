import { usePortfolioImages, useProductImages } from "@/hooks/use-site-data";
import { getPortfolioId, getProductId, imageSource, type PortfolioItem, type ProductItem } from "@/lib/api";

type Props =
  | {
      kind: "product";
      item: ProductItem;
      alt: string;
      eager?: boolean;
      className?: string;
    }
  | {
      kind: "portfolio";
      item: PortfolioItem;
      alt: string;
      eager?: boolean;
      className?: string;
    };

export function LazySheetImage({ kind, item, alt, eager = false, className = "" }: Props) {
  const initial = item.images && item.images.length ? item.images : [];
  const shouldFetch = initial.length === 0 && Boolean(item.driveFolderId || item.id || item.slug);
  const productImages = useProductImages(
    kind === "product" ? getProductId(item as ProductItem) : undefined,
    kind === "product" ? item.driveFolderId : undefined,
    kind === "product" && shouldFetch,
  );
  const portfolioImages = usePortfolioImages(
    kind === "portfolio" ? getPortfolioId(item as PortfolioItem) : undefined,
    kind === "portfolio" ? item.driveFolderId : undefined,
    kind === "portfolio" && shouldFetch,
  );
  const lazyImages = kind === "product" ? productImages.data : portfolioImages.data;
  const src = imageSource(initial[0] || lazyImages?.[0]);

  if (!src) {
    return (
      <div className={`absolute inset-0 grid place-items-center text-sm text-muted-foreground ${className}`}>
        Geen afbeelding
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={800}
      height={600}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
