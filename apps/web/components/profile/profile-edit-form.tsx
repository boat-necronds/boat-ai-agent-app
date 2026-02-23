"use client";

import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@workspace/validations";
import { updateAccountAction } from "@/actions/account";
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
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ProfileEditFormProps = {
  defaultValues: {
    fullName?: string | null;
    username?: string | null;
    bio?: string | null;
  };
};

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: defaultValues.fullName ?? "",
      username: defaultValues.username ?? "",
      bio: defaultValues.bio ?? "",
    },
  });

  const { execute, isExecuting } = useAction(updateAccountAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Profile saved");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });

  const onSubmit = (values: ProfileInput) => {
    execute({
      fullName: values.fullName || undefined,
      username: values.username || undefined,
      bio: values.bio || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Edit profile</CardTitle>
              <CardDescription>
                Update your name, username, and bio
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Your name"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="username"
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="About you"
              rows={3}
              className="resize-none"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

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
        </CardContent>
      </Card>
    </form>
  );
}
