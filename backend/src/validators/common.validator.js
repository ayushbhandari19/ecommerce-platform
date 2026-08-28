const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});

const productIdParamSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be a positive integer"),
});

const itemIdParamSchema = z.object({
  itemId: z.coerce
    .number()
    .int()
    .positive("Item ID must be a positive integer"),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const orderQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ])
    .optional(),

  userId: z.coerce.number().int().positive().optional(),
});

module.exports = {
  idParamSchema,
  productIdParamSchema,
  itemIdParamSchema,
  paginationQuerySchema,
  orderQuerySchema,
};
