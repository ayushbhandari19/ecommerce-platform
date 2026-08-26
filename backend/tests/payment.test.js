import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

const createTestCategory = async () => {
    return prisma.category.create({
        data: {
            name: `Payment Test Category ${Date.now()}`,
            slug: `payment-test-category-${Date.now()}`,
        },
    });
};
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createTestProduct = async (categoryId, overrides = {}) => {
    return prisma.product.create({
        data: {
            name: `Payment Test Product ${Date.now()}`,
            slug: `payment-test-product-${Date.now()}`,
            description: "Test product",
            price: overrides.price ?? 100,
            stock: overrides.stock ?? 10,
            categoryId,
        },
    });
};

it("should create a payment for a pending order", async () => {
    const email = `payment-user-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Payment Test User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 250,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 2,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.payment.orderId).toBe(orderId);
    expect(response.body.payment.amount).toBe("500");
    expect(response.body.payment.paymentMethod).toBe("CARD");
    expect(response.body.payment.status).toBe("PENDING");

    const payment = await prisma.payment.findUnique({
        where: {
            orderId,
        },
    });

    expect(payment).not.toBeNull();
    expect(payment.status).toBe("PENDING");

    await prisma.payment.deleteMany({
        where: {
            orderId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should reject creating a second payment for the same order", async () => {
    const email = `duplicate-payment-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Duplicate Payment User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 200,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const firstPayment = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(firstPayment.status).toBe(201);

    const secondPayment = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "UPI",
        });

    expect(secondPayment.status).toBe(400);
    expect(secondPayment.body.success).toBe(false);
    expect(secondPayment.body.message).toBe(
        "Payment already exists for this order"
    );

    await prisma.payment.deleteMany({
        where: {
            orderId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should reject creating a payment for another user's order", async () => {
    const userAEmail = `payment-owner-a-${Date.now()}@example.com`;
    const userBEmail = `payment-owner-b-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Payment Owner A",
            email: userAEmail,
            password,
        });

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Payment Owner B",
            email: userBEmail,
            password,
        });

    const loginA = await request(app)
        .post("/api/auth/login")
        .send({
            email: userAEmail,
            password,
        });

    const loginB = await request(app)
        .post("/api/auth/login")
        .send({
            email: userBEmail,
            password,
        });

    const tokenA = loginA.body.token;
    const tokenB = loginB.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 300,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${tokenA}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Order not found");

    const payment = await prisma.payment.findUnique({
        where: {
            orderId,
        },
    });

    expect(payment).toBeNull();

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email: {
                    in: [userAEmail, userBEmail],
                },
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.deleteMany({
        where: {
            email: {
                in: [userAEmail, userBEmail],
            },
        },
    });
});

it("should confirm a pending payment and confirm the order", async () => {
    const email = `confirm-payment-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Confirm Payment User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 400,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 2,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const paymentResponse = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(paymentResponse.status).toBe(201);

    const paymentId = paymentResponse.body.payment.id;

    const response = await request(app)
        .post(`/api/payments/${paymentId}/confirm`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionId: `txn-${Date.now()}`,
        });

    console.log("CONFIRM PAYMENT RESPONSE:", response.status, response.body);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payment.status).toBe("SUCCESS");
    expect(response.body.order.status).toBe("CONFIRMED");

    const updatedPayment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
    });

    expect(updatedPayment.status).toBe("SUCCESS");
    expect(updatedPayment.transactionId).toBeTruthy();

    const updatedOrder = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    expect(updatedOrder.status).toBe("CONFIRMED");

    await prisma.payment.delete({
        where: {
            id: paymentId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should reject confirming an already successful payment", async () => {
    const email = `double-confirm-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Double Confirm User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 150,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const paymentResponse = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(paymentResponse.status).toBe(201);

    const paymentId = paymentResponse.body.payment.id;

    const transactionId = `txn-double-${Date.now()}`;

    const firstConfirmation = await request(app)
        .post(`/api/payments/${paymentId}/confirm`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionId,
        });

    expect(firstConfirmation.status).toBe(200);
    expect(firstConfirmation.body.payment.status).toBe("SUCCESS");

    const secondConfirmation = await request(app)
        .post(`/api/payments/${paymentId}/confirm`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionId: `txn-second-${Date.now()}`,
        });

    expect(secondConfirmation.status).toBe(400);
    expect(secondConfirmation.body.success).toBe(false);
    expect(secondConfirmation.body.message).toBe(
        "Payment is already confirmed"
    );

    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
    });

    expect(payment.status).toBe("SUCCESS");
    expect(payment.transactionId).toBe(transactionId);

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    expect(order.status).toBe("CONFIRMED");

    await prisma.payment.delete({
        where: {
            id: paymentId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should reject confirming a failed payment", async () => {
    const email = `failed-payment-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Failed Payment User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 250,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const payment = await prisma.payment.create({
        data: {
            orderId,
            amount: 250,
            paymentMethod: "CARD",
            status: "FAILED",
        },
    });

    const response = await request(app)
        .post(`/api/payments/${payment.id}/confirm`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionId: `txn-failed-${Date.now()}`,
        });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
        "Cannot confirm a failed payment"
    );

    const unchangedPayment = await prisma.payment.findUnique({
        where: {
            id: payment.id,
        },
    });

    expect(unchangedPayment.status).toBe("FAILED");
    expect(unchangedPayment.transactionId).toBeNull();

    const unchangedOrder = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    expect(unchangedOrder.status).toBe("PENDING");

    await prisma.payment.delete({
        where: {
            id: payment.id,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should allow a user to retrieve their own payment", async () => {
    const email = `payment-retrieval-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Payment Retrieval User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 350,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const paymentResponse = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "UPI",
        });

    expect(paymentResponse.status).toBe(201);

    const paymentId = paymentResponse.body.payment.id;

    const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payment.id).toBe(paymentId);
    expect(response.body.payment.order.id).toBe(orderId);
    expect(response.body.payment.order.items).toHaveLength(1);

    await prisma.payment.delete({
        where: {
            id: paymentId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should return the authenticated user's payments", async () => {
    const email = `my-payments-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "My Payments User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 500,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const paymentResponse = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "UPI",
        });

    expect(paymentResponse.status).toBe(201);

    const paymentId = paymentResponse.body.payment.id;

    const response = await request(app)
        .get("/api/payments")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);

    const returnedPayment = response.body.payments.find(
        (payment) => payment.id === paymentId
    );

    expect(returnedPayment).toBeDefined();
    expect(returnedPayment.order.id).toBe(orderId);
    expect(returnedPayment.order.totalAmount).toBe("500");

    await prisma.payment.delete({
        where: {
            id: paymentId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});

it("should reject confirming a payment for a cancelled order", async () => {
    const email = `cancelled-payment-${Date.now()}@example.com`;
    const password = "TestPassword123";

    await request(app)
        .post("/api/auth/register")
        .send({
            name: "Cancelled Payment User",
            email,
            password,
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

    const token = loginResponse.body.token;

    const category = await createTestCategory();

    const product = await createTestProduct(category.id, {
        stock: 10,
        price: 300,
    });

    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({
            productId: product.id,
            quantity: 1,
        });

    const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(orderResponse.status).toBe(201);

    const orderId = orderResponse.body.order.id;

    const paymentResponse = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
            orderId,
            paymentMethod: "CARD",
        });

    expect(paymentResponse.status).toBe(201);

    const paymentId = paymentResponse.body.payment.id;

    // Cancel the order before confirming the payment.
    const adminEmail = `cancelled-payment-admin-${Date.now()}@example.com`;

const admin = await prisma.user.create({
    data: {
        name: "Cancelled Payment Admin",
        email: adminEmail,
        password: await bcrypt.hash(password, 12),
        role: "ADMIN",
    },
});

const adminToken = jwt.sign(
    {
        userId: admin.id,
        role: admin.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d",
    }
);

const cancelResponse = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
        status: "CANCELLED",
    });

expect(cancelResponse.status).toBe(200);

    expect(cancelResponse.status).toBe(200);

    const response = await request(app)
        .post(`/api/payments/${paymentId}/confirm`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionId: `txn-cancelled-${Date.now()}`,
        });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    await prisma.payment.delete({
        where: {
            id: paymentId,
        },
    });

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    await prisma.product.delete({
        where: {
            id: product.id,
        },
    });

    await prisma.category.delete({
        where: {
            id: category.id,
        },
    });

    await prisma.cart.deleteMany({
        where: {
            user: {
                email,
            },
        },
    });

    await prisma.user.delete({
        where: {
            email,
        },
    });
});