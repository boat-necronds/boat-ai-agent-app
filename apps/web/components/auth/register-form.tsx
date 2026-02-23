"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@workspace/validations";
import { registerAction } from "@/actions/auth";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { InputPassword } from "@workspace/ui/components/input-password";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useMemo } from "react";

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const { execute, isExecuting, result } = useAction(registerAction, {
    onSuccess: ({ data }) => {
      console.log("✅ Register action success:", data);
      if (data?.success && data.message) {
        toast.success(data.message);
        router.push("/login");
      }
    },
    onError: ({ error }) => {
      console.error("❌ Register action error:", error);

      const errorMsg =
        error.serverError || "Failed to register. Please try again.";

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

  const onSubmit = (data: RegisterInput) => {
    console.log("📝 Form submitted:", { email: data.email });
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
          showStrength
          {...register("password")}
          disabled={isExecuting}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <InputPassword
          id="confirmPassword"
          placeholder="••••••••"
          {...register("confirmPassword")}
          disabled={isExecuting}
          className={errors.confirmPassword ? "border-destructive" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
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
        {isExecuting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
