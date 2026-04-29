import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type SiteSettings = {
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  footer_logo_url: string | null;
  email: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  address_main: string | null;
  address_branch: string | null;
  hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  whatsapp_number: string | null;
  google_maps_embed: string | null;
  contact_info_heading: string | null;
  timing_heading: string | null;
  get_in_touch_heading: string | null;
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNavigation(location: "header" | "footer" = "header") {
  return useQuery({
    queryKey: ["navigation", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation")
        .select("*")
        .eq("location", location)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePageBlocks(page_key: string) {
  return useQuery({
    queryKey: ["page_content", page_key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_key", page_key)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useBlockMap(page_key: string) {
  const q = usePageBlocks(page_key);
  const map = (q.data ?? []).reduce<Record<string, any>>((acc, b: any) => {
    acc[b.block_key] = b;
    return acc;
  }, {});
  return { ...q, map };
}
