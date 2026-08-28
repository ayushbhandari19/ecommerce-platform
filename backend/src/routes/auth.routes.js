const express = require("express");
const { loginLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { register, login } = require("../controllers/auth.controller");
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
router.post("/register", validate(registerSchema), register);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);
router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
module.exports = router;
  