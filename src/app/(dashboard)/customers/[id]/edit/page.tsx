import { notFound } from "next/navigation";
import { getCustomerById } from "@/services/customer.service";
import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const initialData = {
    id: customer.id,
    fullName: customer.fullName,
    preferredName: customer.preferredName || "",
    phone: customer.phone || "",
    whatsappNumber: customer.whatsappNumber || "",
    instagramUsername: customer.instagramUsername || "",
    email: customer.email || "",
    dateOfBirth: customer.dateOfBirth,
    anniversary: customer.anniversary,
    preferredChannel: customer.preferredChannel as "INSTAGRAM" | "WHATSAPP" | "WALK_IN" | "REFERRAL" | "PHONE" | "WEBSITE" | "OTHER",
    source: customer.source as "INSTAGRAM" | "WHATSAPP" | "WALK_IN" | "REFERRAL" | "PHONE" | "WEBSITE" | "OTHER",
    notes: customer.notes || "",
    tags: customer.tags.map((t) => t.tag.name),
    addresses: customer.addresses.map((a) => ({
      label: a.label,
      line1: a.line1,
      line2: a.line2 || "",
      city: a.city,
      state: a.state || "",
      pincode: a.pincode,
      isDefault: a.isDefault,
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Client: ${customer.fullName}`}
        subtitle="Update contact information, communication channels, boutique style notes, and delivery addresses."
      />

      <CustomerForm initialData={initialData} isEditing={true} />
    </div>
  );
}
