import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Register New Client | Aazhi Designer Studio",
};

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Client"
        subtitle="Add a new boutique customer profile with contact information, social handles, and delivery addresses."
      />

      <CustomerForm />
    </div>
  );
}
