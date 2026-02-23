import { z } from "zod";

// Account schema (รวม profile และ settings)
export const accountSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
});

// Legacy schemas for backward compatibility
export const profileSchema = accountSchema.pick({
  fullName: true,
  username: true,
  bio: true,
});

export const settingsSchema = accountSchema.pick({
  emailNotifications: true,
  pushNotifications: true,
  theme: true,
  language: true,
});

export type AccountInput = z.infer<typeof accountSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
