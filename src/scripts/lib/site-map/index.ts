import { fetchSiteTreeStore } from "./firestore.ts";
import { childTitle, toSegment } from "./path.ts";
import type { PageTreeNode, SitePages } from "./types.ts";

export async function fetchSitePages(siteId: string): Promise<SitePages> {
  const rootFolderId = `root-${siteId}`;
  const { foldersById, filesById } = await fetchSiteTreeStore(siteId);

  const loadFolder = (folderId: string) => {
    const folder = foldersById.get(folderId);
    if (!folder) {
      throw new Error(`Folder "${folderId}" not found`);
    }
    return folder;
  };

  const loadFile = (fileId: string) => {
    const file = filesById.get(fileId);
    if (!file) {
      throw new Error(`File "${fileId}" not found`);
    }
    return file;
  };

  const walkFolder = async ({
    folderId,
    parentPath,
    visited,
  }: {
    folderId: string;
    parentPath: string;
    visited: Set<string>;
  }): Promise<PageTreeNode[]> => {
    if (visited.has(folderId)) {
      throw new Error(`Circular folder reference detected at "${folderId}"`);
    }
    visited.add(folderId);

    const folder = loadFolder(folderId);
    const children = Array.isArray(folder.children) ? folder.children : [];
    const nodes: PageTreeNode[] = [];

    for (const child of children) {
      if (child.isFolder) {
        const childFolder = loadFolder(child.id);
        const title = childTitle(child, childFolder.title ?? child.id);
        const folderPath = parentPath
          ? `${parentPath}/${toSegment(title, child.id)}`
          : toSegment(title, child.id);
        const nestedChildren = await walkFolder({
          folderId: child.id,
          parentPath: folderPath,
          visited,
        });

        nodes.push({
          id: child.id,
          type: "folder",
          title,
          path: folderPath,
          children: nestedChildren,
        });
        continue;
      }

      const file = loadFile(child.id);
      const title = childTitle(child, file.title ?? child.id);
      const filePath = parentPath
        ? `${parentPath}/${toSegment(title, child.id)}`
        : toSegment(title, child.id);

      nodes.push({
        id: child.id,
        type: "file",
        title,
        path: filePath,
        storageFile: file.storageFile,
      });
    }

    visited.delete(folderId);
    return nodes;
  };

  loadFolder(rootFolderId);
  const pages = await walkFolder({
    folderId: rootFolderId,
    parentPath: "",
    visited: new Set<string>(),
  });

  return {
    siteId,
    rootFolderId,
    pages,
  };
}
