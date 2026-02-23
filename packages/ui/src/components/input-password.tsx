"use client";

import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./input";
import { Button } from "./button";

export interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (!password) {
    return { score: 0, label: "", color: "" };
  }

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine strength
  if (score <= 2) {
    return { score, label: "Weak", color: "bg-destructive" };
  } else if (score <= 4) {
    return { score, label: "Medium", color: "bg-yellow-500" };
  } else {
    return { score, label: "Strong", color: "bg-green-500" };
  }
}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className, showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const strength = calculatePasswordStrength(password);

    const requirements = [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /[0-9]/.test(password) },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            ref={ref}
            {...props}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>

        {showStrength && password && (
          <div className="space-y-2">
            {/* Strength Bar */}
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < strength.score ? strength.color : "bg-muted",
                  )}
                />
              ))}
            </div>

            {/* Strength Label */}
            {strength.label && (
              <p className="text-xs text-muted-foreground">
                Password strength:{" "}
                <span
                  className={cn(
                    "font-medium",
                    strength.score <= 2 && "text-destructive",
                    strength.score > 2 &&
                      strength.score <= 4 &&
                      "text-yellow-600",
                    strength.score > 4 && "text-green-600",
                  )}
                >
                  {strength.label}
                </span>
              </p>
            )}

            {/* Requirements */}
            <div className="space-y-1">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {req.met ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      req.met ? "text-green-600" : "text-muted-foreground",
                    )}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

InputPassword.displayName = "InputPassword";

export { InputPassword };
