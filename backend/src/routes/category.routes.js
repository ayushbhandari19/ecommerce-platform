const express = require("express");
const {
    createCategory,
    getCategories,
  } = require("../controllers/category.controller");
  const validate = require("../middleware/validate");
  const { createCategorySchema } = require("../validators/category.validator");
const router = express.Router();

router.post("/", validate(createCategorySchema), createCategory);
router.get("/", getCategories);

module.exports = router;