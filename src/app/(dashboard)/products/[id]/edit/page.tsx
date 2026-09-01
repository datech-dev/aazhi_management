import { notFound } from "next/navigation";
import { getProductById, getProductCategories } from "@/services/product.service";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getProductCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description || "",
    categoryId: product.categoryId || "",
    collection: product.collection || "",
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : undefined,
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    availableQuantity: product.availableQuantity,
    lowStockThreshold: product.lowStockThreshold,
    fabric: product.fabric || "",
    color: product.color || "",
    sizeOptions: product.sizeOptions,
    isCustomizable: product.isCustomizable,
    isActive: product.isActive,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: v.price ? Number(v.price) : undefined,
      stock: v.stock,
      isActive: v.isActive,
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Design: ${product.name}`}
        subtitle={`SKU: ${product.sku} • Update design details, fabric options, images, and variant prices.`}
      />

      <ProductForm
        categories={categories}
        initialData={initialData}
        isEditing={true}
      />
    </div>
  );
}
