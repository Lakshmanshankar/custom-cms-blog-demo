import path from "node:path";
import { fileURLToPath } from "node:url";
import { optionalEnv } from "./lib/env.ts";
import { syncMdxContent } from "./lib/mdx.ts";
import { fetchSitePages } from "./lib/site-map.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

function resolveContentRoot(): string {
  const configuredOutputDir = optionalEnv("CONTENT_SYNC_OUTPUT_DIR");
  const relativeOutputDir = configuredOutputDir || path.join("src", "content");
  return path.resolve(projectRoot, relativeOutputDir);
}

async function main(): Promise<void> {
  const siteId = optionalEnv("DEMO_SITE_ID");
  console.log(`Syncing content to Firebase site ${siteId}`);
  if (!siteId) {
    console.log(
      "Skipping Firebase content sync because DEMO_SITE_ID is not set.",
    );
    return;
  }

  const contentRoot = resolveContentRoot();
  const pageTree = await fetchSitePages(siteId);
  const writtenPaths = await syncMdxContent(pageTree, contentRoot);

  console.log(`Synced ${writtenPaths.length} MDX files into ${contentRoot}`);
}

await main();
