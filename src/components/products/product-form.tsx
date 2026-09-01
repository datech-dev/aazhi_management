"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productCreateSchema,
  ProductCreateInput,
} from "@/lib/validations/product";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/actions/product.actions";
import {
  Scissors,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: Partial<ProductCreateInput> & { id?: string };
  isEditing?: boolean;
}

const COMMON_FABRICS = [
  "Raw Silk",
  "Pure Kanchipuram Silk",
  "Organza",
  "Georgette",
  "Velvet",
  "Chanderi",
  "Banarasi Brocade",
  "Tissue Silk",
  "Cotton Silk",
  "Net",
];

const COMMON_COLLECTIONS = [
  "Bridal 2026",
  "Aari & Zardosi Festive",
  "Heritage Silks",
  "Modern Pastels",
  "Reception Glam",
  "Haldi & Mehendi",
];

export function ProductForm({
  categories,
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      collection: initialData?.collection || "",
      price: initialData?.price || 0,
      costPrice: initialData?.costPrice || undefined,
      salePrice: initialData?.salePrice || undefined,
      availableQuantity: initialData?.availableQuantity || 0,
      lowStockThreshold: initialData?.lowStockThreshold || 5,
      fabric: initialData?.fabric || "",
      color: initialData?.color || "",
      sizeOptions: initialData?.sizeOptions || [],
      isCustomizable: initialData?.isCustomizable ?? true,
      isActive: initialData?.isActive ?? true,
      images: initialData?.images || [],
      variants: initialData?.variants || [],
    },
  });

  // Dynamic Image fields
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  // Dynamic Variant fields
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const isCustomizable = watch("isCustomizable");

  const onSubmit = async (data: ProductCreateInput) => {
    setLoading(true);
    setError("");

    try {
      if (isEditing && initialData?.id) {
        const res = await updateProductAction(initialData.id, data);
        if (!res.success) {
          setError(res.error || "Failed to update product.");
          setLoading(false);
          return;
        }
        router.push(`/products/${initialData.id}`);
      } else {
        const res = await createProductAction(data);
        if (!res.success) {
          setError(res.error || "Failed to create product.");
          setLoading(false);
          return;
        }
        router.push("/products");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to archive this product design?")) return;

    setLoading(true);
    const res = await deleteProductAction(initialData.id);
    if (res.success) {
      router.push("/products");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete product.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Basic Product Information */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <Scissors className="w-4 h-4 text-primary" />
          Garment & Design Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground">
              Design / Product Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Royal Emerald Bridal Aari Work Blouse"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              SKU / Design Code *
            </label>
            <input
              type="text"
              {...register("sku")}
              placeholder="e.g. BL-EMR-001"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.sku && (
              <p className="text-[11px] text-destructive">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Category</label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Collection / Series</label>
            <input
              type="text"
              list="collections-list"
              {...register("collection")}
              placeholder="e.g. Bridal 2026"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <datalist id="collections-list">
              {COMMON_COLLECTIONS.map((col) => (
                <option key={col} value={col} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Primary Fabric</label>
            <input
              type="text"
              list="fabrics-list"
              {...register("fabric")}
              placeholder="e.g. Raw Silk"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <datalist id="fabrics-list">
              {COMMON_FABRICS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Base Color</label>
            <input
              type="text"
              {...register("color")}
              placeholder="e.g. Emerald Green & Gold"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-medium text-foreground">Design Description</label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Detailed description of craftsmanship, hand embroidery, neckline, cut, and embellishment specifications..."
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Stock */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground">
          Pricing & Inventory Stock
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Base Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.price && (
              <p className="text-[11px] text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Special / Sale Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("salePrice")}
              placeholder="Leave blank if none"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Estimated Cost Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("costPrice")}
              placeholder="Materials + Labor"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Available Quantity (Stock)
            </label>
            <input
              type="number"
              {...register("availableQuantity")}
              placeholder="0"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Customization Toggle */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-xs font-semibold text-foreground">
                Custom Tailoring & Measurements
              </div>
              <div className="text-[11px] text-muted-foreground">
                Allow clients to order this garment with custom tailor measurements and neckline options
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            {...register("isCustomizable")}
            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Product Images Gallery */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Design Image Gallery
          </h3>
          <button
            type="button"
            onClick={() =>
              appendImage({
                url: "",
                altText: "",
                isPrimary: imageFields.length === 0,
                sortOrder: imageFields.length,
              })
            }
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Image URL
          </button>
        </div>

        {imageFields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No images added yet. Click &quot;Add Image URL&quot; to include lookbook / Instagram photoshoot photos.
          </p>
        ) : (
          <div className="space-y-3">
            {imageFields.map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/60"
              >
                <div className="flex-1 space-y-1">
                  <input
                    type="url"
                    {...register(`images.${idx}.url` as const)}
                    placeholder="https://example.com/photos/blouse-front.jpg"
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="w-48">
                  <input
                    type="text"
                    {...register(`images.${idx}.altText` as const)}
                    placeholder="Label / Alt text"
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`images.${idx}.isPrimary` as const)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Primary
                </label>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Product Variants (Sizes / Colors) */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Size / Color Variants (Ready to Wear)
          </h3>
          <button
            type="button"
            onClick={() =>
              appendVariant({
                name: "Standard - 38",
                sku: `${watch("sku") || "SKU"}-38`,
                size: "38",
                color: watch("color") || "",
                price: undefined,
                stock: 1,
                isActive: true,
              })
            }
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>

        {variantFields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No specific variants added. Garment is managed by base design SKU and custom measurements.
          </p>
        ) : (
          <div className="space-y-3">
            {variantFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg border border-border/60 items-center"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    {...register(`variants.${idx}.name` as const)}
                    placeholder="Variant name (e.g. Size 36)"
                    className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    {...register(`variants.${idx}.sku` as const)}
                    placeholder="Variant SKU"
                    className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    {...register(`variants.${idx}.size` as const)}
                    placeholder="Size (e.g. 38)"
                    className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    {...register(`variants.${idx}.stock` as const)}
                    placeholder="Stock"
                    className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        {isEditing && initialData?.id ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Archive Product
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground min-w-[120px]",
            })}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Design"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
