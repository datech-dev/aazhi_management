import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Scissors, Edit, Eye, ShoppingBag, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface ProductWithDetails {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  collection: string | null;
  fabric: string | null;
  color: string | null;
  price: unknown;
  salePrice: unknown;
  availableQuantity: number;
  isCustomizable: boolean;
  category: { id: string; name: string } | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  variants: { id: string; name: string; sku: string; price: unknown; stock: number }[];
  _count: { orderItems: number; quotationItems: number };
}

interface ProductGridProps {
  products: ProductWithDetails[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold font-heading text-foreground">
          No designs found in catalog
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Try adjusting your search criteria or register a new boutique product design.
        </p>
        <div className="mt-4">
          <Link
            href="/products/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground",
            })}
          >
            Add First Design
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const primaryImage =
          product.images.find((img) => img.isPrimary)?.url ||
          product.images[0]?.url;

        const isLowStock =
          product.availableQuantity > 0 && product.availableQuantity <= 5;
        const isOutOfStock = product.availableQuantity === 0;

        return (
          <div
            key={product.id}
            className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col group"
          >
            {/* Image / Thumbnail Container */}
            <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden flex items-center justify-center border-b border-border/60">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                  <Scissors className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[11px] font-medium">Boutique Design</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isCustomizable && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/90 text-white backdrop-blur-sm shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Customizable
                  </span>
                )}
                {product.collection && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm shadow-sm">
                    {product.collection}
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2">
                {isOutOfStock ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shadow-sm">
                    Made to Order
                  </span>
                ) : isLowStock ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                    Only {product.availableQuantity} left
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                    {product.availableQuantity} in stock
                  </span>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{product.sku}</span>
                  <span>{product.category?.name || "General"}</span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 font-heading"
                  title={product.name}
                >
                  {product.name}
                </Link>

                {/* Fabric & Color specs */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
                  {product.fabric && (
                    <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[11px] font-medium">
                      {product.fabric}
                    </span>
                  )}
                  {product.color && (
                    <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[11px] font-medium">
                      {product.color}
                    </span>
                  )}
                  {product.variants.length > 0 && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                      <Layers className="w-3 h-3" />
                      {product.variants.length} var
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold font-heading text-primary">
                    {formatCurrency(Number(product.salePrice || product.price))}
                  </div>
                  {product.salePrice ? (
                    <div className="text-[11px] text-muted-foreground line-through">
                      {formatCurrency(Number(product.price))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 w-7 p-0 text-muted-foreground hover:text-foreground",
                    })}
                    title="Edit Design"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/products/${product.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-7 px-2 text-xs",
                    })}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
