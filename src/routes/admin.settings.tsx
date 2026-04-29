import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const FIELDS: { key: string; label: string; type: "text" | "textarea" | "url" | "image" }[] = [
  { key: "site_name", label: "Site name", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "logo_url", label: "Header logo", type: "image" },
  { key: "footer_logo_url", label: "Footer logo", type: "image" },
  { key: "favicon_url", label: "Favicon", type: "image" },
  { key: "email", label: "Contact email", type: "text" },
  { key: "phone_primary", label: "Primary phone", type: "text" },
  { key: "phone_secondary", label: "Secondary phone", type: "text" },
  { key: "whatsapp_number", label: "WhatsApp number", type: "text" },
  { key: "address_main", label: "Main address", type: "textarea" },
  { key: "address_branch", label: "Branch address", type: "textarea" },
  { key: "hours", label: "Opening hours", type: "text" },
  { key: "facebook_url", label: "Facebook URL", type: "url" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "tiktok_url", label: "TikTok URL", type: "url" },
  { key: "google_maps_embed", label: "Google Maps embed URL", type: "textarea" },
  { key: "contact_info_heading", label: "Contact info heading", type: "text" },
  { key: "timing_heading", label: "Timing heading", type: "text" },
  { key: "get_in_touch_heading", label: "Get in touch heading", type: "text" },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").upsert({ ...form, id: 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black">Site Settings</h2>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-full gradient-pink px-6 py-2 text-sm font-bold text-white shadow-soft"
        >{save.isPending ? "Saving…" : "Save changes"}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl bg-white p-6 shadow-soft">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "md:col-span-2" : ""}>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{f.label}</label>
            {f.type === "image" ? (
              <ImageUpload value={form[f.key]} onChange={(url) => setForm({ ...form, [f.key]: url })} folder="settings" />
            ) : f.type === "textarea" ? (
              <textarea
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={f.type === "url" ? "url" : "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
