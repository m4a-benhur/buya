"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export type JoinState = { error?: string };

export async function joinProgramme(businessId: string, _prev: JoinState, formData: FormData): Promise<JoinState> {
  const t = dict[await getLang()];
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const digits = phone.replace(/\D/g, "");

  if (formData.get("consent") !== "on") return { error: t.errConsent };
  if (name.length < 2) return { error: t.errName };
  if (digits.length < 9 || digits.length > 15) return { error: t.errPhone };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_programme", {
    p_business_id: businessId, p_name: name, p_phone: phone,
  });
  if (error || !data) return { error: t.errGeneric };

  redirect(`/card/${data}`);
}
