import z from "zod";

export const uploadVideoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
});

export const videoQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),

  query: z.string().trim().default(""),

  sortBy: z.enum(["createdAt", "views", "duration", "title"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  userId: z.string().trim().default(""),
});

export type VideoQuery = z.infer<typeof videoQuerySchema>;

export const videoUpdateDetailsSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
});
