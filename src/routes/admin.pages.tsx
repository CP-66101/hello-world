import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/pages")({
  component: () => (
    <ResourceManager
      config={{
        table: "page_content",
        title: "Page Content Blocks",
        orderBy: { column: "page_key", ascending: true },
        fields: [
          { key: "page_key", label: "Page", type: "select", required: true,
            options: [
              { value: "home", label: "Home" },
              { value: "about", label: "About" },
              { value: "menu", label: "Menu" },
              { value: "contact", label: "Contact" },
              { value: "franchise", label: "Franchise" },
              { value: "blog", label: "Blog" },
            ] },
          { key: "block_key", label: "Block key", type: "text", required: true, placeholder: "hero, story, cta…" },
          { key: "heading", label: "Heading", type: "text" },
          { key: "subheading", label: "Subheading", type: "text" },
          { key: "body", label: "Body", type: "textarea" },
          { key: "image_url", label: "Image", type: "image", imageFolder: "pages" },
          { key: "sort_order", label: "Order", type: "number", default: 0, hideInTable: true },
        ],
      }}
    />
  ),
});
