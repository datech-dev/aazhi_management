import type { ChannelAdapter, IncomingMessagePayload, MessageResult } from "./types";

export class MockChannelAdapter implements ChannelAdapter {
  constructor(private channel: "WHATSAPP" | "INSTAGRAM") {}

  async sendTextMessage(to: string, text: string): Promise<MessageResult> {
    console.log(`[MOCK ${this.channel}] Sending text message to ${to}: "${text}"`);
    return {
      success: true,
      messageId: `mock_${this.channel.toLowerCase()}_${Date.now()}`,
    };
  }

  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<MessageResult> {
    console.log(`[MOCK ${this.channel}] Sending image to ${to}: ${imageUrl} | Caption: "${caption || ""}"`);
    return {
      success: true,
      messageId: `mock_${this.channel.toLowerCase()}_${Date.now()}`,
    };
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<MessageResult> {
    console.log(
      `[MOCK ${this.channel}] Sending template "${templateName}" to ${to} with variables:`,
      variables
    );
    return {
      success: true,
      messageId: `mock_${this.channel.toLowerCase()}_${Date.now()}`,
    };
  }

  verifyWebhook(_req: Request): boolean {
    return true;
  }

  parseIncomingWebhook(payload: unknown): IncomingMessagePayload[] {
    console.log(`[MOCK ${this.channel}] Parsing mock webhook payload:`, payload);
    return [];
  }
}
