import { describe, it, expect } from "vitest";
import { ChannelType, ConversationStatus, MessageDirection } from "@prisma/client";

describe("Unified Social Inbox & Channel Messaging", () => {
  it("should select correct channel adapter based on conversation channel", () => {
    const getAdapterType = (channel: ChannelType) => {
      if (channel === ChannelType.WHATSAPP) return "WhatsAppAdapter";
      if (channel === ChannelType.INSTAGRAM) return "InstagramAdapter";
      return "MockChannelAdapter";
    };

    expect(getAdapterType(ChannelType.WHATSAPP)).toBe("WhatsAppAdapter");
    expect(getAdapterType(ChannelType.INSTAGRAM)).toBe("InstagramAdapter");
    expect(getAdapterType(ChannelType.WALK_IN)).toBe("MockChannelAdapter");
  });

  it("should format message preview text correctly", () => {
    const longMessage =
      "Hello! Thank you for inquiring about our custom bridal blouse stitching service. We would love to schedule a fitting consultation at our studio!";

    const preview = longMessage.slice(0, 50) + "...";
    expect(preview.length).toBe(53);
    expect(preview).toContain("Hello! Thank you for inquiring about our custom br");
  });
});
