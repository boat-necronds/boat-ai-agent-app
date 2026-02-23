"use server";

import { authAction } from "@/lib/safe-action";
import { accountSchema } from "@workspace/validations";
import { getAccount, updateAccount } from "@workspace/services";
import { createClient } from "@workspace/supabase/server";
import { revalidatePath } from "next/cache";

export const updateAccountAction = authAction
  .schema(accountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const updatedAccount = await updateAccount(ctx.user.id, parsedInput);

    revalidatePath("/profile");
    revalidatePath("/settings");

    return { success: true, account: updatedAccount };
  });

export const uploadAvatarAction = authAction
  .schema(accountSchema.pick({ avatarUrl: true }))
  .action(async ({ parsedInput, ctx }) => {
    // Avatar URL is sent after client uploads to Supabase Storage
    const updatedAccount = await updateAccount(ctx.user.id, {
      avatarUrl: parsedInput.avatarUrl,
    });

    revalidatePath("/profile");
    revalidatePath("/", "layout");

    return { success: true, account: updatedAccount };
  });

export const deleteAvatarAction = authAction.action(async ({ ctx }) => {
  const account = await getAccount(ctx.user.id);

  if (account?.avatarUrl) {
    const supabase = await createClient();
    const fileName = account.avatarUrl.split("/").pop();
    if (fileName) {
      await supabase.storage
        .from("avatars")
        .remove([`${ctx.user.id}/${fileName}`]);
    }
  }

  const updatedAccount = await updateAccount(ctx.user.id, {
    avatarUrl: null,
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return { success: true, account: updatedAccount };
});
