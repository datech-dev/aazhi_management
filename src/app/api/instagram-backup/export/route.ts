import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInstagramBackupDetail } from "@/services/instagram-backup.service";

/**
 * GET /api/instagram-backup/export?id=<backupId>
 * 
 * Returns the full backup as a downloadable JSON file.
 * Only authenticated users can download.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const backup = await getInstagramBackupDetail(id);
  if (!backup) return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  if ((backup as any).status !== "COMPLETED") {
    return NextResponse.json({ error: "Backup is not completed" }, { status: 400 });
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    backupId: id,
    instagramUsername: (backup as any).instagramUsername,
    createdAt: (backup as any).createdAt,
    profile: (backup as any).profileData,
    posts: (backup as any).postsData,
    stories: (backup as any).storiesData,
    highlights: (backup as any).highlightsData,
    meta: {
      followersCount: (backup as any).followersCount,
      followingCount: (backup as any).followingCount,
      mediaCount: (backup as any).mediaCount,
      biographyText: (backup as any).biographyText,
      websiteUrl: (backup as any).websiteUrl,
      contactEmail: (backup as any).contactEmail,
      businessCategory: (backup as any).businessCategory,
    },
  };

  const filename = `instagram-backup-${(backup as any).instagramUsername ?? id}-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
