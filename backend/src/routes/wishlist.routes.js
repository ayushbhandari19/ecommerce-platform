const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
  productIdParamSchema,
} = require("../validators/common.validator");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);

router.post(
  "/:productId",
  validate(productIdParamSchema, "params"),
  addToWishlist
);

router.delete(
  "/:productId",
  validate(productIdParamSchema, "params"),
  removeFromWishlist
);

module.exports = router;