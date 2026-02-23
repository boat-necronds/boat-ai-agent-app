import { db, accounts, type Account } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getAccount(userId: string): Promise<Account | null> {
  try {
    console.log("🔍 Getting account for user:", userId);
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, userId))
      .limit(1);

    console.log("✅ Account query result:", {
      found: !!account,
      fullName: account?.fullName,
    });

    return account || null;
  } catch (error) {
    console.error("❌ Error getting account:", error);
    throw error;
  }
}

export async function createAccount(userId: string): Promise<Account> {
  const [account] = await db
    .insert(accounts)
    .values({
      id: userId,
      fullName: null,
      username: null,
      bio: null,
      avatarUrl: null,
      emailNotifications: true,
      pushNotifications: true,
      theme: "system",
      language: "th",
    })
    .returning();

  if (!account) {
    throw new Error("Failed to create account");
  }

  return account;
}

export async function updateAccount(
  userId: string,
  data: Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>,
): Promise<Account> {
  const [updatedAccount] = await db
    .update(accounts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, userId))
    .returning();

  if (!updatedAccount) {
    throw new Error("Failed to update account");
  }

  return updatedAccount;
}
