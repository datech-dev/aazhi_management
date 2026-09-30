import { NextResponse } from "next/server";
import { whatsAppAdapter } from "@/services/messaging.service";
import { processIncomingMessage } from "@/services/webhook-processor.service";

/**
 * WhatsApp Cloud API Webhook Endpoint
 * GET: Webhook verification with Meta
 * POST: Receive real-time incoming WhatsApp messages
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "aazhi_studio_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WHATSAPP WEBHOOK] Verified successfully");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[WHATSAPP WEBHOOK] Verification failed. Invalid verify token.");
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[WHATSAPP WEBHOOK] Received incoming payload:", JSON.stringify(payload, null, 2));

    const incomingMessages = whatsAppAdapter.parseIncomingWebhook(payload);

    for (const msgPayload of incomingMessages) {
      await processIncomingMessage(msgPayload);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[WHATSAPP WEBHOOK ERROR]", error);
    // Always return 200 to Meta so it does not keep retrying broken payloads endlessly
    return NextResponse.json({ status: "error", message: (error as Error).message }, { status: 200 });
  }
}
