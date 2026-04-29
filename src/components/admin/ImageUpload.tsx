import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ImageUpload({
  value,
  onChange,
  folder = "general",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 w-24 rounded-lg object-cover border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-white text-xs h-6 w-6"
          >×</button>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
          {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" hidden onChange={handle} disabled={busy} />
        </label>
        <input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste URL"
          className="flex-1 rounded-md border px-2 py-1.5 text-xs"
        />
      </div>
    </div>
  );
}
