import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditorKlijent from "@/components/EditorKlijent";
import type { Dokument } from "@/lib/tipovi";

export default async function EditorStranica({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");

  const { data: dokument } = await supabase
    .from("dokumenti")
    .select("*")
    .eq("id", id)
    .single();

  if (!dokument) notFound();

  const { data: rjecnikRedovi } = await supabase
    .from("rjecnik")
    .select("rijec");

  const { data: zanemarenoRedovi } = await supabase
    .from("zanemareno")
    .select("kljuc")
    .eq("dokument_id", id);

  return (
    <EditorKlijent
      pocetniDokument={dokument as Dokument}
      pocetniRjecnik={(rjecnikRedovi ?? []).map((r) => r.rijec)}
      pocetnoZanemareno={(zanemarenoRedovi ?? []).map((r) => r.kljuc)}
    />
  );
}
