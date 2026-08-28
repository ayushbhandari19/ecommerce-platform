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

const {
  idParamSchema,
  paginationQuerySchema,
} = require("../validators/common.validator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProduct
);

router.get(
  "/",
  validate(paginationQuerySchema, "query"),
  getProducts
);

router.get(
  "/:id",
  validate(idParamSchema, "params"),
  getProductById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(idParamSchema, "params"),
  deleteProduct
);

module.exports = router;