import { getAgentsAction, getPageSectionAction } from "@/actions/agents";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Settings, Workflow, Plus } from "lucide-react";

export default async function AgentsPage() {
  const [agentsResult, sectionResult] = await Promise.all([
    getAgentsAction(),
    getPageSectionAction({ key: "agents" }),
  ]);
  const agents = agentsResult?.data?.success ? agentsResult.data.agents : [];
  const section = sectionResult?.data?.success
    ? sectionResult.data.section
    : { title: "Agent", description: "Manage agents for Chatbot" };

  if (!agents) {
    const data = agentsResult?.data as { error?: string } | undefined;
    const errorMessage =
      data && typeof data.error === "string"
        ? data.error
        : "Failed to load agents";
    return (
      <EmptyState
        variant="error"
        title="Something went wrong"
        message={errorMessage}
      />
    );
  }

  console.log(agents);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
          <p className="text-muted-foreground mt-2">
            {section.description ?? "Manage agents for Chatbot"}
          </p>
        </div>
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            Create agent
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{section.title} list</CardTitle>
              <CardDescription>
                {section.description ?? "All agents. Click settings to edit."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <EmptyState
              message="No agents yet"
              description="Add agents via Database or Supabase"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {agent.type === "third_party"
                        ? "Third-party"
                        : "Platform"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          agent.status === "active" ? "default" : "secondary"
                        }
                      >
                        {agent.status === "maintenance"
                          ? "Maintenance"
                          : agent.status === "active"
                            ? "Active"
                            : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {agent.rating ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {agent.price != null && agent.price !== ""
                        ? agent.price
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {agent.completedJobs ?? 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.slug ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground hidden md:table-cell">
                      {agent.host}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/agents/${agent.id}`}>
                          <Settings className="h-4 w-4 mr-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
