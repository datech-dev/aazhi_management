import { describe, it, expect } from "vitest";
import { LeadStatus } from "@prisma/client";

describe("Lead Management & Pipeline Stage Calculations", () => {
  it("should calculate total estimated pipeline value by status stage", () => {
    const leads = [
      { id: "l1", status: LeadStatus.NEW, estimatedValue: 12000 },
      { id: "l2", status: LeadStatus.QUOTE_SENT, estimatedValue: 25000 },
      { id: "l3", status: LeadStatus.QUOTE_SENT, estimatedValue: 18000 },
      { id: "l4", status: LeadStatus.CONVERTED, estimatedValue: 30000 },
    ];

    const quoteSentTotal = leads
      .filter((l) => l.status === LeadStatus.QUOTE_SENT)
      .reduce((sum, l) => sum + l.estimatedValue, 0);

    const totalPipelineValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0);

    expect(quoteSentTotal).toBe(43000);
    expect(totalPipelineValue).toBe(85000);
  });

  it("should validate lead conversion status update", () => {
    let lead = { status: LeadStatus.NEGOTIATION, convertedAt: null as Date | null };

    const convertLead = (targetStatus: LeadStatus) => {
      lead.status = targetStatus;
      if (targetStatus === LeadStatus.CONVERTED) {
        lead.convertedAt = new Date();
      }
    };

    convertLead(LeadStatus.CONVERTED);
    expect(lead.status).toBe(LeadStatus.CONVERTED);
    expect(lead.convertedAt).not.toBeNull();
  });
});
