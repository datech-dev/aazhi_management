import { ChannelAdapter } from "@/lib/messaging/types";
import { MockChannelAdapter } from "@/lib/messaging/mock";
import { WhatsAppAdapter } from "@/lib/messaging/whatsapp";
import { InstagramAdapter } from "@/lib/messaging/instagram";

const isWhatsAppEnabled = process.env.WHATSAPP_ENABLED === "true";
const isInstagramEnabled = process.env.INSTAGRAM_ENABLED === "true";

export const whatsAppAdapter: ChannelAdapter = isWhatsAppEnabled
  ? new WhatsAppAdapter()
  : new MockChannelAdapter("WHATSAPP");

export const instagramAdapter: ChannelAdapter = isInstagramEnabled
  ? new InstagramAdapter()
  : new MockChannelAdapter("INSTAGRAM");

export function getChannelAdapter(channel: "WHATSAPP" | "INSTAGRAM"): ChannelAdapter {
  if (channel === "WHATSAPP") return whatsAppAdapter;
  if (channel === "INSTAGRAM") return instagramAdapter;
  return new MockChannelAdapter("WHATSAPP");
}
