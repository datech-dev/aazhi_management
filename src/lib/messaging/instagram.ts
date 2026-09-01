import type { ChannelAdapter, IncomingMessagePayload, MessageResult } from "./types";

export class InstagramAdapter implements ChannelAdapter {
  private accessToken: string;
  private verifyToken: string;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || "";
    this.verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "";
  }

  async sendTextMessage(to: string, text: string): Promise<MessageResult> {
    if (!this.accessToken) {
      return { success: false, error: "Instagram API credentials not configured" };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
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
    if (!this.accessToken) {
      return { success: false, error: "Instagram API credentials not configured" };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
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
    return token === this.verifyToken;
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

        results.push({
          channel: "INSTAGRAM",
          externalId: msgId,
          senderId,
          content: text || "",
          timestamp,
          rawPayload: msgEvent,
        });
      }
    }

    return results;
  }
}
