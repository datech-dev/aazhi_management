export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IncomingMessagePayload {
  channel: "WHATSAPP" | "INSTAGRAM";
  externalId: string;
  senderId: string;
  senderName?: string;
  content?: string;
  attachments?: {
    type: "image" | "video" | "document" | "audio";
    url?: string;
    mimeType?: string;
    filename?: string;
    size?: number;
  }[];
  timestamp: Date;
  rawPayload: unknown;
}

export interface ChannelAdapter {
  sendTextMessage(to: string, text: string): Promise<MessageResult>;
  sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<MessageResult>;
  sendTemplateMessage(to: string, templateName: string, variables: Record<string, string>): Promise<MessageResult>;
  verifyWebhook(req: Request): boolean | Promise<boolean>;
  parseIncomingWebhook(payload: unknown): IncomingMessagePayload[];
}
