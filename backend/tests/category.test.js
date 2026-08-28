import { describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

const createUser = async ({
  name,
  email,
  password = "TestPassword123",
  role = "CUSTOMER",
}) => {
  return prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
    },
  });
};

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

describe("Category API", () => {
  it("should return all categories publicly", async () => {
    const category = await prisma.category.create({
      data: {
        name: `Public Category ${Date.now()}`,
        slug: `public-category-${Date.now()}`,
      },
    });

    const response = await request(app)
      .get("/api/categories");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.categories).toBeDefined();
    expect(response.body.categories.some(
      (item) => item.id === category.id
    )).toBe(true);

    await prisma.category.delete({
      where: { id: category.id },
    });
  });

  it("should reject unauthenticated category creation", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({
        name: "Unauthorized Category",
        slug: `unauthorized-${Date.now()}`,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject category creation by a non-admin user", async () => {
    const email = `category-customer-${Date.now()}@example.com`;

    const user = await createUser({
      name: "Category Customer",
      email,
    });

    const token = createToken(user);

    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Customer Category",
        slug: `customer-category-${Date.now()}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    await prisma.user.delete({
      where: { id: user.id },
    });
  });

  it("should allow an admin to create a category", async () => {
    const email = `category-admin-${Date.now()}@example.com`;
    const slug = `admin-category-${Date.now()}`;

    const admin = await createUser({
      name: "Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Admin Category",
        slug,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.category.name).toBe("Admin Category");
    expect(response.body.category.slug).toBe(slug);

    await prisma.category.delete({
      where: {
        id: response.body.category.id,
      },
    });

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should reject creating a category with a duplicate slug", async () => {
    const email = `duplicate-category-${Date.now()}@example.com`;
    const slug = `duplicate-category-${Date.now()}`;

    const admin = await createUser({
      name: "Duplicate Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const category = await prisma.category.create({
      data: {
        name: "Existing Category",
        slug,
      },
    });

    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Another Category",
        slug,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);

    await prisma.category.delete({
      where: { id: category.id },
    });

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should allow an admin to update a category", async () => {
    const email = `update-category-${Date.now()}@example.com`;

    const admin = await createUser({
      name: "Update Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const category = await prisma.category.create({
      data: {
        name: "Old Category",
        slug: `old-category-${Date.now()}`,
      },
    });

    const response = await request(app)
      .put(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Category",
        slug: `updated-category-${Date.now()}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.category.name).toBe("Updated Category");

    await prisma.category.delete({
      where: { id: category.id },
    });

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should reject updating a non-existent category", async () => {
    const email = `missing-category-${Date.now()}@example.com`;

    const admin = await createUser({
      name: "Missing Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const response = await request(app)
      .put("/api/categories/999999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Category",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Category not found");

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should reject deleting a category that contains products", async () => {
    const email = `delete-category-${Date.now()}@example.com`;

    const admin = await createUser({
      name: "Delete Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const category = await prisma.category.create({
      data: {
        name: "Category With Product",
        slug: `category-with-product-${Date.now()}`,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Category Test Product",
        slug: `category-test-product-${Date.now()}`,
        description: "Product used for category deletion testing",
        price: 100,
        stock: 10,
        categoryId: category.id,
      },
    });

    const response = await request(app)
      .delete(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Cannot delete a category that contains products"
    );

    await prisma.product.delete({
      where: { id: product.id },
    });

    await prisma.category.delete({
      where: { id: category.id },
    });

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should allow an admin to delete an empty category", async () => {
    const email = `empty-category-${Date.now()}@example.com`;

    const admin = await createUser({
      name: "Empty Category Admin",
      email,
      role: "ADMIN",
    });

    const token = createToken(admin);

    const category = await prisma.category.create({
      data: {
        name: "Empty Category",
        slug: `empty-category-${Date.now()}`,
      },
    });

    const response = await request(app)
      .delete(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Category deleted successfully");

    const deletedCategory = await prisma.category.findUnique({
      where: {
        id: category.id,
      },
    });

    expect(deletedCategory).toBeNull();

    await prisma.user.delete({
      where: { id: admin.id },
    });
  });

  it("should reject category update by a non-admin user", async () => {
    const email = `category-update-customer-${Date.now()}@example.com`;

    const user = await createUser({
      name: "Category Update Customer",
      email,
    });

    const token = createToken(user);

    const category = await prisma.category.create({
      data: {
        name: "Protected Category",
        slug: `protected-category-${Date.now()}`,
      },
    });

    const response = await request(app)
      .put(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Should Not Update",
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    await prisma.category.delete({
      where: { id: category.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });
  });

  it("should reject category deletion by a non-admin user", async () => {
    const email = `category-delete-customer-${Date.now()}@example.com`;

    const user = await createUser({
      name: "Category Delete Customer",
      email,
    });

    const token = createToken(user);

    const category = await prisma.category.create({
      data: {
        name: "Protected Delete Category",
        slug: `protected-delete-category-${Date.now()}`,
      },
    });

    const response = await request(app)
      .delete(`/api/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    await prisma.category.delete({
      where: { id: category.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });
  });
});