import type { Site, Metadata, Socials } from "@/types";

export const SITE: Site = {
  NAME: "Lakshmanshankar",
  EMAIL: "lakshmanshankarc@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 2,
  URL: "https://lakshmanshankar.github.io",
};

export const SITE_BASE_PATH = "/custom-cms-blog-demo";

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION:
    "I am fullstack software developer, have experience in building complex webapplication",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION:
    "About Lakshmanshankar, Journey, Experience, Education, Skills and Interests",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "I wrote about react, Linux and software design",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/Lakshmanshankar",
  },
  {
    NAME: "twitter",
    HREF: "https://twitter.com/10Lakshman",
  },
  {
    NAME: "linkedin",
    HREF: "https://linkedin.com/in/Lakshmanshankar",
  },
  {
    NAME: "Medium",
    HREF: "https://medium.com/@lakshmanashankrc",
  },
  {
    NAME: "Leetcode",
    HREF: "https://leetcode.com/lakshmanashankrc",
  },
];
