import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import {
  createTestCategory,
  createTestProduct,
} from "./helpers/testData.js";
describe("Cart API", () => {
  it("should reject an unauthenticated request", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });
  it("should create and return an empty cart for an authenticated user", async () => {
    const email = `cart-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Test User",
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
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart).toBeDefined();
    expect(response.body.cart.items).toEqual([]);
  });
  it("should add a product to the cart", async () => {
    const email = `cart-add-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Add Test User",
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
    });
  
    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart.items).toHaveLength(1);
    expect(response.body.cart.items[0].productId).toBe(product.id);
    expect(response.body.cart.items[0].quantity).toBe(2);
  
    await prisma.cartItem.deleteMany({
      where: {
        productId: product.id,
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
  it("should increase quantity when adding the same product again", async () => {
    const email = `cart-duplicate-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Duplicate Test User",
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
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 3,
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart.items).toHaveLength(1);
    expect(response.body.cart.items[0].quantity).toBe(5);
  
    await prisma.cartItem.deleteMany({ where: { productId: product.id } });
    await prisma.cart.deleteMany({ where: { user: { email } } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.user.delete({ where: { email } });
  });
  it("should reject a quantity greater than available stock", async () => {
    const email = `cart-stock-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Stock Test User",
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
      stock: 5,
    });
  
    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 6,
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Only 5 items are available");
  
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
  it("should update the quantity of a cart item", async () => {
    const email = `cart-update-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Update Test User",
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
    });
  
    const addResponse = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    const itemId = addResponse.body.cart.items[0].id;
  
    const response = await request(app)
      .put(`/api/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        quantity: 5,
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart.items[0].id).toBe(itemId);
    expect(response.body.cart.items[0].quantity).toBe(5);
  
    await prisma.cartItem.deleteMany({
      where: {
        productId: product.id,
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
  it("should remove an item from the cart", async () => {
    const email = `cart-remove-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Remove Test User",
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
  
    const product = await createTestProduct(category.id);
  
    const addResponse = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2,
      });
  
    const itemId = addResponse.body.cart.items[0].id;
  
    const response = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cart.items).toHaveLength(0);
  
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
  it("should clear all items from the cart", async () => {
    const email = `cart-clear-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Cart Clear Test User",
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
  
    const productOne = await createTestProduct(category.id);
    const productTwo = await createTestProduct(category.id);
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: productOne.id,
        quantity: 2,
      });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: productTwo.id,
        quantity: 1,
      });
  
    const response = await request(app)
      .delete("/api/cart")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Cart cleared successfully");
  
    const cartResponse = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
  
    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.cart.items).toHaveLength(0);
  
    await prisma.cart.deleteMany({
      where: {
        user: {
          email,
        },
      },
    });
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [productOne.id, productTwo.id],
        },
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
});