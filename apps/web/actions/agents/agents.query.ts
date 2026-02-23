"use server";

import { action } from "@/lib/safe-action";
import { getAgents, getAgentById, getPageSection } from "@workspace/services";
import { z } from "zod";

export type AgentStatus = "active" | "inactive" | "maintenance";

export type AgentItem = {
  id: string;
  name: string;
  host: string;
  slug?: string | null;
  description?: string | null;
  url?: string | null;
  status: AgentStatus;
  allowedModels?: string[] | null;
  defaultModel?: string | null;
  /** PRD: 'platform' | 'third_party' */
  type?: string | null;
  skills?: string[] | null;
  capabilities?: string | null;
  pricingModel?: string | null;
  price?: string | null;
  rating?: string | null;
  totalJobs?: number;
  completedJobs?: number;
  mcpEndpoint?: string | null;
  approvedAt?: Date | null;
};

export const getAgentsAction = action.action(async () => {
  const agents = await getAgents();
  const list: AgentItem[] = agents.map((row) => {
    let allowedModels: string[] | null = null;
    let skills: string[] | null = null;
    if (row.allowedModels) {
      try {
        allowedModels = JSON.parse(row.allowedModels) as string[];
      } catch {
        allowedModels = null;
      }
    }
    if (row.skills) {
      try {
        skills = JSON.parse(row.skills) as string[];
      } catch {
        skills = null;
      }
    }
    return {
      id: String(row.id),
      name: row.title ?? "",
      description: row.description ?? null,
      host: row.url ?? "",
      slug: row.slug ?? null,
      status: (row.status ?? "active") as AgentStatus,
      allowedModels: allowedModels ?? null,
      defaultModel: row.defaultModel ?? null,
      type: row.type ?? null,
      skills: skills ?? null,
      capabilities: row.capabilities ?? null,
      pricingModel: row.pricingModel ?? null,
      price: row.price ?? null,
      rating: row.rating ?? null,
      totalJobs: row.totalJobs ?? 0,
      completedJobs: row.completedJobs ?? 0,
      mcpEndpoint: row.mcpEndpoint ?? null,
      approvedAt: row.approvedAt ?? null,
    };
  });
  return { success: true, agents: list };
});

const getAgentByIdSchema = z.object({ id: z.string().uuid() });

export const getAgentByIdAction = action
  .schema(getAgentByIdSchema)
  .action(async ({ parsedInput }) => {
    const agent = await getAgentById(parsedInput.id);
    if (!agent) {
      return { success: false, error: "Agent not found" };
    }
    let allowedModels: string[] | null = null;
    let skills: string[] | null = null;
    if (agent.allowedModels) {
      try {
        allowedModels = JSON.parse(agent.allowedModels) as string[];
      } catch {
        allowedModels = null;
      }
    }
    if (agent.skills) {
      try {
        skills = JSON.parse(agent.skills) as string[];
      } catch {
        skills = null;
      }
    }
    return {
      success: true,
      agent: {
        id: String(agent.id),
        title: agent.title ?? "",
        description: agent.description ?? null,
        url: agent.url ?? "",
        agentType: agent.agentType ?? "",
        status: (agent.status ?? "active") as AgentStatus,
        sortOrder: agent.sortOrder ?? 0,
        slug: agent.slug ?? null,
        allowedModels,
        defaultModel: agent.defaultModel ?? null,
        type: agent.type ?? null,
        skills,
        capabilities: agent.capabilities ?? null,
        pricingModel: agent.pricingModel ?? null,
        price: agent.price ?? null,
        rating: agent.rating ?? null,
        totalJobs: agent.totalJobs ?? 0,
        completedJobs: agent.completedJobs ?? 0,
        mcpEndpoint: agent.mcpEndpoint ?? null,
        approvedAt: agent.approvedAt ?? null,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      },
    };
  });

const getPageSectionSchema = z.object({ key: z.string().min(1) });

export const getPageSectionAction = action
  .schema(getPageSectionSchema)
  .action(async ({ parsedInput }) => {
    const section = await getPageSection(parsedInput.key);
    const defaultSection = {
      title: "Agent",
      description: "Manage agents for Chatbot",
    };
    return {
      success: true,
      section: section
        ? {
            title: section.title ?? defaultSection.title,
            description: section.description ?? null,
          }
        : defaultSection,
    };
  });
