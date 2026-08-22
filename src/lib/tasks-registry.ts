export type TaskLevel = "Junior" | "Middle";

export type TaskDefinition = {
  slug: string;
  title: string;
  level: TaskLevel;
  category: string;
  summary: string;
  status: "available" | "planned";
};

export const TASKS: TaskDefinition[] = [
  {
    slug: "direct-upload",
    title: "Frontend Direct Attachments Upload",
    level: "Middle",
    category: "Develop",
    summary:
      "Upload files straight from the browser to storage using presigned URLs, then link the result to a backend record.",
    status: "available",
  },
  {
    slug: "image-gallery",
    title: "[PoC] Image Gallery with Lazy Loading",
    level: "Junior",
    category: "Develop",
    summary:
      "Responsive, lazy-loaded product gallery with a focus-trapped lightbox, zero CLS and SEO-friendly markup.",
    status: "planned",
  },
  {
    slug: "search-infinite-scroll",
    title: "[PoC] Flight & Hotel Search Results with Infinite Scroll",
    level: "Middle",
    category: "Develop",
    summary:
      "Cursor-paginated, filterable, virtualized results list with optimistic favorites and scroll restoration.",
    status: "planned",
  },
  {
    slug: "storybook-basics",
    title: "Storybook Basics",
    level: "Middle",
    category: "Develop",
    summary:
      "Component-driven development with Storybook: CSF stories, controls, play functions, a11y and docs addons.",
    status: "planned",
  },
  {
    slug: "tailwind-basics",
    title: "Utility-first CSS (Tailwind CSS)",
    level: "Junior",
    category: "Develop",
    summary:
      "Utility-first styling with Tailwind: responsive design, state variants, theming and class composition.",
    status: "planned",
  },
];
