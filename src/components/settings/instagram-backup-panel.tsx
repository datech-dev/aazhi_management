"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  triggerManualBackupAction,
  listBackupsAction,
  restoreBackupAction,
  deleteBackupAction,
} from "@/actions/instagram-backup.actions";
import {
  ShieldCheck,
  RefreshCw,
  Download,
  RotateCcw,
  Trash2,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  ImageIcon,
  FileJson,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// Type definitions
// ──────────────────────────────────────────────────────────────────────────────

interface BackupItem {
  id: string;
  triggerType: string;
  status: string;
  instagramUsername: string | null;
  followersCount: number | null;
  mediaCount: number | null;
  backupSizeKb: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  triggeredBy: { name: string } | null;
  restoreLogs: { id: string; status: string; restoredAt: string }[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function fmtSize(kb: number | null) {
  if (!kb) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function timeSince(d: string | null | undefined) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    COMPLETED: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25", Icon: CheckCircle2 },
    FAILED:    { label: "Failed",    cls: "bg-red-500/15 text-red-400 border-red-500/25",       Icon: XCircle },
    RUNNING:   { label: "Running",   cls: "bg-blue-500/15 text-blue-400 border-blue-500/25",    Icon: Loader2 },
    PENDING:   { label: "Pending",   cls: "bg-amber-500/15 text-amber-400 border-amber-500/25", Icon: Clock },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      <s.Icon className={`w-3 h-3 ${status === "RUNNING" ? "animate-spin" : ""}`} />
      {s.label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Restore confirmation modal
// ──────────────────────────────────────────────────────────────────────────────

function RestoreModal({
  backup,
  onConfirm,
  onCancel,
  isLoading,
}: {
  backup: BackupItem;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Restore Backup</h3>
            <p className="text-xs text-muted-foreground">This will log a recovery event</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-xs">
          <p className="text-foreground font-medium">You are restoring from:</p>
          <p className="text-muted-foreground">@{backup.instagramUsername ?? "unknown"} — backed up {fmtDate(backup.createdAt)}</p>
          <p className="text-amber-400 mt-2 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            This exports your backup data. Use it to manually re-configure a new Instagram account if your original was hacked or deleted.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Confirm Restore
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export function InstagramBackupPanel() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pollingBackupId, setPollingBackupId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listBackupsAction();
    if (res.success) setBackups((res.data ?? []) as unknown as BackupItem[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 4s while a backup is RUNNING/PENDING
  useEffect(() => {
    if (!pollingBackupId) return;
    const interval = setInterval(async () => {
      const res = await listBackupsAction();
      if (res.success) {
        const items = (res.data ?? []) as unknown as BackupItem[];
        setBackups(items);
        const target = items.find((b) => b.id === pollingBackupId);
        if (target && target.status !== "PENDING" && target.status !== "RUNNING") {
          setPollingBackupId(null);
          clearInterval(interval);
          if (target.status === "COMPLETED") toast.success("Instagram backup completed successfully!");
          else toast.error(`Backup failed: ${target.errorMessage ?? "Unknown error"}`);
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [pollingBackupId]);

  const handleTriggerBackup = async () => {
    setIsTriggeringBackup(true);
    const res = await triggerManualBackupAction();
    setIsTriggeringBackup(false);
    if (res.success) {
      toast.success("Backup started! This may take a few seconds...");
      setPollingBackupId(res.backupId ?? null);
      await load();
    } else {
      toast.error(res.error ?? "Failed to start backup");
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    const res = await restoreBackupAction(restoreTarget.id);
    setIsRestoring(false);
    setRestoreTarget(null);
    if (res.success) {
      toast.success("Restore logged! Download the backup JSON to begin account recovery.");
      await load();
    } else {
      toast.error(res.error ?? "Restore failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this backup?")) return;
    setDeletingId(id);
    const res = await deleteBackupAction(id);
    setDeletingId(null);
    if (res.success) { toast.success("Backup deleted"); await load(); }
    else toast.error(res.error ?? "Failed to delete");
  };

  const handleDownload = (backup: BackupItem) => {
    window.open(`/api/instagram-backup/export?id=${backup.id}`, "_blank");
  };

  // Most recent completed backup
  const latest = backups.find((b) => b.status === "COMPLETED");
  const hasRunning = backups.some((b) => b.status === "RUNNING" || b.status === "PENDING");

  return (
    <div className="space-y-6">

      {/* ── Header card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent p-6">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                Instagram Backup & Recovery
                <Sparkles className="w-4 h-4 text-pink-400" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Auto-backup every Monday at 3 AM · Full account snapshot including posts, stories & bio
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={isTriggeringBackup || hasRunning}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-pink-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap"
          >
            {isTriggeringBackup || hasRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {hasRunning ? "Backup Running..." : "Backup Now"}
          </button>
        </div>

        {/* Stats row */}
        {latest && (
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Last Backup", value: timeSince(latest.completedAt), Icon: Clock },
              { label: "Followers", value: (latest.followersCount ?? 0).toLocaleString(), Icon: Users },
              { label: "Posts Saved", value: (latest.mediaCount ?? 0).toLocaleString(), Icon: ImageIcon },
              { label: "Backup Size", value: fmtSize(latest.backupSizeKb), Icon: FileJson },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-background/60 backdrop-blur border border-border/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">{label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── How it works ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: "1", title: "Automatic Snapshots", desc: "Every Monday at 3 AM, the system fetches your full IG profile, posts, stories, bio, followers count, and highlights.", color: "text-pink-500", bg: "bg-pink-500/10" },
          { step: "2", title: "Encrypted Storage", desc: "All data is stored securely in your own database — never on a third-party server. Only your team can access it.", color: "text-purple-500", bg: "bg-purple-500/10" },
          { step: "3", title: "One-click Recovery", desc: "If your account is hacked or deleted, use the backup JSON to rebuild from scratch — captions, followers, bio, highlights all preserved.", color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((item) => (
          <div key={item.step} className="bg-card border border-border/60 rounded-xl p-4 space-y-2">
            <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center text-sm font-bold`}>{item.step}</div>
            <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Backup list ── */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-heading text-foreground">Backup History</h3>
            <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{backups.length}</span>
          </div>
          <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading backups…
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Camera className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No backups yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">Click "Backup Now" to create your first snapshot, or wait for the automatic weekly backup.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {backups.map((backup) => {
              const isExpanded = expandedId === backup.id;
              return (
                <div key={backup.id} className="transition-colors hover:bg-muted/20">
                  {/* Row */}
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    {/* Status */}
                    <StatusBadge status={backup.status} />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {backup.instagramUsername ? `@${backup.instagramUsername}` : "Backup"}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${backup.triggerType === "scheduled" ? "bg-blue-500/10 text-blue-400" : "bg-muted text-muted-foreground"}`}>
                          {backup.triggerType}
                        </span>
                        {backup.triggeredBy && (
                          <span className="text-[10px] text-muted-foreground">by {backup.triggeredBy.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(backup.createdAt)}</span>
                        {backup.followersCount != null && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{backup.followersCount.toLocaleString()} followers</span>}
                        {backup.mediaCount != null && <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />{backup.mediaCount} posts</span>}
                        {backup.backupSizeKb && <span>{fmtSize(backup.backupSizeKb)}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {backup.status === "COMPLETED" && (
                        <>
                          <button
                            onClick={() => handleDownload(backup)}
                            title="Download backup as JSON"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRestoreTarget(backup)}
                            title="Restore / Recovery"
                            className="p-2 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(backup.id)}
                        disabled={deletingId === backup.id}
                        title="Delete backup"
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        {deletingId === backup.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : backup.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3 bg-muted/20 border-t border-border/40">
                      {backup.status === "FAILED" && backup.errorMessage && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span><strong>Error:</strong> {backup.errorMessage}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                        {[
                          { label: "Started", value: fmtDate(backup.startedAt) },
                          { label: "Completed", value: fmtDate(backup.completedAt) },
                          { label: "Restore Events", value: backup.restoreLogs.length.toString() },
                          { label: "Trigger Type", value: backup.triggerType },
                        ].map(({ label, value }) => (
                          <div key={label} className="space-y-0.5">
                            <p className="text-muted-foreground">{label}</p>
                            <p className="font-medium text-foreground">{value}</p>
                          </div>
                        ))}
                      </div>
                      {backup.restoreLogs.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Last Restore</p>
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-foreground">{fmtDate(backup.restoreLogs[0].restoredAt)}</span>
                            <StatusBadge status={backup.restoreLogs[0].status} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Security note ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground">
        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
        <div>
          <span className="font-semibold text-foreground">Your data never leaves your server.</span>{" "}
          Backups are stored in your own PostgreSQL database. The access token is read from your Integration settings
          and is only used server-side. No third parties have access to your backup data.
        </div>
      </div>

      {/* Restore modal */}
      {restoreTarget && (
        <RestoreModal
          backup={restoreTarget}
          onConfirm={handleRestore}
          onCancel={() => setRestoreTarget(null)}
          isLoading={isRestoring}
        />
      )}
    </div>
  );
}


