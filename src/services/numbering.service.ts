import { prisma } from "@/lib/prisma";

export type SequenceType = "ORDER" | "QUOTATION" | "PAYMENT" | "LEAD";

const PREFIX_MAP: Record<SequenceType, string> = {
  ORDER: "AZ",
  QUOTATION: "QT",
  PAYMENT: "PAY",
  LEAD: "LD",
};

/**
 * Concurrency-safe human-readable sequence generator.
 * Format: PREFIX-YEAR-0001 (e.g. AZ-2026-0001)
 */
export async function getNextSequenceNumber(
  type: SequenceType,
  branchId?: string | null
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = PREFIX_MAP[type];

  // We use Prisma transaction to safely upsert and increment the sequence number
  const sequence = await prisma.$transaction(async (tx) => {
    const existing = await tx.numberSequence.findFirst({
      where: {
        prefix,
        year: currentYear,
        branchId: branchId ?? null,
      },
    });

    if (!existing) {
      const created = await tx.numberSequence.create({
        data: {
          prefix,
          year: currentYear,
          lastNumber: 1,
          branchId: branchId ?? null,
        },
      });
      return created.lastNumber;
    }

    const updated = await tx.numberSequence.update({
      where: { id: existing.id },
      data: { lastNumber: { increment: 1 } },
    });

    return updated.lastNumber;
  });

  const padded = String(sequence).padStart(4, "0");
  return `${prefix}-${currentYear}-${padded}`;
}
