import type { ChannelAdapter, IncomingMessagePayload, MessageResult } from "./types";
import { prisma } from "@/lib/prisma";

export class InstagramAdapter implements ChannelAdapter {
  private accessToken: string;
  private verifyToken: string;

  constructor(config?: { accessToken?: string; verifyToken?: string }) {
    this.accessToken = config?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || "";
    this.verifyToken = config?.verifyToken || process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "";
  }

  private async getCredentials() {
    let token = this.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || "";
    let verify = this.verifyToken || process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "";

    if (!token) {
      try {
        const dbSettings = await prisma.businessSettings.findMany({
          where: { key: { in: ["instagram_access_token", "instagram_verify_token"] } },
        });
        const map = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));
        token = token || map.instagram_access_token || "";
        verify = verify || map.instagram_verify_token || "aazhi_studio_verify_token";
      } catch (err) {
        console.warn("[InstagramAdapter] Could not read DB credentials:", err);
      }
    }

    return { token, verify };
  }

  async sendTextMessage(to: string, text: string): Promise<MessageResult> {
    const { token } = await this.getCredentials();
    if (!token) {
      return { success: false, error: "Instagram API credentials not configured" };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: to },
          message: { text },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "Failed to send Instagram DM" };
      }

      return { success: true, messageId: data?.message_id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: errorMsg };
    }
  }

  async sendImageMessage(to: string, imageUrl: string): Promise<MessageResult> {
    const { token } = await this.getCredentials();
    if (!token) {
      return { success: false, error: "Instagram API credentials not configured" };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: to },
          message: {
            attachment: {
              type: "image",
              payload: { url: imageUrl },
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error?.message || "Failed to send image" };
      }

      return { success: true, messageId: data?.message_id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: errorMsg };
    }
  }

  async sendTemplateMessage(
    to: string,
    _templateName: string,
    variables: Record<string, string>
  ): Promise<MessageResult> {
    const text = Object.entries(variables)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    return this.sendTextMessage(to, text);
  }

  verifyWebhook(req: Request): boolean {
    const url = new URL(req.url);
    const token = url.searchParams.get("hub.verify_token");
    return token === (this.verifyToken || process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "aazhi_studio_verify_token");
  }

  parseIncomingWebhook(payload: unknown): IncomingMessagePayload[] {
    const results: IncomingMessagePayload[] = [];
    const p = payload as Record<string, unknown>;
    const entry = (p?.entry as Array<Record<string, unknown>>) ?? [];

    for (const e of entry) {
      const messaging = (e?.messaging as Array<Record<string, unknown>>) ?? [];
      for (const msgEvent of messaging) {
        const sender = msgEvent.sender as Record<string, unknown>;
        const senderId = sender?.id as string;
        const message = msgEvent.message as Record<string, unknown>;
        if (!message) continue;

        const msgId = message.mid as string;
        const text = message.text as string | undefined;
        const timestamp = msgEvent.timestamp
          ? new Date(Number(msgEvent.timestamp))
          : new Date();

        const rawAttachments = (message.attachments as Array<Record<string, unknown>>) ?? [];
        const attachments: IncomingMessagePayload["attachments"] = rawAttachments.map((att) => {
          const rawType = (att.type as string) || "image";
          let type: "image" | "video" | "document" | "audio" = "image";
          if (rawType === "video") type = "video";
          else if (rawType === "audio") type = "audio";
          else if (rawType === "file" || rawType === "document") type = "document";

          const payloadObj = (att.payload as Record<string, unknown>) ?? {};
          return {
            type,
            url: payloadObj.url as string | undefined,
          };
        });

        const hasAttachments = attachments && attachments.length > 0;

        results.push({
          channel: "INSTAGRAM",
          externalId: msgId,
          senderId,
          content: text || (hasAttachments ? `[${attachments[0].type.toUpperCase()}]` : ""),
          attachments,
          timestamp,
          rawPayload: msgEvent,
        });
      }
    }

    return results;
  }
}
