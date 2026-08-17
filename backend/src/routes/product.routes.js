const express = require("express");
const { createProduct,getProducts,getProductById,updateProduct,deleteProduct } = require("../controllers/product.controller");
const validate = require("../middleware/validate");
const { createProductSchema } = require("../validators/product.validator");
const router = express.Router();
router.post("/", validate(createProductSchema), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;