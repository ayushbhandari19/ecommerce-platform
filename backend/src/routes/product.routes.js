const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/product.validator");
const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProduct
);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProduct
);

module.exports = router;