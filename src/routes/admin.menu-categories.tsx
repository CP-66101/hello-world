import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/menu-categories")({
  component: () => (
    <ResourceManager
      config={{
        table: "menu_categories",
        title: "Menu Categories",
        orderBy: { column: "sort_order", ascending: true },
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image_url", label: "Image", type: "image", imageFolder: "categories" },
          { key: "sort_order", label: "Order", type: "number", default: 0 },
          { key: "is_active", label: "Active", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  ),
});
