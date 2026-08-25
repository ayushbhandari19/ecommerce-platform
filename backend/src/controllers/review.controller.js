const prisma = require("../lib/prisma");

const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = Number(req.params.productId);

    const { rating, comment } = req.body;

    // Check that the product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check that the user has purchased the product
    const purchasedProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: ["CONFIRMED", "SHIPPED", "DELIVERED"],
          },
        },
      },
    });

    if (!purchasedProduct) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    // Prevent duplicate review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};
const getProductReviews = async (req, res) => {
    try {
      const productId = Number(req.params.productId);
  
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          name: true,
        },
      });
  
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
  
      const reviews = await prisma.review.findMany({
        where: {
          productId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;
  
      res.status(200).json({
        success: true,
        product,
        count: reviews.length,
        averageRating: Number(averageRating.toFixed(2)),
        reviews,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch product reviews",
      });
    }
  };
  const updateReview = async (req, res) => {
    try {
      const userId = req.user.userId;
      const reviewId = Number(req.params.id);
  
      const { rating, comment } = req.body;
  
      const review = await prisma.review.findFirst({
        where: {
          id: reviewId,
          userId,
        },
      });
  
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }
  
      const updatedReview = await prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          ...(rating !== undefined && { rating }),
          ...(comment !== undefined && { comment }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
      });
  
      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review: updatedReview,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to update review",
      });
    }
  };
  const deleteReview = async (req, res) => {
    try {
      const userId = req.user.userId;
      const reviewId = Number(req.params.id);
  
      const review = await prisma.review.findFirst({
        where: {
          id: reviewId,
          userId,
        },
      });
  
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }
  
      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });
  
      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to delete review",
      });
    }
  };
module.exports = {
  createReview,
    getProductReviews,
    updateReview,
    deleteReview,
};