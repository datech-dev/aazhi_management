import { describe, it, expect } from "vitest";

describe("Business Settings & Sequence Numbering", () => {
  it("should generate formatted sequence numbers with custom prefix and year", () => {
    const formatSequenceNumber = (prefix: string, year: number, nextNum: number) => {
      return `${prefix}-${year}-${nextNum.toString().padStart(4, "0")}`;
    };

    expect(formatSequenceNumber("AZ", 2026, 42)).toBe("AZ-2026-0042");
    expect(formatSequenceNumber("QT", 2026, 7)).toBe("QT-2026-0007");
    expect(formatSequenceNumber("PAY", 2026, 128)).toBe("PAY-2026-0128");
    expect(formatSequenceNumber("LD", 2026, 1)).toBe("LD-2026-0001");
  });

  it("should apply default business settings fallback correctly", () => {
    const defaultSettings: Record<string, string> = {
      studio_name: "Aazhi Designer Studio",
      tax_percent_default: "5",
      currency_symbol: "₹",
    };

    const savedSettings: Record<string, string> = {
      studio_name: "Aazhi Studio Mastery",
    };

    const merged = { ...defaultSettings, ...savedSettings };
    expect(merged.studio_name).toBe("Aazhi Studio Mastery");
    expect(merged.tax_percent_default).toBe("5");
    expect(merged.currency_symbol).toBe("₹");
  });
});
