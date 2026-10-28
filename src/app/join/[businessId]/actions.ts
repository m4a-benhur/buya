"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type JoinState = { error?: string };

export async function joinProgramme(businessId: string, _prev: JoinState, formData: FormData): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (formData.get("consent") !== "on") return { error: "Please tick the privacy box to join." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_programme", {
    p_business_id: businessId, p_name: name, p_phone: phone,
  });
  if (error || !data) return { error: error?.message ?? "Something went wrong. Please try again." };

  redirect(`/card/${data}`);
}
