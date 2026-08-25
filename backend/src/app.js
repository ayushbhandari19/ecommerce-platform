const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);

module.exports = app;