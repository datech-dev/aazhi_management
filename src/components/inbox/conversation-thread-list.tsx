"use client";

import { useState } from "react";
import { Search, MessageSquare, Camera, Phone, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ConversationItem {
  id: string;
  channel: "WHATSAPP" | "INSTAGRAM" | "PHONE" | "WALK_IN" | "WEBSITE" | "EMAIL" | "MANUAL";
  status: string;
  subject: string | null;
  lastMessageAt: Date | string | null;
  lastMessagePreview: string | null;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    whatsappNumber: string | null;
    instagramUsername: string | null;
  } | null;
  assignedStaff: {
    id: string;
    name: string;
  } | null;
}

interface ConversationThreadListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelectThread: (id: string) => void;
}

export function ConversationThreadList({
  conversations,
  selectedId,
  onSelectThread,
}: ConversationThreadListProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  const filtered = conversations.filter((c) => {
    const name = c.customer?.fullName || c.subject || "Unknown";
    const matchesSearch =
      search === "" ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(search.toLowerCase()));

    const matchesChannel = channelFilter === "ALL" || c.channel === channelFilter;

    return matchesSearch && matchesChannel;
  });

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return (
          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">
            <MessageSquare className="w-3.5 h-3.5" />
          </span>
        );
      case "INSTAGRAM":
        return (
          <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center text-xs">
            <Camera className="w-3.5 h-3.5" />
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">
            <Phone className="w-3.5 h-3.5" />
          </span>
        );
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Channel Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {["ALL", "WHATSAPP", "INSTAGRAM"].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                channelFilter === ch
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {ch === "ALL" ? "All Channels" : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No conversation threads found.
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selectedId;
            const title = item.customer?.fullName || item.subject || "Guest Customer";

            return (
              <button
                key={item.id}
                onClick={() => onSelectThread(item.id)}
                className={`w-full p-3 text-left transition-colors flex items-start gap-3 ${
                  isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/40"
                }`}
              >
                {getChannelBadge(item.channel)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">{title}</span>
                    {item.lastMessageAt && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatDate(item.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {item.lastMessagePreview || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
