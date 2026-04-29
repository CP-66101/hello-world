import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/navigation")({
  component: () => (
    <ResourceManager
      config={{
        table: "navigation",
        title: "Navigation Links",
        orderBy: { column: "sort_order", ascending: true },
        fields: [
          { key: "label", label: "Label", type: "text", required: true },
          { key: "href", label: "URL", type: "text", required: true, placeholder: "/menu" },
          { key: "location", label: "Location", type: "select", default: "header",
            options: [
              { value: "header", label: "Header" },
              { value: "footer", label: "Footer" },
            ] },
          { key: "sort_order", label: "Order", type: "number", default: 0 },
          { key: "is_active", label: "Active", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  ),
});
