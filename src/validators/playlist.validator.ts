import z from "zod";

export const PlaylistSchema = z.object({
  name: z
    .string()
    .min(1, "Playlist title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
  isPublished: z.boolean().optional(),
});

export const UpdatePlaylistSchema = PlaylistSchema.partial();
