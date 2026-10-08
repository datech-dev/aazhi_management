"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createInstagramBackup,
  listInstagramBackups,
  deleteInstagramBackup,
  restoreInstagramBackup,
  getInstagramBackupDetail,
} from "@/services/instagram-backup.service";

/** Trigger a manual backup — only OWNER/ADMIN */
export async function triggerManualBackupAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const backup = await createInstagramBackup({
      triggeredById: session.user.id,
      triggerType: "manual",
    });
    revalidatePath("/settings");
    return { success: true, backupId: backup.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to start backup" };
  }
}

/** List all backups */
export async function listBackupsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: [] };

  try {
    const data = await listInstagramBackups(30);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to list backups", data: [] };
  }
}

/** Get single backup detail (for download/restore modal) */
export async function getBackupDetailAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null };

  try {
    const data = await getInstagramBackupDetail(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to fetch backup", data: null };
  }
}

/** Restore from a backup */
export async function restoreBackupAction(backupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await restoreInstagramBackup(backupId, session.user.id);
    revalidatePath("/settings");
    return { success: true, restoreLogId: result.log.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to restore backup" };
  }
}

/** Delete a backup record */
export async function deleteBackupAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await deleteInstagramBackup(id);
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete backup" };
  }
}
