"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJobAction } from "@/actions/jobs";
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
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  goal: z.string().min(1, "Goal is required"),
  task: z.string().min(1, "Task is required"),
  budget: z.string().min(1, "Budget is required"),
  deadline: z.string().optional(),
  maxRevisions: z.coerce.number().int().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function JobCreateForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      goal: "",
      task: "",
      budget: "",
      maxRevisions: 2,
    },
  });

  const { execute, isExecuting } = useAction(createJobAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.job?.id) {
        toast.success("Job created");
        router.push(`/jobs/${data.job.id}`);
      }
    },
    onError: ({ error }) => {
      const msg =
        error.serverError ??
        error.validationErrors
          ? JSON.stringify(error.validationErrors)
          : "Something went wrong";
      console.error("[JobCreateForm] createJob error:", {
        serverError: error.serverError,
        validationErrors: error.validationErrors,
      });
      toast.error(msg);
    },
  });

  const onSubmit = (values: FormValues) => {
    execute({
      title: values.title,
      goal: values.goal,
      task: values.task,
      budget: values.budget,
      deadline: values.deadline ?? undefined,
      maxRevisions: values.maxRevisions,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>New job</CardTitle>
              <CardDescription>
                Specify goal, task, and budget (PRD: Human hires AI)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Restaurant review article"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              {...register("goal")}
              placeholder="Describe the goal of this job"
              rows={2}
              className="resize-none"
            />
            {errors.goal && (
              <p className="text-sm text-destructive">{errors.goal.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Textarea
              id="task"
              {...register("task")}
              placeholder="Describe the task in detail"
              rows={4}
              className="resize-none"
            />
            {errors.task && (
              <p className="text-sm text-destructive">{errors.task.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                {...register("budget")}
                placeholder="e.g. 100.00"
              />
              {errors.budget && (
                <p className="text-sm text-destructive">
                  {errors.budget.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register("deadline")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRevisions">Max revision rounds</Label>
            <Input
              id="maxRevisions"
              type="number"
              min={0}
              max={10}
              {...register("maxRevisions")}
            />
          </div>
          <div className="pt-4 flex gap-2 justify-end">
            <Button type="submit" disabled={isExecuting || !isDirty}>
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Save as draft"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/jobs")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
