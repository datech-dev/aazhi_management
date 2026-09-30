import { ChannelAdapter } from "@/lib/messaging/types";
import { MockChannelAdapter } from "@/lib/messaging/mock";
import { WhatsAppAdapter } from "@/lib/messaging/whatsapp";
import { InstagramAdapter } from "@/lib/messaging/instagram";
import { prisma } from "@/lib/prisma";

export const whatsAppAdapter: ChannelAdapter = new WhatsAppAdapter();
export const instagramAdapter: ChannelAdapter = new InstagramAdapter();

export async function getChannelAdapterAsync(channel: "WHATSAPP" | "INSTAGRAM"): Promise<ChannelAdapter> {
  const dbSettings = await prisma.businessSettings.findMany({
    where: {
      key: {
        in: [
          "whatsapp_enabled",
          "whatsapp_access_token",
          "whatsapp_phone_number_id",
          "instagram_enabled",
          "instagram_access_token",
        ],
      },
    },
  });

  const settingsMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));

  const waEnabled =
    process.env.WHATSAPP_ENABLED === "true" ||
    settingsMap.whatsapp_enabled === "true" ||
    Boolean(process.env.WHATSAPP_ACCESS_TOKEN || settingsMap.whatsapp_access_token);

  const igEnabled =
    process.env.INSTAGRAM_ENABLED === "true" ||
    settingsMap.instagram_enabled === "true" ||
    Boolean(process.env.INSTAGRAM_ACCESS_TOKEN || settingsMap.instagram_access_token);

  if (channel === "WHATSAPP") {
    return waEnabled ? new WhatsAppAdapter() : new MockChannelAdapter("WHATSAPP");
  }

  if (channel === "INSTAGRAM") {
    return igEnabled ? new InstagramAdapter() : new MockChannelAdapter("INSTAGRAM");
  }

  return new MockChannelAdapter("WHATSAPP");
}

export function getChannelAdapter(channel: "WHATSAPP" | "INSTAGRAM"): ChannelAdapter {
  const isWhatsAppEnabled = process.env.WHATSAPP_ENABLED === "true";
  const isInstagramEnabled = process.env.INSTAGRAM_ENABLED === "true";

  if (channel === "WHATSAPP") {
    return isWhatsAppEnabled ? whatsAppAdapter : new MockChannelAdapter("WHATSAPP");
  }

  if (channel === "INSTAGRAM") {
    return isInstagramEnabled ? instagramAdapter : new MockChannelAdapter("INSTAGRAM");
  }

  return new MockChannelAdapter("WHATSAPP");
}
