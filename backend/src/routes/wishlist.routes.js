const express = require("express");

const authenticate = require("../middleware/auth");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);

router.post("/:productId", addToWishlist);

router.delete("/:productId", removeFromWishlist);

module.exports = router;