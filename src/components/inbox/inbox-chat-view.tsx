"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  User,
  Phone,
  MessageSquare,
  Camera,
  Target,
  ShoppingBag,
  Sparkles,
  Paperclip,
  CheckCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sendMessageAction, convertConversationToLeadAction } from "@/actions/conversation.actions";
import { toast } from "sonner";

interface MessageItem {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string | null;
  status: string;
  senderName: string | null;
  createdAt: Date | string;
  attachments?: Array<{
    id: string;
    url: string | null;
    type: string;
  }>;
}

interface InboxChatViewProps {
  conversation: {
    id: string;
    channel: string;
    status: string;
    subject: string | null;
    customerId: string | null;
    customer: {
      id: string;
      fullName: string;
      phone: string | null;
      whatsappNumber: string | null;
      instagramUsername: string | null;
      orders?: Array<{ id: string; orderNumber: string; total: any; status: string }>;
    } | null;
    messages: MessageItem[];
  };
}

const TEMPLATES = [
  "Hello! Thank you for reaching out to Aazhi Designer Studio. How may we assist with your custom garment design today?",
  "Your order measurements have been recorded! We are moving your garment into our master cutting pipeline.",
  "Your designer outfit is ready for final fitting! Please visit our studio at your convenience.",
  "Your payment receipt and order confirmation have been dispatched. Thank you for choosing Aazhi!",
];

export function InboxChatView({ conversation }: InboxChatViewProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const customerName = conversation.customer?.fullName || conversation.subject || "Guest Inquiry";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);
    try {
      const res = await sendMessageAction(conversation.id, text);
      if (res.success) {
        setText("");
        toast.success("Message sent");
      } else {
        toast.error(res.error || "Failed to send message");
      }
    } catch {
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const handleConvertToLead = async () => {
    if (!conversation.customerId) {
      toast.error("Thread is not linked to a customer profile");
      return;
    }

    setIsConverting(true);
    try {
      const res = await convertConversationToLeadAction(
        conversation.id,
        conversation.customerId,
        text || conversation.messages[conversation.messages.length - 1]?.content || "Social Inquiry"
      );
      if (res.success) {
        toast.success("Converted inquiry thread into CRM Lead!");
      } else {
        toast.error(res.error || "Failed to convert to lead");
      }
    } catch {
      toast.error("Error converting thread");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Thread Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm font-heading">
            {customerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
              {customerName}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                {conversation.channel}
              </span>
            </h2>
            {conversation.customer?.phone && (
              <p className="text-xs text-muted-foreground">{conversation.customer.phone}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleConvertToLead}
            disabled={isConverting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors text-foreground"
          >
            <Target className="w-3.5 h-3.5 text-amber-600" />
            <span>{isConverting ? "Converting..." : "Convert to Lead"}</span>
          </button>

          {conversation.customerId && (
            <Link
              href={`/orders/new?customerId=${conversation.customerId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Book Order</span>
            </Link>
          )}
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No messages in this conversation thread yet.
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isOutbound = msg.direction === "OUTBOUND";

            return (
              <div
                key={msg.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3.5 rounded-xl text-xs space-y-1 shadow-xs ${
                    isOutbound
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card text-card-foreground border border-border/60 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                      isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    <span>{formatDate(msg.createdAt)}</span>
                    {isOutbound && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input & Templates */}
      <div className="p-3 border-t border-border bg-card space-y-2">
        {/* Quick Response Templates */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(tmpl)}
              className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground whitespace-nowrap transition-colors"
            >
              Template {idx + 1}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your WhatsApp / Instagram reply..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Sending..." : "Send"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
