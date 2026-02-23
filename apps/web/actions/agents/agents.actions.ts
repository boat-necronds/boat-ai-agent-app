"use server";

import { authAction } from "@/lib/safe-action";
import { updateAgent } from "@workspace/services";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateAgentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  url: z.string().url().optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  slug: z.string().nullable().optional(),
  allowedModels: z.string().nullable().optional(),
  defaultModel: z.string().nullable().optional(),
  type: z.enum(["platform", "third_party"]).optional(),
  skills: z.string().nullable().optional(),
  capabilities: z.string().nullable().optional(),
  pricingModel: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  rating: z.string().nullable().optional(),
  totalJobs: z.number().int().min(0).optional(),
  completedJobs: z.number().int().min(0).optional(),
  mcpEndpoint: z.string().nullable().optional(),
});

export const updateAgentAction = authAction
  .schema(updateAgentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updates } = parsedInput;
    const agent = await updateAgent(id, {
      title: updates.title,
      description: updates.description,
      url: updates.url,
      status: updates.status,
      sortOrder: updates.sortOrder,
      slug: updates.slug,
      allowedModels: updates.allowedModels,
      defaultModel: updates.defaultModel,
      type: updates.type,
      skills: updates.skills,
      capabilities: updates.capabilities,
      pricingModel: updates.pricingModel,
      price: updates.price,
      rating: updates.rating,
      totalJobs: updates.totalJobs,
      completedJobs: updates.completedJobs,
      mcpEndpoint: updates.mcpEndpoint,
    });

    revalidatePath("/agents");
    revalidatePath(`/agents/${id}`);
    return { success: true, agent };
  });
