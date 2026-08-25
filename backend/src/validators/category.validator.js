const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});
const updateCategorySchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
module.exports = {
  createCategorySchema,
  updateCategorySchema,
};