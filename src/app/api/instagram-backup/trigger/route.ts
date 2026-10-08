import { NextResponse } from "next/server";
import { createInstagramBackup, getLatestCompletedBackup } from "@/services/instagram-backup.service";

/**
 * POST /api/instagram-backup/trigger
 * 
 * Called by a cron service (Vercel Cron / external scheduler) every week.
 * Protected by a shared secret in the Authorization header.
 *
 * Auto-skips if a successful backup already exists within the last 6 days
 * (prevents double-runs on retry).
 */
export async function POST(request: Request) {
  const secret = process.env.BACKUP_CRON_SECRET;
  const auth = request.headers.get("Authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
  const latest = await getLatestCompletedBackup();
  if (latest?.completedAt && Date.now() - latest.completedAt.getTime() < SIX_DAYS_MS) {
    return NextResponse.json({ skipped: true, reason: "Recent backup already exists", lastBackupAt: latest.completedAt });
  }

  const backup = await createInstagramBackup({ triggerType: "scheduled" });
  return NextResponse.json({ success: true, backupId: backup.id }, { status: 202 });
}
