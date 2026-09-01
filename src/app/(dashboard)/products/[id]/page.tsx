import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/services/product.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import {
  Edit,
  Sparkles,
  Scissors,
  Layers,
  ShoppingBag,
  Package,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} • Category: ${product.category?.name || "General"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/orders/new?productId=${product.id}`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground",
              })}
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Book Custom Order
            </Link>

            <Link
              href={`/products/${product.id}/edit`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Design
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image & Gallery */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="relative aspect-[16/9] bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center border border-border">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Scissors className="w-12 h-12 opacity-30 mb-2" />
                  <span className="text-sm font-medium">Boutique Custom Garment</span>
                </div>
              )}
            </div>

            {/* Additional Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.altText || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description & Craftsmanship Details */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold font-heading text-foreground">
              Craftsmanship & Design Specifications
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.description || "No specific craftsmanship description provided."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
              <div>
                <div className="text-xs text-muted-foreground">Fabric</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {product.fabric || "Custom Selected"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Base Color</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {product.color || "Standard / Custom"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Collection</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {product.collection || "Signature Studio"}
                </div>
              </div>
            </div>
          </div>

          {/* Variants Table */}
          {product.variants.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Available Size Variants ({product.variants.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                      <th className="py-2.5 px-3">Variant Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3 text-right">In Stock</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {product.variants.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {v.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {v.sku}
                        </td>
                        <td className="py-2.5 px-3 text-foreground">{v.size || "—"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-foreground">
                          {v.stock}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-primary">
                          {v.price ? formatCurrency(Number(v.price)) : "Base Price"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary & Pricing card */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Selling Price</div>
              <div className="text-2xl font-bold font-heading text-primary mt-1">
                {formatCurrency(Number(product.salePrice || product.price))}
              </div>
              {product.salePrice && (
                <div className="text-xs text-muted-foreground line-through mt-0.5">
                  Regular: {formatCurrency(Number(product.price))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock Quantity</span>
                <span className="font-bold text-foreground">
                  {product.availableQuantity} pcs
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customizable</span>
                <span className="font-semibold text-purple-600">
                  {product.isCustomizable ? "Yes (Made-to-Measure)" : "Ready to Wear Only"}
                </span>
              </div>

              {product.costPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Est. Cost Price</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(Number(product.costPrice))}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Orders Booked</span>
                <span className="font-bold text-foreground">
                  {product._count?.orderItems || 0} orders
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <Link
                href={`/orders/new?productId=${product.id}`}
                className={buttonVariants({
                  variant: "default",
                  className: "w-full bg-primary text-primary-foreground",
                })}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Book This Garment
              </Link>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 space-y-2 text-xs">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tailoring & Made-to-Measure
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When booking an order for this design, measurements can be selected from the client&apos;s 360 profile or newly recorded with custom neck/sleeve instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
