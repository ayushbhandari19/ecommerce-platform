const prisma = require("../lib/prisma");
const allowedTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };
const createOrder = async (req, res) => {
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
        throw new Error("CART_EMPTY");
      }

      // 2. Validate stock and calculate total
      let totalAmount = 0;

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new Error(
            `INSUFFICIENT_STOCK:${item.product.id}:${item.product.stock}`
          );
        }

        totalAmount += Number(item.product.price) * item.quantity;
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

        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
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
    console.error(error);

    if (error.message === "CART_EMPTY") {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, productId, availableStock] = error.message.split(":");

      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product ${productId}`,
        availableStock: Number(availableStock),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};
const getOrders = async (req, res) => {
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
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  };
  const getOrderById = async (req, res) => {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);

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
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  };
  const getAllOrders = async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
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
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch all orders",
      });
    }
  };
  const updateOrderStatus = async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

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
          throw new Error("ORDER_NOT_FOUND");
        }

        const allowedStatuses = allowedTransitions[order.status];

        if (!allowedStatuses.includes(status)) {
          throw new Error(
            `INVALID_TRANSITION:${order.status}:${status}`
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
      console.error(error);

      if (error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (error.message.startsWith("INVALID_TRANSITION:")) {
        const [, currentStatus, newStatus] =
          error.message.split(":");

        return res.status(400).json({
          success: false,
          message: `Cannot change order status from ${currentStatus} to ${newStatus}`,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  };
module.exports = {
  createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
};