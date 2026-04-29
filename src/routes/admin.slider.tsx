import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/slider")({
  component: () => (
    <ResourceManager
      config={{
        table: "slider",
        title: "Hero Slider",
        orderBy: { column: "sort_order", ascending: true },
        fields: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image_url", label: "Image", type: "image", imageFolder: "slider" },
          { key: "cta_label", label: "Button label", type: "text", default: "Our Menu" },
          { key: "cta_href", label: "Button URL", type: "text", default: "/menu" },
          { key: "sort_order", label: "Order", type: "number", default: 0 },
          { key: "is_active", label: "Active", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  ),
});
