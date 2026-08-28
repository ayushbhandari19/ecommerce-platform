const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");
const { itemIdParamSchema } = require("../validators/common.validator");
const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validators/cart.validator");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getCart);

router.post(
  "/items",
  validate(addToCartSchema),
  addToCart
);

router.put(
  "/items/:itemId",
  validate(itemIdParamSchema, "params"),
  validate(updateCartItemSchema),
  updateCartItem
);

router.delete(
  "/items/:itemId",
  validate(itemIdParamSchema, "params"),
  removeFromCart
);
router.delete(
  "/",
  clearCart
);

module.exports = router;