import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import {
    createTestCategory,
    createTestProduct,
  } from "./helpers/testData.js";
describe("Review API", () => {
  it("should reject an unauthenticated request to create a review", async () => {
    const response = await request(app)
      .post("/api/products/1/reviews")
      .send({
        rating: 5,
        comment: "Great product",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });
  it("should reject a review when the user has not purchased the product", async () => {
    const email = `review-user-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Test User",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const category = await createTestCategory();
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 300,
    });
  
    const response = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        comment: "Great product",
      });
  
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "You can only review products you have purchased"
    );
  
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
  it("should allow a customer to review a purchased product", async () => {
    const email = `review-create-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Customer",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
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
  
    const confirmResponse = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transactionId: `txn-review-${Date.now()}`,
      });
  
    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.order.status).toBe("CONFIRMED");
  
    const reviewResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        comment: "Excellent product!",
      });
  
    expect(reviewResponse.status).toBe(201);
    expect(reviewResponse.body.success).toBe(true);
    expect(reviewResponse.body.review.rating).toBe(5);
    expect(reviewResponse.body.review.comment).toBe("Excellent product!");
    expect(reviewResponse.body.review.product.id).toBe(product.id);
    expect(reviewResponse.body.review.user.name).toBe("Review Customer");
  
    await prisma.review.deleteMany({
      where: {
        user: {
          email,
        },
      },
    });
  
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
  it("should reject reviewing the same product twice", async () => {
    const email = `review-duplicate-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate Review User",
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
      price: 450,
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
  
    const confirmResponse = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transactionId: `txn-duplicate-review-${Date.now()}`,
      });
  
    expect(confirmResponse.status).toBe(200);
  
    const firstResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        comment: "First review",
      });
  
    expect(firstResponse.status).toBe(201);
  
    const secondResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 4,
        comment: "Second review",
      });
  
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.message).toBe(
      "You have already reviewed this product"
    );
  
    await prisma.review.deleteMany({
      where: {
        user: {
          email,
        },
      },
    });
  
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
  it("should return reviews for a product", async () => {
    const email = `review-get-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Reader",
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
  
    const orderId = orderResponse.body.order.id;
  
    const paymentResponse = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId,
        paymentMethod: "UPI",
      });
  
    const paymentId = paymentResponse.body.payment.id;
  
    await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transactionId: `txn-review-get-${Date.now()}`,
      });
  
    const reviewResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 4,
        comment: "Good product!",
      });
  
    expect(reviewResponse.status).toBe(201);
  
    const response = await request(app)
      .get(`/api/products/${product.id}/reviews`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.product.id).toBe(product.id);
    expect(response.body.product.name).toBe(product.name);
    expect(response.body.count).toBe(1);
    expect(response.body.averageRating).toBe(4);
    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.reviews[0].rating).toBe(4);
    expect(response.body.reviews[0].comment).toBe("Good product!");
    expect(response.body.reviews[0].user.name).toBe("Review Reader");
  
    await prisma.review.deleteMany({
      where: {
        user: {
          email,
        },
      },
    });
  
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
  it("should reject updating another user's review", async () => {
    const ownerEmail = `review-owner-${Date.now()}@example.com`;
    const otherEmail = `review-other-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    // Create review owner
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Owner",
        email: ownerEmail,
        password,
      });
  
    const ownerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: ownerEmail,
        password,
      });
  
    const ownerToken = ownerLogin.body.token;
  
    // Create another user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Other User",
        email: otherEmail,
        password,
      });
  
    const otherLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherEmail,
        password,
      });
  
    const otherToken = otherLogin.body.token;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 500,
    });
  
    // Owner purchases product
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        productId: product.id,
        quantity: 1,
      });
  
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${ownerToken}`);
  
    expect(orderResponse.status).toBe(201);
  
    const orderId = orderResponse.body.order.id;
  
    const paymentResponse = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        orderId,
        paymentMethod: "UPI",
      });
  
    expect(paymentResponse.status).toBe(201);
  
    const paymentId = paymentResponse.body.payment.id;
  
    const confirmResponse = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        transactionId: `txn-review-owner-${Date.now()}`,
      });
  
    expect(confirmResponse.status).toBe(200);
  
    // Owner creates review
    const reviewResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        rating: 5,
        comment: "Original review",
      });
  
    expect(reviewResponse.status).toBe(201);
  
    const reviewId = reviewResponse.body.review.id;
  
    // Other user attempts to update it
    const response = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        rating: 1,
        comment: "Hacked review",
      });
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Review not found");
  
    // Cleanup
    await prisma.review.deleteMany({
      where: {
        id: reviewId,
      },
    });
  
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
          email: ownerEmail,
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
          in: [ownerEmail, otherEmail],
        },
      },
    });
  });
  it("should reject deleting another user's review", async () => {
    const ownerEmail = `review-delete-owner-${Date.now()}@example.com`;
    const otherEmail = `review-delete-other-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete Review Owner",
        email: ownerEmail,
        password,
      });
  
    const ownerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: ownerEmail,
        password,
      });
  
    const ownerToken = ownerLogin.body.token;
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete Review Other",
        email: otherEmail,
        password,
      });
  
    const otherLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherEmail,
        password,
      });
  
    const otherToken = otherLogin.body.token;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 500,
    });
  
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        productId: product.id,
        quantity: 1,
      });
  
    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${ownerToken}`);
  
    expect(orderResponse.status).toBe(201);
  
    const orderId = orderResponse.body.order.id;
  
    const paymentResponse = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        orderId,
        paymentMethod: "UPI",
      });
  
    expect(paymentResponse.status).toBe(201);
  
    const paymentId = paymentResponse.body.payment.id;
  
    const confirmResponse = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        transactionId: `txn-review-delete-${Date.now()}`,
      });
  
    expect(confirmResponse.status).toBe(200);
  
    const reviewResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        rating: 5,
        comment: "Review that should not be deleted",
      });
  
    expect(reviewResponse.status).toBe(201);
  
    const reviewId = reviewResponse.body.review.id;
  
    const response = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${otherToken}`);
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Review not found");
  
    await prisma.review.deleteMany({
      where: {
        id: reviewId,
      },
    });
  
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
          email: ownerEmail,
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
          in: [ownerEmail, otherEmail],
        },
      },
    });
  });
  it("should allow a user to update their own review", async () => {
    const email = `review-update-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Update User",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 600,
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
  
    const confirmResponse = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transactionId: `txn-review-update-${Date.now()}`,
      });
  
    expect(confirmResponse.status).toBe(200);
  
    const reviewResponse = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 3,
        comment: "Original comment",
      });
  
    expect(reviewResponse.status).toBe(201);
  
    const reviewId = reviewResponse.body.review.id;
  
    const response = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        comment: "Updated comment",
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Review updated successfully");
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.comment).toBe("Updated comment");
    expect(response.body.review.product.id).toBe(product.id);
    expect(response.body.review.user.name).toBe("Review Update User");
  
    await prisma.review.deleteMany({
      where: {
        id: reviewId,
      },
    });
  
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
  it("should reject a review with an invalid rating", async () => {
    const email = `review-validation-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review Validation User",
        email,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      stock: 10,
      price: 300,
    });
  
    const response = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 6,
        comment: "Invalid rating",
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  
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
});