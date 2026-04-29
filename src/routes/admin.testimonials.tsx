import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/testimonials")({
  component: () => (
    <ResourceManager
      config={{
        table: "testimonials",
        title: "Testimonials",
        orderBy: { column: "sort_order", ascending: true },
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "role", label: "Role", type: "text" },
          { key: "quote", label: "Quote", type: "textarea", required: true },
          { key: "rating", label: "Rating", type: "number", default: 5 },
          { key: "image_url", label: "Photo", type: "image", imageFolder: "testimonials" },
          { key: "sort_order", label: "Order", type: "number", default: 0, hideInTable: true },
          { key: "is_active", label: "Active", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  ),
});
