import { z } from "zod";

// Application schema for validation
export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  primaryUrl: z.string().url("Primary URL must be a valid URL"),
  secondaryUrl: z.string().url("Secondary URL must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  screenshotUrl: z.string().optional(),
  category: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// Category schema for validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Application type from database
export interface Application {
  id: number;
  name: string;
  description: string | null;
  primaryUrl: string;
  secondaryUrl: string | null;
  tags: string | null;
  screenshotUrl: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Category type from database
export interface Category {
  id: number;
  name: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

