const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const paymentRoutes = require("./routes/payment.routes");
const app = express();
const errorHandler = require("./middleware/errorHandler");

const wishlistRoutes = require("./routes/wishlist.routes");
app.use(helmet());
const { apiLimiter } = require("./middleware/rateLimiter");

app.use("/api", apiLimiter);

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
app.use(errorHandler);
module.exports = app;