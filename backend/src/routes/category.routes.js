const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../controllers/category.controller");
const validate = require("../middleware/validate");
const { createCategorySchema } = require("../validators/category.validator");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const router = express.Router();
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);

router.get("/", getCategories);

module.exports = router;