import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import {
  createTestCategory,
  createTestProduct,
} from "./helpers/testData.js";
describe("Wishlist API", () => {
  it("should reject an unauthenticated request", async () => {
    const response = await request(app).get("/api/wishlist");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });
  it("should return an empty wishlist for an authenticated user", async () => {
    const email = `wishlist-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wishlist Test User",
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
      .get("/api/wishlist")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.wishlist).toEqual([]);
  
  });
  it("should add a product to the wishlist", async () => {
    const email = `wishlist-add-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wishlist Add Test User",
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
  
    const response = await request(app)
      .post(`/api/wishlist/${product.id}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  
    expect(response.body.wishlistItem).toBeDefined();
    expect(response.body.wishlistItem.productId).toBe(product.id);
    expect(response.body.wishlistItem.userId).toBeDefined();
  
    await prisma.wishlistItem.deleteMany({
      where: {
        productId: product.id,
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
  it("should reject adding the same product to the wishlist twice", async () => {
    const email = `wishlist-duplicate-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wishlist Duplicate Test User",
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
  
    const firstResponse = await request(app)
      .post(`/api/wishlist/${product.id}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(firstResponse.status).toBe(201);
  
    const secondResponse = await request(app)
      .post(`/api/wishlist/${product.id}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
  
    await prisma.wishlistItem.deleteMany({
      where: {
        productId: product.id,
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
});