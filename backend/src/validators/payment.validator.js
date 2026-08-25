const { z } = require("zod");

const createPaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  paymentMethod: z.string().min(1).max(50),
});

const confirmPaymentSchema = z.object({
  transactionId: z.string().min(1).max(100),
});

module.exports = {
  createPaymentSchema,
  confirmPaymentSchema,
};