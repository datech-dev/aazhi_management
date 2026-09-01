import { prisma } from "@/lib/prisma";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Inventory Material | Aazhi Designer Studio",
};

export default async function NewInventoryItemPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Material to Inventory"
        subtitle="Register raw fabrics, lining, laces, zippers, buttons, or embellishments into your boutique stock ledger."
      />

      <InventoryForm suppliers={suppliers} />
    </div>
  );
}
