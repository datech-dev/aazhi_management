import type { ChannelAdapter, IncomingMessagePayload, MessageResult } from "./types";
import { prisma } from "@/lib/prisma";

export class WhatsAppAdapter implements ChannelAdapter {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;

  constructor(config?: { accessToken?: string; phoneNumberId?: string; verifyToken?: string }) {
    this.accessToken = config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.verifyToken = config?.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";
  }

  private async getCredentials() {
    let token = this.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";
    let phoneId = this.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    let verify = this.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";

    if (!token || !phoneId) {
      try {
        const dbSettings = await prisma.businessSettings.findMany({
          where: { key: { in: ["whatsapp_access_token", "whatsapp_phone_number_id", "whatsapp_verify_token"] } },
        });
        const map = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));
        token = token || map.whatsapp_access_token || "";
        phoneId = phoneId || map.whatsapp_phone_number_id || "";
        verify = verify || map.whatsapp_verify_token || "aazhi_studio_verify_token";
      } catch (err) {
        console.warn("[WhatsAppAdapter] Could not read DB credentials:", err);
      }
    }

    return { token, phoneId, verify };
  }

  async sendTextMessage(to: string, text: string): Promise<MessageResult> {
    const { token, phoneId } = await this.getCredentials();
    if (!token || !phoneId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanedPhone,
            type: "text",
            text: { body: text },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "Failed to send message" };
      }

      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: errorMsg };
    }
  }

  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<MessageResult> {
    const { token, phoneId } = await this.getCredentials();
    if (!token || !phoneId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanedPhone,
            type: "image",
            image: { link: imageUrl, caption: caption || undefined },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "Failed to send image" };
      }

      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: errorMsg };
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<MessageResult> {
    const { token, phoneId } = await this.getCredentials();
    if (!token || !phoneId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const parameters = Object.values(variables).map((val) => ({
        type: "text",
        text: val,
      }));

      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanedPhone,
            type: "template",
            template: {
              name: templateName,
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters,
                },
              ],
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "Failed to send template" };
      }

      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: errorMsg };
    }
  }

  verifyWebhook(req: Request): boolean {
    const url = new URL(req.url);
    const token = url.searchParams.get("hub.verify_token");
    return token === (this.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "aazhi_studio_verify_token");
  }

  parseIncomingWebhook(payload: unknown): IncomingMessagePayload[] {
    const results: IncomingMessagePayload[] = [];
    const p = payload as Record<string, unknown>;
    const entry = (p?.entry as Array<Record<string, unknown>>) ?? [];

    for (const e of entry) {
      const changes = (e?.changes as Array<Record<string, unknown>>) ?? [];
      for (const change of changes) {
        const value = change?.value as Record<string, unknown>;
        const messages = (value?.messages as Array<Record<string, unknown>>) ?? [];
        const contacts = (value?.contacts as Array<Record<string, unknown>>) ?? [];
        const contactName = (contacts[0]?.profile as Record<string, unknown>)?.name as string | undefined;

        for (const msg of messages) {
          const from = msg.from as string;
          const msgId = msg.id as string;
          const timestamp = msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date();
          const type = msg.type as string;

          let content = "";
          const attachments: IncomingMessagePayload["attachments"] = [];

          if (type === "text") {
            content = ((msg.text as Record<string, unknown>)?.body as string) || "";
          } else if (type === "image") {
            const img = msg.image as Record<string, unknown>;
            content = (img?.caption as string) || "[Image]";
            attachments.push({
              type: "image",
              url: img?.url as string,
              mimeType: (img?.mime_type as string) || "image/jpeg",
            });
          } else if (type === "video") {
            const vid = msg.video as Record<string, unknown>;
            content = (vid?.caption as string) || "[Video]";
            attachments.push({
              type: "video",
              url: vid?.url as string,
              mimeType: (vid?.mime_type as string) || "video/mp4",
            });
          } else if (type === "document") {
            const doc = msg.document as Record<string, unknown>;
            content = (doc?.caption as string) || (doc?.filename as string) || "[Document]";
            attachments.push({
              type: "document",
              url: doc?.url as string,
              mimeType: (doc?.mime_type as string) || "application/pdf",
            });
          } else if (type === "audio") {
            content = "[Voice Message]";
            attachments.push({
              type: "audio",
              mimeType: "audio/ogg",
            });
          }

          results.push({
            channel: "WHATSAPP",
            externalId: msgId,
            senderId: from,
            senderName: contactName,
            content,
            attachments,
            timestamp,
            rawPayload: msg,
          });
        }
      }
    }

    return results;
  }
}
