import { getProductCategories } from "@/services/product.service";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Boutique Design | Aazhi Designer Studio",
};

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Boutique Design"
        subtitle="Register a new bridal lehenga, custom blouse design, kurti pattern, or saree into your catalog."
      />

      <ProductForm categories={categories} />
    </div>
  );
}
