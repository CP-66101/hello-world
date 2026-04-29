import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/menu-items")({
  component: MenuItemsPage,
});

function MenuItemsPage() {
  const { data: cats = [] } = useQuery({
    queryKey: ["admin", "menu_categories", "options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_categories").select("id,name").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <ResourceManager
      config={{
        table: "menu_items",
        title: "Menu Items",
        orderBy: { column: "sort_order", ascending: true },
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "category_id", label: "Category", type: "select",
            options: cats.map((c: any) => ({ value: c.id, label: c.name })) },
          { key: "price", label: "Price", type: "number" },
          { key: "currency", label: "Currency", type: "text", default: "EGP" },
          { key: "badge", label: "Badge", type: "text", placeholder: "New, Vegan…" },
          { key: "image_url", label: "Image", type: "image", imageFolder: "menu" },
          { key: "sort_order", label: "Order", type: "number", default: 0, hideInTable: true },
          { key: "is_active", label: "Active", type: "boolean", default: true, hideInTable: true },
        ],
      }}
    />
  );
}
