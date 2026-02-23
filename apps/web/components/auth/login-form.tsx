"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@workspace/validations";
import { loginAction } from "@/actions/auth";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { InputPassword } from "@workspace/ui/components/input-password";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useMemo } from "react";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { execute, isExecuting, result } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      console.log("✅ Login action success:", data);
    },
    onError: ({ error }) => {
      console.error("❌ Login action error:", error);

      // Show error message from all sources
      const errorMsg =
        error.serverError || "Failed to login. Please try again.";

      toast.error(errorMsg);
    },
  });

  // Get error message from result
  const errorMessage = useMemo(() => {
    if (
      result.data &&
      "success" in result.data &&
      !result.data.success &&
      "error" in result.data
    ) {
      return result.data.error as string;
    }
    return null;
  }, [result]);

  // Show toast when there is an error from result
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  const onSubmit = (data: LoginInput) => {
    console.log("📝 Login form submitted:", { email: data.email });
    execute(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
          disabled={isExecuting}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <InputPassword
          id="password"
          placeholder="••••••••"
          {...register("password")}
          disabled={isExecuting}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isExecuting}>
        {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isExecuting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
