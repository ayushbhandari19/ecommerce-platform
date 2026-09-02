const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 100 : 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 10 : 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
};