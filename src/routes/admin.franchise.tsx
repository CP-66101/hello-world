import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/franchise")({
  component: FranchisePage,
});

function FranchisePage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "franchise_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("franchise_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("franchise_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "franchise_submissions"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-black">Franchise Leads</h2>
      <div className="space-y-3">
        {data.length === 0 && <div className="text-sm text-muted-foreground">No leads yet.</div>}
        {data.map((s: any) => (
          <div key={s.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold">{s.name} <span className="text-xs text-muted-foreground">· {s.email}</span></div>
                {s.phone && <div className="text-xs text-muted-foreground">{s.phone}</div>}
                <div className="text-xs text-muted-foreground">{[s.city, s.country].filter(Boolean).join(", ")}</div>
                {s.investment_capacity && <div className="mt-1 text-sm">💰 {s.investment_capacity}</div>}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</div>
            </div>
            {s.message && <p className="mt-3 text-sm whitespace-pre-wrap">{s.message}</p>}
            <div className="mt-3 text-right">
              <button
                onClick={() => { if (confirm("Delete this lead?")) del.mutate(s.id); }}
                className="text-xs font-semibold text-destructive hover:underline"
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
