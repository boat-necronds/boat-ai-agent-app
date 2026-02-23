import { createSafeActionClient } from "next-safe-action";
import { createClient } from "@workspace/supabase/server";

// Base action client (no auth required)
export const action = createSafeActionClient();

// Authenticated action client with middleware
export const authAction = createSafeActionClient().use(async ({ next }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Return next with user and supabase in context
  return next({ ctx: { user, supabase } });
});
