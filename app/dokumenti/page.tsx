import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardKlijent from "@/components/DashboardKlijent";
import type { Dokument } from "@/lib/tipovi";

export default async function Dokumenti() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");

  const { data: dokumenti } = await supabase
    .from("dokumenti")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <DashboardKlijent
      pocetniDokumenti={(dokumenti ?? []) as Dokument[]}
      email={user.email ?? ""}
    />
  );
}
