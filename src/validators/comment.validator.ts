import z from "zod";

export const commentContentSchema = z.object({
  content: z.string().min(1, "Comment Content is required").trim(),
});
