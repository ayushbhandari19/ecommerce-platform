const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

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

router.get("/:id", getPaymentById);

router.post(
  "/:id/confirm",
  validate(confirmPaymentSchema),
  confirmPayment
);

module.exports = router;
