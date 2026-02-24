import { db } from "@workspace/db";
import { agents, type Agent } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

export type CreateAgentInput = {
  title: string;
  description?: string | null;
  url: string;
  agentType: string;
  status?: "active" | "inactive" | "maintenance";
  sortOrder?: number;
  slug?: string | null;
  allowedModels?: string | null;
  defaultModel?: string | null;
  type?: "platform" | "third_party";
  skills?: string | null;
  capabilities?: string | null;
  pricingModel?: string | null;
  price?: string | null;
  mcpEndpoint?: string | null;
};

export async function createAgent(data: CreateAgentInput): Promise<Agent> {
  const [created] = await db
    .insert(agents)
    .values({
      title: data.title,
      description: data.description ?? null,
      url: data.url,
      agentType: data.agentType,
      status: data.status ?? "active",
      sortOrder: data.sortOrder ?? 0,
      slug: data.slug ?? null,
      allowedModels: data.allowedModels ?? null,
      defaultModel: data.defaultModel ?? null,
      type: data.type ?? "platform",
      skills: data.skills ?? null,
      capabilities: data.capabilities ?? null,
      pricingModel: data.pricingModel ?? null,
      price: data.price ?? null,
      mcpEndpoint: data.mcpEndpoint ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create agent");
  }
  return created;
}

export async function getAgents(): Promise<Agent[]> {
  return db
    .select()
    .from(agents)
    .orderBy(asc(agents.sortOrder), asc(agents.createdAt));
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);
  return agent ?? null;
}

export type UpdateAgentInput = Partial<{
  title: string;
  description: string | null;
  url: string;
  status: "active" | "inactive" | "maintenance";
  sortOrder: number;
  slug: string | null;
  allowedModels: string | null;
  defaultModel: string | null;
  type: "platform" | "third_party";
  skills: string | null;
  capabilities: string | null;
  pricingModel: string | null;
  price: string | null;
  rating: string | null;
  totalJobs: number;
  completedJobs: number;
  mcpEndpoint: string | null;
  approvedAt: Date | null;
}>;

export async function updateAgent(
  id: string,
  data: UpdateAgentInput
): Promise<Agent> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.allowedModels !== undefined) updateData.allowedModels = data.allowedModels;
  if (data.defaultModel !== undefined) updateData.defaultModel = data.defaultModel;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.capabilities !== undefined) updateData.capabilities = data.capabilities;
  if (data.pricingModel !== undefined) updateData.pricingModel = data.pricingModel;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.totalJobs !== undefined) updateData.totalJobs = data.totalJobs;
  if (data.completedJobs !== undefined) updateData.completedJobs = data.completedJobs;
  if (data.mcpEndpoint !== undefined) updateData.mcpEndpoint = data.mcpEndpoint;
  if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt;

  const [updated] = await db
    .update(agents)
    .set(updateData as Partial<Agent>)
    .where(eq(agents.id, id))
    .returning();

  if (!updated) {
    throw new Error("Agent not found");
  }
  return updated;
}
