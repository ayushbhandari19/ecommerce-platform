const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const paymentRoutes = require("./routes/payment.routes");
const app = express();
const wishlistRoutes = require("./routes/wishlist.routes");
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", reviewRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
  });
});

module.exports = app;