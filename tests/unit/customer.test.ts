import { describe, it, expect } from "vitest";
import {
  customerCreateSchema,
  customerSearchSchema,
} from "@/lib/validations/customer";

describe("Customer CRM Validation & Business Logic", () => {
  it("should validate a complete boutique customer profile", () => {
    const validCustomer = {
      fullName: "Priya Sundaram",
      preferredName: "Priya",
      phone: "9876543210",
      whatsappNumber: "9876543210",
      instagramUsername: "@priya_bride",
      email: "priya@example.com",
      preferredChannel: "WHATSAPP" as const,
      source: "INSTAGRAM" as const,
      notes: "Prefers deep back blouse with pearl embroidery",
      tags: ["Bridal", "VIP"],
      addresses: [
        {
          label: "Home",
          line1: "42 Cathedral Road",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600086",
          isDefault: true,
        },
      ],
    };

    const parsed = customerCreateSchema.safeParse(validCustomer);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid Indian phone numbers", () => {
    const invalidCustomer = {
      fullName: "Ananya Krishnan",
      phone: "12345", // invalid
    };

    const parsed = customerCreateSchema.safeParse(invalidCustomer);
    expect(parsed.success).toBe(false);
  });

  it("should parse customer search and sort query parameters", () => {
    const query = {
      search: "priya",
      source: "INSTAGRAM",
      page: "2",
      pageSize: "25",
      sortBy: "totalLifetimeValue",
      sortOrder: "desc",
    };

    const parsed = customerSearchSchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.pageSize).toBe(25);
      expect(parsed.data.sortBy).toBe("totalLifetimeValue");
    }
  });

  it("should allow minimal customer with just fullName and default source", () => {
    const minimal = {
      fullName: "Divya Ramesh",
    };

    const parsed = customerCreateSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.source).toBe("WALK_IN");
      expect(parsed.data.preferredChannel).toBe("WHATSAPP");
    }
  });
});
