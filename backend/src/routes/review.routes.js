const express = require("express");

const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/review.validator");

const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
} = require("../controllers/review.controller");

const router = express.Router();

// Public
router.get(
  "/products/:productId/reviews",
  getProductReviews
);

// Authenticated - create review
router.post(
  "/products/:productId/reviews",
  authenticate,
  validate(createReviewSchema),
  createReview
);

// Authenticated - update own review
router.put(
  "/reviews/:id",
  authenticate,
  validate(updateReviewSchema),
  updateReview
);
router.delete(
    "/reviews/:id",
    authenticate,
    deleteReview
  );
module.exports = router;