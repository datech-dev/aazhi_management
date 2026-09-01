import type { ChannelAdapter, IncomingMessagePayload, MessageResult } from "./types";

export class WhatsAppAdapter implements ChannelAdapter {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";
  }

  async sendTextMessage(to: string, text: string): Promise<MessageResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
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
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
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
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: "WhatsApp API credentials not configured" };
    }

    try {
      const cleanedPhone = to.replace(/[\s\+\-]/g, "");
      const parameters = Object.values(variables).map((val) => ({
        type: "text",
        text: val,
      }));

      const res = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
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
    return token === this.verifyToken;
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
            content = (msg.text as Record<string, unknown>)?.body as string || "";
          } else if (type === "image") {
            const img = msg.image as Record<string, unknown>;
            content = (img?.caption as string) || "[Image]";
            attachments.push({
              type: "image",
              mimeType: img?.mime_type as string,
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
