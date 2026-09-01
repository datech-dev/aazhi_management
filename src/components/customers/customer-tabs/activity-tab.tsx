import { formatDate } from "@/lib/utils";
import { MessageSquare, ShoppingBag, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/shared/icons";

interface ActivityTabProps {
  conversations: {
    id: string;
    channel: string;
    status: string;
    lastMessageAt: Date | null;
    updatedAt: Date;
  }[];
  ordersCount: number;
}

export function ActivityTab({ conversations, ordersCount }: ActivityTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold font-heading text-foreground">
          Activity & Communication History
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Unified timeline of Instagram DMs, WhatsApp messages, and boutique orders
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {conversations.map((conv) => (
            <div key={conv.id} className="relative flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 -ml-6 text-white text-[10px] ${
                  conv.channel === "INSTAGRAM" ? "bg-pink-600" : "bg-emerald-600"
                }`}
              >
                {conv.channel === "INSTAGRAM" ? (
                  <InstagramIcon className="w-3 h-3 text-white" />
                ) : (
                  <MessageSquare className="w-3 h-3" />
                )}
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-semibold text-foreground">
                  {conv.channel === "INSTAGRAM" ? "Instagram Direct Conversation" : "WhatsApp Chat Session"}
                </div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(conv.lastMessageAt || conv.updatedAt)} • Status: {conv.status}
                </div>
              </div>
            </div>
          ))}

          <div className="relative flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 -ml-6 text-primary-foreground text-[10px]">
              <ShoppingBag className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-foreground">
                Client Profile Active
              </div>
              <div className="text-muted-foreground">
                {ordersCount} order(s) processed across boutique workflows.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
