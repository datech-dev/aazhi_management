import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "./audit.service";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

// Types
export interface BackupListItem {
  id: string;
  triggerType: string;
  status: string;
  instagramUsername: string | null;
  followersCount: number | null;
  mediaCount: number | null;
  backupSizeKb: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  triggeredBy: { name: string } | null;
  restoreLogs: { id: string; status: string; restoredAt: Date }[];
}

export interface BackupDetail extends BackupListItem {
  profileData: unknown;
  postsData: unknown;
  storiesData: unknown;
  highlightsData: unknown;
  biographyText: string | null;
  websiteUrl: string | null;
  followingCount: number | null;
}

async function getAccessToken(): Promise<string> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (envToken) return envToken;
  const row = await prisma.businessSettings.findUnique({
    where: { key: "instagram_access_token" },
  });
  return row?.value ?? "";
}

async function graphFetch<T = unknown>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Graph API error (${res.status}) at ${path}: ${errBody}`);
  }
  return res.json() as Promise<T>;
}

function roughSizeKb(data: unknown): number {
  try { return Math.ceil(JSON.stringify(data).length / 1024); } catch { return 0; }
}

export async function runInstagramBackup(backupId: string, token: string): Promise<void> {
  await prisma.instagramBackup.update({ where: { id: backupId }, data: { status: "RUNNING", startedAt: new Date() } });
  try {
    const profile = await graphFetch<Record<string, unknown>>("/me", token, {
      fields: "id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url,account_type,contact_email,business_category_name",
    });

    let postsData: unknown[] = [];
    try {
      const r = await graphFetch<{ data: unknown[] }>("/me/media", token, { fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count", limit: "100" });
      postsData = r.data ?? [];
    } catch { postsData = []; }

    let storiesData: unknown[] = [];
    try {
      const r = await graphFetch<{ data: unknown[] }>("/me/stories", token, { fields: "id,media_type,media_url,timestamp" });
      storiesData = r.data ?? [];
    } catch { storiesData = []; }

    let highlightsData: unknown[] = [];
    try {
      const r = await graphFetch<{ data: unknown[] }>("/me/media_albums", token, { fields: "id,username,media_count" });
      highlightsData = r.data ?? [];
    } catch { highlightsData = []; }

    const backupSizeKb = roughSizeKb(profile) + roughSizeKb(postsData) + roughSizeKb(storiesData) + roughSizeKb(highlightsData);

    await prisma.instagramBackup.update({
      where: { id: backupId },
      data: {
        status: "COMPLETED",
        instagramAccountId: String(profile.id ?? ""),
        instagramUsername: String(profile.username ?? ""),
        profileData: profile as Prisma.InputJsonValue,
        postsData: postsData as Prisma.InputJsonValue,
        storiesData: storiesData as Prisma.InputJsonValue,
        highlightsData: highlightsData as Prisma.InputJsonValue,
        followersCount: Number(profile.followers_count ?? 0),
        followingCount: Number(profile.follows_count ?? 0),
        mediaCount: Number(profile.media_count ?? 0),
        biographyText: String(profile.biography ?? ""),
        websiteUrl: String(profile.website ?? ""),
        contactEmail: String(profile.contact_email ?? ""),
        businessCategory: String(profile.business_category_name ?? ""),
        backupSizeKb,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.instagramBackup.update({ where: { id: backupId }, data: { status: "FAILED", errorMessage: message, completedAt: new Date() } });
    throw err;
  }
}

export async function createInstagramBackup(options: { triggeredById?: string; triggerType?: "manual" | "scheduled" }) {
  const { triggeredById, triggerType = "manual" } = options;
  const token = await getAccessToken();
  if (!token) throw new Error("Instagram access token is not configured. Please set it in Settings → Integrations.");
  const backup = await prisma.instagramBackup.create({ data: { triggeredById: triggeredById ?? null, triggerType, status: "PENDING" } });
  runInstagramBackup(backup.id, token).catch((err) => { console.error("[InstagramBackup] Background job failed:", err); });
  return backup;
}

export async function listInstagramBackups(limit = 20) {
  return prisma.instagramBackup.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      triggeredBy: { select: { name: true } },
      restoreLogs: { orderBy: { restoredAt: "desc" }, take: 1, select: { id: true, status: true, restoredAt: true } },
    },
  });
}

export async function getInstagramBackupDetail(id: string) {
  return prisma.instagramBackup.findUnique({
    where: { id },
    include: {
      triggeredBy: { select: { name: true } },
      restoreLogs: { orderBy: { restoredAt: "desc" }, take: 5, select: { id: true, status: true, restoredAt: true } },
    },
  });
}

export async function deleteInstagramBackup(id: string) {
  await prisma.instagramBackup.delete({ where: { id } });
}

export async function restoreInstagramBackup(backupId: string, restoredById: string) {
  const backup = await prisma.instagramBackup.findUnique({ where: { id: backupId } });
  if (!backup) throw new Error("Backup not found");
  if (backup.status !== "COMPLETED") throw new Error("Cannot restore from a backup that is not COMPLETED");
  const log = await prisma.instagramRestoreLog.create({
    data: { backupId, restoredById, status: "COMPLETED", notes: `Restore initiated by user ${restoredById} at ${new Date().toISOString()}` },
  });
  await logAudit({ userId: restoredById, action: "restore", entityType: "instagram_backup", entityId: backupId, newValue: { backupId, username: backup.instagramUsername, restoredAt: new Date().toISOString() } });
  return { log, backup };
}

export async function getLatestCompletedBackup() {
  return prisma.instagramBackup.findFirst({ where: { status: "COMPLETED" }, orderBy: { completedAt: "desc" } });
}

