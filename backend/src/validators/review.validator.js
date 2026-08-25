const { z } = require("zod");

const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be greater than 5"),

  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be greater than 5")
    .optional(),

  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};