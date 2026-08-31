const { Prisma } = require("@prisma/client");

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  } else {
    console.error(err.name, err.message);
  }

  // Prisma known database errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "A resource with this value already exists",
        });

      case "P2025": {
        const modelName = err.meta?.modelName;

        const messages = {
          Product: "Product not found",
          Category: "Category not found",
          User: "User not found",
          Order: "Order not found",
          Review: "Review not found",
          Payment: "Payment not found",
        };

        return res.status(404).json({
          success: false,
          message: messages[modelName] || "Resource not found",
        });
      }

      default:
        return res.status(500).json({
          success: false,
          message: "Database operation failed",
        });
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }

  // Custom application errors
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
    ...(err.details || {}),
  });
};

module.exports = errorHandler;