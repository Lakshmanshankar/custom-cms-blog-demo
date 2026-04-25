import path from "node:path";
import { getBucket } from "./firebase.ts";
import { ensureDir, resetDir, writeTextFile } from "./fs.ts";
import type { PageTreeFileNode, PageTreeNode, SitePages } from "./site-map.ts";

const COLLECTION_DIRS = {
  blog: "blog",
  pages: "pages",
  project: "projects",
  projects: "projects",
  work: "work",
} as const;

type CollectionKey = keyof typeof COLLECTION_DIRS;

type ResolvedContentTarget = {
  collection?: CollectionKey;
  contentDir: string;
  relativePath: string;
  slugPath: string;
};

function flattenFileNodes(nodes: PageTreeNode[]): PageTreeFileNode[] {
  const files: PageTreeFileNode[] = [];

  for (const node of nodes) {
    if (node.type === "folder") {
      files.push(...flattenFileNodes(node.children));
      continue;
    }

    files.push(node);
  }

  return files;
}

function safeRelativePath(relPath: string): string {
  const normalized = relPath.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error(`Invalid page tree path: ${relPath}`);
  }
  return normalized;
}

function toSlug(relPath: string): string {
  const normalized = relPath.replace(/\\/g, "/");
  return normalized === "index" ? "/" : `/${normalized}`;
}

function resolveContentTarget(relPath: string): ResolvedContentTarget {
  const normalizedPath = safeRelativePath(relPath).replace(/\\/g, "/");
  const segments = normalizedPath.split("/").filter(Boolean);
  const [collectionSegment, ...restSegments] = segments;

  if (!collectionSegment) {
    throw new Error(`Invalid empty content path: "${relPath}"`);
  }

  if (!(collectionSegment in COLLECTION_DIRS)) {
    return {
      collection: "pages",
      contentDir: COLLECTION_DIRS.pages,
      relativePath: normalizedPath,
      slugPath: toSlug(normalizedPath),
    };
  }

  const collection = collectionSegment as CollectionKey;
  const relativePath =
    restSegments.length > 0 ? restSegments.join("/") : "index";

  return {
    collection,
    contentDir: COLLECTION_DIRS[collection],
    relativePath,
    slugPath: toSlug(relativePath),
  };
}

function inferDescription(content: string, fallback: string): string {
  const summary = content
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return summary ? summary.slice(0, 160) : fallback;
}

function upsertFrontmatter(
  content: string,
  title: string,
  slug: string,
): string {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
  const titleLine = `title: ${JSON.stringify(title)}`;
  const slugLine = `slug: ${JSON.stringify(slug)}`;
  const descriptionLine = `description: ${JSON.stringify(inferDescription(content, title))}`;
  const dateLine = `date: ${JSON.stringify(new Date().toISOString())}`;
  const match = frontmatterRegex.exec(content);

  if (!match) {
    const body = content.trimStart();
    const frontmatter = `---${eol}${titleLine}${eol}${slugLine}${eol}${descriptionLine}${eol}${dateLine}${eol}---`;
    return body ? `${frontmatter}${eol}${eol}${body}` : `${frontmatter}${eol}`;
  }

  const existingFrontmatter = match[1];
  const body = content.slice(match[0].length);
  const preservedLines = existingFrontmatter
    .split(/\r?\n/)
    .filter((line) => !/^\s*(title|slug|description|date)\s*:/.test(line));
  const updatedFrontmatter = `---${eol}${[...preservedLines, titleLine, slugLine, descriptionLine, dateLine].join(eol)}${eol}---`;
  return body
    ? `${updatedFrontmatter}${eol}${body}`
    : `${updatedFrontmatter}${eol}`;
}

async function downloadMdx(
  siteId: string,
  storageFile: string,
): Promise<string> {
  const normalizedStorageFile = storageFile.replace(/^\/+/, "");
  const storagePath = normalizedStorageFile.startsWith(`${siteId}/`)
    ? normalizedStorageFile
    : `${siteId}/${normalizedStorageFile}`;
  const file = getBucket().file(storagePath);
  const [bytes] = await file.download();
  return bytes.toString("utf8");
}

export async function syncMdxContent(
  pageTree: SitePages,
  contentRoot: string,
): Promise<string[]> {
  const fileNodes = flattenFileNodes(pageTree.pages);

  await Promise.all([
    resetDir(path.join(contentRoot, "blog")),
    resetDir(path.join(contentRoot, "pages")),
    resetDir(path.join(contentRoot, "projects")),
    resetDir(path.join(contentRoot, "work")),
  ]);

  const writtenPaths: string[] = [];
  for (const fileNode of fileNodes) {
    const target = resolveContentTarget(fileNode.path);
    const relPath = path.join(target.contentDir, `${target.relativePath}.mdx`);
    const absolutePath = path.join(contentRoot, relPath);
    const mdxContent = await downloadMdx(pageTree.siteId, fileNode.storageFile);
    const contentWithFrontmatter = upsertFrontmatter(
      mdxContent,
      fileNode.title,
      target.slugPath,
    );

    await ensureDir(path.dirname(absolutePath));
    await writeTextFile(absolutePath, contentWithFrontmatter);
    writtenPaths.push(relPath.replace(/\\/g, "/"));
  }

  return writtenPaths;
}
