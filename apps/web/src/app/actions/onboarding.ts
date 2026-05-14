"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();

  const country    = formData.get("country") as string;
  const profession = formData.get("profession") as string;
  const currency   = formData.get("currency") as string;
  const goal       = formData.get("goal") as string;

  await supabase.auth.updateUser({
    data: {
      country, profession, currency, goal,
      onboarding_completed: true,
    },
  });

  redirect("/");
}
