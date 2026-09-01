"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import { addCustomerNoteAction } from "@/actions/customer.actions";
import {
  MapPin,
  FileText,
  Calendar,
  Send,
  Loader2,
  Clock,
  User,
  Heart,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface OverviewTabProps {
  customer: {
    id: string;
    phone: string | null;
    whatsappNumber: string | null;
    instagramUsername: string | null;
    email: string | null;
    dateOfBirth: Date | null;
    anniversary: Date | null;
    notes: string | null;
    addresses: {
      id: string;
      label: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string | null;
      pincode: string;
      isDefault: boolean;
    }[];
    customerNotes: {
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string;
        role: string;
      };
    }[];
  };
}

export function OverviewTab({ customer }: OverviewTabProps) {
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [noteError, setNoteError] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNoteError("");
    startTransition(async () => {
      const res = await addCustomerNoteAction(customer.id, newNote);
      if (res.success) {
        setNewNote("");
      } else {
        setNoteError(res.error || "Failed to add note");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Details & Addresses */}
      <div className="lg:col-span-2 space-y-6">
        {/* Important Dates & Style Preferences */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold font-heading text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            Special Dates & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-background border border-border/70">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Birthday
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "Not recorded"}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-background border border-border/70">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                Anniversary
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {customer.anniversary ? formatDate(customer.anniversary) : "Not recorded"}
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="pt-2">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Permanent Style Notes
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-sm text-foreground">
                {customer.notes}
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold font-heading text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Saved Addresses ({customer.addresses.length})
          </h3>

          {customer.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No delivery addresses saved for this customer.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border text-sm space-y-1 relative ${
                    addr.isDefault
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/70 bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-foreground pt-1">{addr.line1}</p>
                  {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                  <p className="text-muted-foreground">
                    {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Stylist Notes Log */}
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold font-heading text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Consultation Notes
          </h3>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            {noteError && (
              <p className="text-xs text-destructive">{noteError}</p>
            )}
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add consultation / fitting note..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isPending || !newNote.trim()}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "w-full text-xs bg-primary text-primary-foreground hover:bg-primary/90",
              })}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1.5" />
              )}
              Post Note
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto">
            {customer.customerNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No consultation notes recorded yet.
              </p>
            ) : (
              customer.customerNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <User className="w-3 h-3 text-primary" />
                      {note.user.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
