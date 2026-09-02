import { getConversationsList, getConversationDetails } from "@/services/conversation.service";
import { ConversationThreadList } from "@/components/inbox/conversation-thread-list";
import { InboxChatView } from "@/components/inbox/inbox-chat-view";
import { Inbox } from "lucide-react";

export const metadata = {
  title: "Unified Social Inbox | Aazhi Designer Studio",
  description: "Centralized WhatsApp & Instagram communication hub",
};

interface InboxPageProps {
  searchParams: Promise<{
    id?: string;
    channel?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = await searchParams;

  const conversationsResult = await getConversationsList({
    channel: params.channel as any,
    status: params.status as any,
    search: params.search,
  });

  const selectedThreadId = params.id || conversationsResult.items[0]?.id;
  let activeConversation = null;

  if (selectedThreadId) {
    try {
      activeConversation = await getConversationDetails(selectedThreadId);
    } catch {
      activeConversation = null;
    }
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold font-heading text-foreground">
            Unified Social Inbox
          </h1>
          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
            WhatsApp & Instagram Multi-Channel Messaging Hub
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        <ConversationThreadList
          conversations={conversationsResult.items as any}
          selectedId={selectedThreadId}
          onSelectThread={(id) => {
            // Client navigation or window location
            if (typeof window !== "undefined") {
              window.location.href = `/inbox?id=${id}`;
            }
          }}
        />

        {activeConversation ? (
          <InboxChatView conversation={activeConversation as any} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
            Select a conversation thread to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
