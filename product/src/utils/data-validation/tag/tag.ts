import { z } from "zod";

// Defines the schema for a single tag object
export const createTagSchema = z.object({
  name: z.string().min(3, "Tag name must be at least 3 characters").trim(),
  slug: z.string().min(3, "Tag slug must be at least 3 characters").trim(),
});
