import { getDb } from "../firebase.ts";
import type { File, Folder, SiteTreeStore } from "./types.ts";

const COLLECTION = {
  DOCUMENTS: "documents",
  FOLDERS: "folders",
} as const;

function validateSiteId(
  data: { siteId?: unknown },
  expectedSiteId: string,
  docId: string,
): void {
  if (data.siteId !== expectedSiteId) {
    throw new Error(`Invalid site linkage for document "${docId}"`);
  }
}

export async function fetchSiteTreeStore(
  siteId: string,
): Promise<SiteTreeStore> {
  const db = getDb();
  const [folderSnapshots, fileSnapshots] = await Promise.all([
    db.collection(COLLECTION.FOLDERS).where("siteId", "==", siteId).get(),
    db.collection(COLLECTION.DOCUMENTS).where("siteId", "==", siteId).get(),
  ]);

  const foldersById = new Map<string, Folder>();
  const filesById = new Map<string, File>();

  for (const snapshot of folderSnapshots.docs) {
    const folder = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Folder, "id">),
    } as Folder;
    validateSiteId(folder, siteId, snapshot.id);
    foldersById.set(snapshot.id, folder);
  }

  for (const snapshot of fileSnapshots.docs) {
    const file = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<File, "id">),
    } as File;
    validateSiteId(file, siteId, snapshot.id);
    filesById.set(snapshot.id, file);
  }

  return {
    foldersById,
    filesById,
  };
}
