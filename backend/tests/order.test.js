import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import {
    createTestCategory,
    createTestProduct,
  } from "./helpers/testData.js";
import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
describe("Order API", () => {
  it("should reject an unauthenticated request", async () => {
    const response = await request(app).get("/api/orders");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });
  it("should create an order from the user's cart", async () => {
    const email = `order-create-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Order Test User",
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
      price: 100,
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  
    expect(response.body.order.status).toBe("PENDING");
    expect(Number(response.body.order.totalAmount)).toBe(200);
    expect(response.body.order.items).toHaveLength(1);
    expect(response.body.order.items[0].productId).toBe(product.id);
    expect(response.body.order.items[0].quantity).toBe(2);
  
    const updatedProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(updatedProduct.stock).toBe(8);
  
    const cartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
  
    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.cart.items).toHaveLength(0);
  
    await prisma.order.deleteMany({
      where: {
        user: {
          email,
        },
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
  it("should reject creating an order when the cart is empty", async () => {
    const email = `order-empty-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Empty Cart Order User",
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
  
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Your cart is empty");
  
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
  it("should reject an order when product stock is insufficient", async () => {
    const email = `order-stock-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Insufficient Stock User",
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
      stock: 2,
      price: 100,
    });
  
    const cart = await prisma.cart.create({
        data: {
          user: {
            connect: {
              email,
            },
          },
        },
      });
      
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: 3,
        },
      });
  
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      `Insufficient stock for product ${product.id}`
    );
    expect(response.body.availableStock).toBe(2);
  
    const updatedProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(updatedProduct.stock).toBe(2);
  
    const cartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
  
    expect(cartResponse.body.cart.items).toHaveLength(1);
    expect(cartResponse.body.cart.items[0].quantity).toBe(3);
  
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
  it("should prevent a user from accessing another user's order", async () => {
    const password = "TestPassword123";
  
    const emailA = `order-owner-a-${Date.now()}@example.com`;
    const emailB = `order-owner-b-${Date.now()}@example.com`;
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Order Owner A",
        email: emailA,
        password,
      });
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Order Owner B",
        email: emailB,
        password,
      });
  
    const loginA = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailA,
        password,
      });
  
    const loginB = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailB,
        password,
      });
  
    const tokenA = loginA.body.token;
    const tokenB = loginB.body.token;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 100,
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
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${tokenB}`);
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Order not found");
  
    await prisma.order.deleteMany({
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
            email: {
              in: [emailA, emailB],
            },
          },
        },
      });
  });
  it("should reject an invalid order status transition", async () => {
    const email = `status-user-${Date.now()}@example.com`;
    const adminEmail = `status-admin-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Status Test User",
        email,
        password,
      });
  
    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    const userId = userLogin.body.user.id;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 100,
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .send({
        productId: product.id,
        quantity: 1,
      });
  
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
  
    expect(orderResponse.status).toBe(201);
  
    const orderId = orderResponse.body.order.id;
  
    const admin = await prisma.user.create({
      data: {
        name: "Status Test Admin",
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
  
    const response = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "DELIVERED",
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });
  
    await prisma.cart.deleteMany({
      where: {
        userId,
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
          in: [email, adminEmail],
        },
      },
    });
  });
  it("should allow an admin to confirm a pending order", async () => {
    // We'll create a customer, product, cart, and pending order,
    // then authenticate an admin and confirm the order.
  });
  it("should allow an admin to confirm a pending order", async () => {
    const email = `confirm-user-${Date.now()}@example.com`;
    const adminEmail = `confirm-admin-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Confirm Test User",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 100,
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        productId: product.id,
        quantity: 1,
      });
  
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);
  
    expect(orderResponse.status).toBe(201);
  
    const orderId = orderResponse.body.order.id;
  
    const admin = await prisma.user.create({
      data: {
        name: "Confirm Test Admin",
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
  
    const response = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "CONFIRMED",
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order.status).toBe("CONFIRMED");
  
    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
  
    expect(updatedOrder.status).toBe("CONFIRMED");
  
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
  
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [email, adminEmail],
        },
      },
    });
  });
  it("should restore product stock when an admin cancels an order", async () => {
    const email = `cancel-user-${Date.now()}@example.com`;
    const adminEmail = `cancel-admin-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cancel Test User",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 100,
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);
  
    expect(orderResponse.status).toBe(201);
  
    const orderId = orderResponse.body.order.id;
  
    const productAfterOrder = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(productAfterOrder.stock).toBe(8);
  
    const admin = await prisma.user.create({
      data: {
        name: "Cancel Test Admin",
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
  
    const response = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "CANCELLED",
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order.status).toBe("CANCELLED");
  
    const productAfterCancellation = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(productAfterCancellation.stock).toBe(10);
  
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });
  
    await prisma.cart.deleteMany({
      where: {
        user: {
          email: {
            in: [email, adminEmail],
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
          in: [email, adminEmail],
        },
      },
    });
  });
});