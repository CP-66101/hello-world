import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/blog")({
  component: () => (
    <ResourceManager
      config={{
        table: "blog_posts",
        title: "Blog Posts",
        orderBy: { column: "published_at", ascending: false },
        fields: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true, placeholder: "my-post" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "content", label: "Content (Markdown / HTML)", type: "textarea" },
          { key: "image_url", label: "Cover image", type: "image", imageFolder: "blog" },
          { key: "is_published", label: "Published", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  ),
});
