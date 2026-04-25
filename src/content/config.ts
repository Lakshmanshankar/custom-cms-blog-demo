import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().optional(),
  tags: z.string().array().optional(),
  image: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  demoURL: z.string().optional(),
  repoURL: z.string().optional(),
  draft: z.boolean().optional(),
});

const workSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  date: z.coerce.date().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  dateStart: z.string().optional(),
  tech: z.string().optional(),
  description: z.string(),
  dateEnd: z.string().optional(),
  draft: z.boolean().optional(),
});

const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().optional(),
});

const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "**/*.mdx"],
    base: "src/content/blog",
  }),
  schema: blogSchema,
});

const project = defineCollection({
  loader: glob({ pattern: "**/**.mdx", base: "src/content/projects" }),
  schema: projectSchema,
});

const work = defineCollection({
  loader: glob({ pattern: "**/**.mdx", base: "src/content/work" }),
  schema: workSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: "**/**.mdx", base: "src/content/pages" }),
  schema: pageSchema,
});

export type BlogPost = z.infer<typeof blogSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Work = z.infer<typeof workSchema>;
export type Page = z.infer<typeof pageSchema>;
export const collections = { blog, project, work, pages };
