const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

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
  validate(updateCartItemSchema),
  updateCartItem
);

router.delete(
  "/items/:itemId",
  removeFromCart
);

router.delete(
  "/",
  clearCart
);

module.exports = router;