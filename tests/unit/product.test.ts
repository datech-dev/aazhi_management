import { describe, it, expect } from "vitest";
import {
  productCreateSchema,
  productSearchSchema,
} from "@/lib/validations/product";

describe("Product Catalog Validation & Business Logic", () => {
  it("should validate a complete boutique garment design with variants", () => {
    const validProduct = {
      name: "Peacock Blue Bridal Aari Blouse",
      sku: "BL-AAR-001",
      description: "Heavy zardosi and pearl hand embroidery on pure raw silk",
      price: 8500,
      costPrice: 4200,
      salePrice: 7999,
      availableQuantity: 3,
      fabric: "Raw Silk",
      color: "Peacock Blue",
      isCustomizable: true,
      images: [
        {
          url: "https://example.com/photos/blouse-1.jpg",
          altText: "Front neck view",
          isPrimary: true,
        },
      ],
      variants: [
        {
          name: "Size 36",
          sku: "BL-AAR-001-36",
          size: "36",
          stock: 1,
        },
        {
          name: "Size 38",
          sku: "BL-AAR-001-38",
          size: "38",
          stock: 2,
        },
      ],
    };

    const parsed = productCreateSchema.safeParse(validProduct);
    expect(parsed.success).toBe(true);
  });

  it("should reject product with invalid SKU or zero price", () => {
    const invalidProduct = {
      name: "Silk Saree",
      sku: "S", // too short
      price: -100, // negative price
    };

    const parsed = productCreateSchema.safeParse(invalidProduct);
    expect(parsed.success).toBe(false);
  });

  it("should parse product search query parameters", () => {
    const query = {
      search: "silk",
      stockStatus: "low_stock",
      isCustomizable: "true",
      page: "1",
      pageSize: "20",
      sortBy: "price",
      sortOrder: "desc",
    };

    const parsed = productSearchSchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sortBy).toBe("price");
      expect(parsed.data.stockStatus).toBe("low_stock");
    }
  });
});
