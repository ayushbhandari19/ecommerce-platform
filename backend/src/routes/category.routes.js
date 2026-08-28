const express = require("express");
const validate = require("../middleware/validate");
const { idParamSchema } = require("../validators/common.validator");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
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
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  deleteCategory
);
router.get("/", getCategories);

module.exports = router;