const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

module.exports = {
  createCategorySchema,
};