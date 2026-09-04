const prisma = require("../lib/prisma");
const allowedTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
const AppError = require("../utils/AppError");
const { Prisma } = require("@prisma/client");
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the user's cart
      const cart = await tx.cart.findUnique({
        where: {
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError("Your cart is empty", 400);
      }

      // 2. Validate stock and calculate total
      let totalAmount = new Prisma.Decimal(0);

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new AppError(
            `Insufficient stock for product ${item.productId}`,
            400,
            {
              availableStock: item.product.stock,
            }
          );
        }

        totalAmount = totalAmount.plus(
          item.product.price.mul(item.quantity)
        );
      }

      // 3. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
        },
      });

      // 4. Create order items and reduce stock
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          },
        });

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          const currentProduct = await tx.product.findUnique({
            where: {
              id: item.productId,
            },
            select: {
              stock: true,
            },
          });

          throw new AppError(
            `Insufficient stock for product ${item.productId}`,
            400,
            {
              availableStock: currentProduct?.stock ?? 0,
            }
          );
        }
      }

      // 5. Clear the cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      // 6. Return the complete order
      return tx.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: result,
    });
  } catch (error) {
    next(error);
  }
};
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const { status } = req.query;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    let userId;

    if (req.query.userId !== undefined) {
      userId = Number(req.query.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }
    }

    const where = {
      ...(status && { status }),
      ...(userId !== undefined && { userId }),
    };

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          items: {
            include: {
              product: true,
            },
          },

          payment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      orders,
    });
  } catch (error) {
    next(error);
  }
};
const getAdminOrderById = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const allowedStatuses = allowedTransitions[order.status];

      if (!allowedStatuses.includes(status)) {
        throw new AppError(
          `Cannot change order status from ${order.status} to ${status}`,
          400
        );
      }

      // Restore stock when an order is cancelled.
      if (status === "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: result,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAdminOrderById,
  updateOrderStatus,
  getAllOrders,
};