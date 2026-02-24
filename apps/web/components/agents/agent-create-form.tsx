"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAgentAction } from "@/actions/agents";
import type { AgentStatus } from "@/actions/agents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  url: z.string().url("Invalid URL"),
  agentType: z.string().min(1, "Agent type is required"),
  status: z.enum(["active", "inactive", "maintenance"]),
  sortOrder: z.coerce.number().int().min(0),
  slug: z.string().nullable(),
  type: z.enum(["platform", "third_party"]).optional(),
  skills: z.string().nullable(),
  capabilities: z.string().nullable(),
  pricingModel: z.string().nullable(),
  price: z.string().nullable(),
  mcpEndpoint: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  title: "",
  description: "",
  url: "https://boat-agent-all.atsadawat-kontha.workers.dev",
  agentType: "general",
  status: "active",
  sortOrder: 0,
  slug: "",
  type: "platform",
  skills: "",
  capabilities: "",
  pricingModel: "",
  price: "",
  mcpEndpoint: "",
};

export function AgentCreateForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const status = watch("status");
  const type = watch("type");

  const { execute, isExecuting } = useAction(createAgentAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.agent?.id) {
        toast.success("Agent created");
        router.push(`/agents/${data.agent.id}`);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });

  const onSubmit = (values: FormValues) => {
    const skillsArr = values.skills
      ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    execute({
      title: values.title,
      description: values.description || null,
      url: values.url,
      agentType: values.agentType,
      status: values.status as AgentStatus,
      sortOrder: values.sortOrder,
      slug: values.slug || null,
      type:
        values.type === "third_party" || values.type === "platform"
          ? values.type
          : undefined,
      skills: skillsArr.length > 0 ? JSON.stringify(skillsArr) : null,
      capabilities: values.capabilities || null,
      pricingModel: values.pricingModel || null,
      price: values.price || null,
      mcpEndpoint: values.mcpEndpoint || null,
    });
  };

  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Create agent</CardTitle>
              <CardDescription>
                Add a new agent for use in Chatbot
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Fitness Coach"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Agent description"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              {...register("url")}
              placeholder="https://..."
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agentType">Agent type</Label>
            <Input
              id="agentType"
              {...register("agentType")}
              placeholder="e.g. fitness, image, voice, general"
            />
            {errors.agentType && (
              <p className="text-sm text-destructive">
                {errors.agentType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as AgentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...register("sortOrder")}
            />
            {errors.sortOrder && (
              <p className="text-sm text-destructive">
                {errors.sortOrder.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="e.g. fitness-coach, image, voice"
            />
            <p className="text-xs text-muted-foreground">
              Used for Chatbot routing (e.g. image → ImageAgent, voice →
              VoiceAgent)
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Marketplace (PRD)
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) =>
                    setValue("type", v as "platform" | "third_party")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform</SelectItem>
                    <SelectItem value="third_party">Third-party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  {...register("skills")}
                  placeholder="e.g. content, code, analysis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capabilities">Capabilities</Label>
                <Textarea
                  id="capabilities"
                  {...register("capabilities")}
                  placeholder="Describe capabilities"
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pricingModel">Pricing model</Label>
                  <Input
                    id="pricingModel"
                    {...register("pricingModel")}
                    placeholder="fixed | hourly | subscription"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    {...register("price")}
                    placeholder="e.g. 10.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mcpEndpoint">MCP Endpoint</Label>
                <Input
                  id="mcpEndpoint"
                  {...register("mcpEndpoint")}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create agent"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/agents")}
              disabled={isExecuting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
