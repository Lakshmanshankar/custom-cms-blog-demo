import { getCollection, type CollectionEntry } from "astro:content";

const BLOG_PATH = "/blog";
const PROJECT_PATH = "/projects";
const STATIC_URLS = [
    "/",
    "/about",
    "/work",
    "/work/codevantage",
    PROJECT_PATH,
    `${PROJECT_PATH}/excalidraw-with-custom-backend`,
    `${PROJECT_PATH}/orca-project-management-tool`,
    BLOG_PATH,
];

type Posts = CollectionEntry<"blog">[];
export async function GET() {
    const siteUrl = import.meta.env.SITE?.replace(/\/$/, "") || "https://lakshmanshankar.github.io";
    const posts = (await getCollection("blog")) as Posts;
    const publishedPosts = posts.filter((post) => !post.data.draft);

    const staticUrls = STATIC_URLS.map((url) => {
        const fullUrl = `${siteUrl}${url}`;
        return `
            <url>
                <loc>${fullUrl}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
        `;
    }).join("\n");

    const postUrls = publishedPosts
        .map((post) => {
            const lastMod = (post.data.updatedDate ?? post.data.date).toISOString();
            const fullUrl = `${siteUrl}${BLOG_PATH}/${post.data.slug}/`;
            return ` 
                <url>
                    <loc>${fullUrl}</loc>
                    <lastmod>${lastMod}</lastmod>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                </url>`;
        })
        .join("\n");

    const result = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${staticUrls}
            ${postUrls}
        </urlset>
    `;

    return new Response(result, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
