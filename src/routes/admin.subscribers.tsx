import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscribers")({
  component: Subscribers,
});

function Subscribers() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "subscribers"] }); toast.success("Removed"); },
  });

  function exportCsv() {
    const csv = ["email,subscribed_at", ...data.map((s: any) => `${s.email},${s.created_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "donutoo-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black">Newsletter Subscribers</h2>
        <button onClick={exportCsv} className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted">
          Export CSV
        </button>
      </div>
      <div className="rounded-2xl bg-white shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Subscribed</th><th /></tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No subscribers yet.</td></tr>
            ) : data.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { if (confirm("Remove subscriber?")) del.mutate(s.id); }}
                    className="text-xs font-semibold text-destructive hover:underline"
                  >Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
