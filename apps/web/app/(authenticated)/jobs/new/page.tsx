import { JobCreateForm } from "@/components/jobs/job-create-form";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New job</h1>
          <p className="text-muted-foreground mt-1">
            Specify goal and task for the AI Agent
          </p>
        </div>
      </div>
      <JobCreateForm />
    </div>
  );
}
