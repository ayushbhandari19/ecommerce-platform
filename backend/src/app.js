const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const app = express();
const authRoutes = require("./routes/auth.routes");
app.use(cors());
app.use(express.json());
app.use("/api/categories", categoryRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

module.exports = app;