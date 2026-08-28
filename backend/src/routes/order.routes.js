const express = require("express");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  idParamSchema,
  orderQuerySchema,
} = require("../validators/common.validator");const {
  updateOrderStatusSchema,
} = require("../validators/order.validator");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/order.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get(
  "/admin/all",
  authorize("ADMIN"),
  validate(orderQuerySchema, "query"),
  getAllOrders
);
router.get(
    "/:id",
    validate(idParamSchema, "params"),
    getOrderById
);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

module.exports = router;