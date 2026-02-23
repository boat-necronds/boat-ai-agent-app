"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateAgentAction } from "@/actions/agents";
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
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  url: z.string().url("Invalid URL"),
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

export type AgentDetail = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  agentType: string;
  status: AgentStatus;
  sortOrder: number;
  slug: string | null;
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
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function AgentSettingForm({ agent }: { agent: AgentDetail }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: agent.title,
      description: agent.description ?? "",
      url: agent.url,
      status: agent.status,
      sortOrder: agent.sortOrder,
      slug: agent.slug ?? "",
      type: (agent.type === "third_party" ? "third_party" : "platform") as "platform" | "third_party",
      skills: Array.isArray(agent.skills) ? agent.skills.join(", ") : (agent.skills ?? ""),
      capabilities: agent.capabilities ?? "",
      pricingModel: agent.pricingModel ?? "",
      price: agent.price ?? "",
      mcpEndpoint: agent.mcpEndpoint ?? "",
    },
  });

  const status = watch("status");
  const type = watch("type");

  const { execute, isExecuting } = useAction(updateAgentAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Agent settings saved");
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
      id: agent.id,
      title: values.title,
      description: values.description || null,
      url: values.url,
      status: values.status,
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
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Agent settings</CardTitle>
              <CardDescription>
                Edit agent details for use in Chatbot
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
              placeholder="e.g. fitness, food-pro"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Marketplace (PRD)</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setValue("type", v as "platform" | "third_party")}
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

          <div className="pt-4">
            <Button type="submit" disabled={isExecuting || !isDirty}>
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
