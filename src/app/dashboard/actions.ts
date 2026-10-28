"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

export async function createProgramme(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const stamps = Number(formData.get("stamps_required"));
  const reward = String(formData.get("reward_text") ?? "").trim();

  if (!name) return { error: "Enter your business name." };
  if (!Number.isInteger(stamps) || stamps < 2 || stamps > 20)
    return { error: "Stamps needed must be a whole number from 2 to 20." };
  if (!reward) return { error: "Describe the reward, for example “Free haircut”." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    stamps_required: stamps,
    reward_text: reward,
  });
  if (error) {
    return { error: error.code === "23505" ? "You already have a programme." : error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ---- Owner actions: stamps and rewards ----------------------------------

export async function awardStamp(customerId: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("award_stamp", { p_customer_id: customerId });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function redeemReward(customerId: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_reward", { p_customer_id: customerId });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return {};
}
