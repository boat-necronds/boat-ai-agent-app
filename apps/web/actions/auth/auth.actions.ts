"use server";

import { action } from "@/lib/safe-action";
import { loginSchema, registerSchema } from "@workspace/validations";
import { createClient } from "@workspace/supabase/server";
import { createAccount } from "@workspace/services";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const loginAction = action
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    console.log("🔐 Login action started", { email: parsedInput.email });

    const supabase = await createClient();

    console.log("📡 Attempting Supabase signInWithPassword...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    console.log("📧 Supabase signIn response:", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
      error: error?.message,
      errorDetails: error,
    });

    if (error) {
      console.error("❌ Supabase signIn error:", error);
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      console.error("❌ No user or session returned");
      return { success: false, error: "Login failed - no session created" };
    }

    console.log("✅ Login successful, revalidating paths...");
    revalidatePath("/", "layout");

    console.log("🔄 Redirecting to dashboard...");
    redirect("/dashboard");
  });

export const registerAction = action
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    console.log("🚀 Register action started", { email: parsedInput.email });

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    console.log("📧 Supabase signUp response:", {
      hasUser: !!data.user,
      userId: data.user?.id,
      error: error?.message,
    });

    if (error) {
      console.error("❌ Supabase signUp error:", error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      try {
        console.log("👤 Creating account for user:", data.user.id);
        await createAccount(data.user.id);
        console.log("✅ Account created");
      } catch (err) {
        console.error("❌ Error creating account:", err);
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to create user account",
        };
      }
    }

    console.log("✅ Registration completed successfully");
    return {
      success: true,
      message: "Registration successful! Please log in.",
    };
  });

export const logoutAction = action.action(async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
});
