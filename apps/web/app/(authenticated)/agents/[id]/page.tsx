import { getAgentByIdAction } from "@/actions/agents";
import { AgentSettingForm } from "@/components/agents/agent-setting-form";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";

export default async function AgentSettingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAgentByIdAction({ id });

  if (!result?.data?.success || !result.data.agent) {
    notFound();
  }

  const agent = result.data.agent;

  if (!agent) {
    return (
      <EmptyState
        variant="error"
        title="Something went wrong"
        message="Agent not found"
      />
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent settings</h1>
          <p className="text-muted-foreground mt-1">{agent.title}</p>
        </div>
      </div>

      <AgentSettingForm agent={agent} />
    </div>
  );
}
