const { z } = require("zod");

const addToCartSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
};