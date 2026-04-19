import { z } from "zod";

export const communityPostSchema = z.object({
  content: z.string().min(1, "Content is required").trim(),
});
