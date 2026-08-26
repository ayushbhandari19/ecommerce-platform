const prisma = require("../lib/prisma");

const createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId, paymentMethod } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be created for pending orders",
      });
    }

    if (order.payment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this order",
      });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment",
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentId = Number(req.params.id);
    const { transactionId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Payment is already confirmed",
      });
    }

    if (payment.status === "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm a failed payment",
      });
    }
    if (payment.order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be confirmed for pending orders",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "SUCCESS",
          transactionId,
        },
      });

      const updatedOrder = await tx.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          status: "CONFIRMED",
        },
      });

      return {
        updatedPayment,
        updatedOrder,
      };
    });

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      payment: result.updatedPayment,
      order: result.updatedOrder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
    });
  }
};
const getMyPayments = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const payments = await prisma.payment.findMany({
        where: {
          order: {
            userId,
          },
        },
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.status(200).json({
        success: true,
        count: payments.length,
        payments,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }
  };
  
  const getPaymentById = async (req, res) => {
    try {
      const userId = req.user.userId;
      const paymentId = Number(req.params.id);
  
      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          order: {
            userId,
          },
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
  
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }
  
      res.status(200).json({
        success: true,
        payment,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch payment",
      });
    }
  };
  
  module.exports = {
    createPayment,
    confirmPayment,
    getMyPayments,
    getPaymentById,
  };