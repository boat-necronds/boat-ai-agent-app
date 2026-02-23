import { db } from "@workspace/db";
import { pageSections, type PageSection } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function getPageSection(key: string): Promise<PageSection | null> {
  const [section] = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.key, key))
    .limit(1);
  return section ?? null;
}
