import type { FolderChild } from "./types.ts";

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toSegment(value: string | undefined, fallback: string): string {
  const normalized = sanitizePathSegment(value ?? "");
  return normalized.length > 0 ? normalized : fallback;
}

export function childTitle(child: FolderChild, fallback: string): string {
  const title = typeof child.title === "string" ? child.title.trim() : "";
  return title.length > 0 ? title : fallback;
}
