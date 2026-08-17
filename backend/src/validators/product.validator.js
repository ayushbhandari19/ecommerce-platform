const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  image: z.string().url("Image must be a valid URL").optional(),
  categoryId: z.coerce.number().int().positive("Category ID must be valid"),
});

module.exports = {
  createProductSchema,
};