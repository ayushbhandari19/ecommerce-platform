const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");
const { idParamSchema } = require("../validators/common.validator");
const {
  createPaymentSchema,
  confirmPaymentSchema,
} = require("../validators/payment.validator");

const {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
} = require("../controllers/payment.controller");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  validate(createPaymentSchema),
  createPayment
);

router.get("/", getMyPayments);

router.get(
  "/:id",
  validate(idParamSchema, "params"),
  getPaymentById
);

router.post(
  "/:id/confirm",
  validate(idParamSchema, "params"),
  validate(confirmPaymentSchema),
  confirmPayment
);

module.exports = router;
