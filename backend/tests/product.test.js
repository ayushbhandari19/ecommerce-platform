import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import {
  createTestCategory,
  createTestProduct,
} from "./helpers/testData.js";
import bcrypt from "bcryptjs";
describe("Product API", () => {
  it("should return a paginated list of products", async () => {
    const category = await createTestCategory();

    const product1 = await createTestProduct(category.id, {
      name: `Test Product A ${Date.now()}`,
      price: 100,
      stock: 10,
    });

    const product2 = await createTestProduct(category.id, {
      name: `Test Product B ${Date.now()}`,
      price: 200,
      stock: 10,
    });

    const response = await request(app)
      .get("/api/products")
      .query({
        page: 1,
        limit: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.products).toBeInstanceOf(Array);
    expect(response.body.count).toBeGreaterThanOrEqual(2);

    expect(response.body.pagination).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNextPage: expect.any(Boolean),
        hasPreviousPage: false,
      })
    );

    const returnedProductIds = response.body.products.map(
      (product) => product.id
    );

    expect(returnedProductIds).toContain(product1.id);
    expect(returnedProductIds).toContain(product2.id);

    expect(response.body.products[0].category).toBeDefined();

    await prisma.product.deleteMany({
      where: {
        id: {
          in: [product1.id, product2.id],
        },
      },
    });

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  });
  it("should search products by name, description, and slug", async () => {
    const category = await createTestCategory();
  
    const nameProduct = await createTestProduct(category.id, {
      name: `Laptop Search ${Date.now()}`,
      slug: `laptop-search-${Date.now()}`,
      description: "A powerful computer",
      price: 1000,
      stock: 10,
    });
  
    const descriptionProduct = await createTestProduct(category.id, {
      name: `Office Device ${Date.now()}`,
      slug: `office-device-${Date.now()}`,
      description: "Special gaming laptop for developers",
      price: 1200,
      stock: 10,
    });
  
    const slugProduct = await createTestProduct(category.id, {
      name: `Premium Device ${Date.now()}`,
      slug: `gaming-keyboard-${Date.now()}`,
      description: "Mechanical keyboard",
      price: 800,
      stock: 10,
    });
  
    const nameResponse = await request(app)
      .get("/api/products")
      .query({ search: "Laptop Search" });
  
    expect(nameResponse.status).toBe(200);
    expect(
      nameResponse.body.products.some(
        (product) => product.id === nameProduct.id
      )
    ).toBe(true);
  
    const descriptionResponse = await request(app)
      .get("/api/products")
      .query({ search: "gaming laptop" });
  
    expect(descriptionResponse.status).toBe(200);
    expect(
      descriptionResponse.body.products.some(
        (product) => product.id === descriptionProduct.id
      )
    ).toBe(true);
  
    const slugResponse = await request(app)
      .get("/api/products")
      .query({ search: "gaming-keyboard" });
  
    expect(slugResponse.status).toBe(200);
    expect(
      slugResponse.body.products.some(
        (product) => product.id === slugProduct.id
      )
    ).toBe(true);
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [
            nameProduct.id,
            descriptionProduct.id,
            slugProduct.id,
          ],
        },
      },
    });
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  });
  it("should filter products by category slug", async () => {
    const electronicsCategory = await createTestCategory();
    const clothingCategory = await createTestCategory();
  
    const electronicsProduct = await createTestProduct(
      electronicsCategory.id,
      {
        name: `Electronics Product ${Date.now()}`,
        price: 1000,
        stock: 10,
      }
    );
  
    const clothingProduct = await createTestProduct(
      clothingCategory.id,
      {
        name: `Clothing Product ${Date.now()}`,
        price: 500,
        stock: 10,
      }
    );
  
    const response = await request(app)
      .get("/api/products")
      .query({
        category: electronicsCategory.slug,
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  
    const productIds = response.body.products.map(
      (product) => product.id
    );
  
    expect(productIds).toContain(electronicsProduct.id);
    expect(productIds).not.toContain(clothingProduct.id);
  
    expect(
      response.body.products.every(
        (product) =>
          product.category.slug.toLowerCase() ===
          electronicsCategory.slug.toLowerCase()
      )
    ).toBe(true);
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [
            electronicsProduct.id,
            clothingProduct.id,
          ],
        },
      },
    });
  
    await prisma.category.deleteMany({
      where: {
        id: {
          in: [
            electronicsCategory.id,
            clothingCategory.id,
          ],
        },
      },
    });
  });
  it("should sort products by price ascending and descending", async () => {
    const category = await createTestCategory();
  
    const cheapProduct = await createTestProduct(category.id, {
      name: `Cheap Product ${Date.now()}`,
      price: 100,
      stock: 10,
    });
  
    const expensiveProduct = await createTestProduct(category.id, {
      name: `Expensive Product ${Date.now()}`,
      price: 1000,
      stock: 10,
    });
  
    const ascendingResponse = await request(app)
      .get("/api/products")
      .query({
        sort: "price_asc",
        limit: 100,
      });
  
    expect(ascendingResponse.status).toBe(200);
  
    const ascendingProducts = ascendingResponse.body.products;
  
    const cheapIndex = ascendingProducts.findIndex(
      (product) => product.id === cheapProduct.id
    );
  
    const expensiveIndex = ascendingProducts.findIndex(
      (product) => product.id === expensiveProduct.id
    );
  
    expect(cheapIndex).toBeLessThan(expensiveIndex);
  
    const descendingResponse = await request(app)
      .get("/api/products")
      .query({
        sort: "price_desc",
        limit: 100,
      });
  
    expect(descendingResponse.status).toBe(200);
  
    const descendingProducts = descendingResponse.body.products;
  
    const cheapIndexDesc = descendingProducts.findIndex(
      (product) => product.id === cheapProduct.id
    );
  
    const expensiveIndexDesc = descendingProducts.findIndex(
      (product) => product.id === expensiveProduct.id
    );
  
    expect(expensiveIndexDesc).toBeLessThan(cheapIndexDesc);
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [
            cheapProduct.id,
            expensiveProduct.id,
          ],
        },
      },
    });
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  });
  it("should sort products by newest and oldest", async () => {
    const category = await createTestCategory();
  
    const firstProduct = await createTestProduct(category.id, {
      name: `First Product ${Date.now()}`,
      price: 300,
      stock: 10,
    });
  
    // Small delay so createdAt values are guaranteed to differ
    await new Promise((resolve) => setTimeout(resolve, 10));
  
    const secondProduct = await createTestProduct(category.id, {
      name: `Second Product ${Date.now()}`,
      price: 400,
      stock: 10,
    });
  
    const newestResponse = await request(app)
      .get("/api/products")
      .query({
        sort: "newest",
        limit: 100,
      });
  
    expect(newestResponse.status).toBe(200);
  
    const newestProducts = newestResponse.body.products;
  
    const firstIndexNewest = newestProducts.findIndex(
      (product) => product.id === firstProduct.id
    );
  
    const secondIndexNewest = newestProducts.findIndex(
      (product) => product.id === secondProduct.id
    );
  
    expect(secondIndexNewest).toBeLessThan(firstIndexNewest);
  
    const oldestResponse = await request(app)
      .get("/api/products")
      .query({
        sort: "oldest",
        limit: 100,
      });
  
    expect(oldestResponse.status).toBe(200);
  
    const oldestProducts = oldestResponse.body.products;
  
    const firstIndexOldest = oldestProducts.findIndex(
      (product) => product.id === firstProduct.id
    );
  
    const secondIndexOldest = oldestProducts.findIndex(
      (product) => product.id === secondProduct.id
    );
  
    expect(firstIndexOldest).toBeLessThan(secondIndexOldest);
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [
            firstProduct.id,
            secondProduct.id,
          ],
        },
      },
    });
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  });
  it("should reject an invalid sort option", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({
        sort: "invalid_sort",
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid sort option");
  
    expect(response.body.allowedSorts).toEqual([
      "price_asc",
      "price_desc",
      "newest",
      "oldest",
    ]);
  });
  it("should return a product by ID", async () => {
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Single Product ${Date.now()}`,
      price: 750,
      stock: 15,
    });
  
    const response = await request(app)
      .get(`/api/products/${product.id}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  
    expect(response.body.product.id).toBe(product.id);
    expect(response.body.product.name).toBe(product.name);
    expect(Number(response.body.product.price)).toBe(750);
    expect(response.body.product.stock).toBe(15);
  
    expect(response.body.product.category).toBeDefined();
    expect(response.body.product.category.id).toBe(category.id);
  
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
  });
  it("should return 404 when the product does not exist", async () => {
    const response = await request(app)
      .get("/api/products/999999999");
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Product not found");
  });
  it("should reject product creation by a non-admin user", async () => {
    const email = `product-customer-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Product Customer",
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
  
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Unauthorized Product",
        slug: `unauthorized-product-${Date.now()}`,
        description: "This should not be created",
        price: 500,
        stock: 10,
        categoryId: category.id,
      });
  
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  
    await prisma.cart.deleteMany({
      where: {
        user: {
          email,
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
  it("should allow an admin to create a product", async () => {
    const adminEmail = `product-admin-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const slug = `admin-product-${Date.now()}`;
  
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Admin Created Product",
        slug,
        description: "Product created by an administrator",
        price: 999,
        stock: 25,
        image: "https://example.com/product.jpg",
        categoryId: category.id,
      });
  
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  
    expect(response.body.product.name).toBe("Admin Created Product");
    expect(response.body.product.slug).toBe(slug);
    expect(Number(response.body.product.price)).toBe(999);
    expect(response.body.product.stock).toBe(25);
    expect(response.body.product.categoryId).toBe(category.id);
  
    const createdProductId = response.body.product.id;
  
    await prisma.product.delete({
      where: {
        id: createdProductId,
      },
    });
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });;
  it("should reject creating a product with a duplicate slug", async () => {
    const adminEmail = `product-duplicate-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Duplicate Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const slug = `duplicate-product-${Date.now()}`;
  
    const firstResponse = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "First Product",
        slug,
        description: "The original product",
        price: 500,
        stock: 10,
        categoryId: category.id,
      });
  
    expect(firstResponse.status).toBe(201);
  
    const secondResponse = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Second Product",
        slug,
        description: "This slug already exists",
        price: 700,
        stock: 5,
        categoryId: category.id,
      });
  
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.message).toBe(
      "A product with this slug already exists"
    );
  
    await prisma.product.deleteMany({
      where: {
        slug,
      },
    });
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
  it("should reject creating a product with a non-existent category", async () => {
    const adminEmail = `product-category-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Category Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invalid Category Product",
        slug: `invalid-category-${Date.now()}`,
        description: "Product with invalid category",
        price: 500,
        stock: 10,
        categoryId: 999999999,
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "The specified category does not exist"
    );
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
  it("should reject invalid product data", async () => {
    const adminEmail = `product-validation-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Validation Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "A",
        slug: "x",
        description: "Bad",
        price: -100,
        stock: -5,
        categoryId: -1,
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  
    expect(response.body.errors).toBeDefined();
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
  it("should reject product update by a non-admin user", async () => {
    const customerEmail = `product-update-customer-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Protected Product ${Date.now()}`,
      price: 500,
      stock: 10,
    });
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Product Update Customer",
        email: customerEmail,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: customerEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Unauthorized Update",
        price: 999,
      });
  
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  
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
        email: customerEmail,
      },
    });
  });
  it("should allow an admin to update a product", async () => {
    const adminEmail = `product-update-admin-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Original Product ${Date.now()}`,
      slug: `original-product-${Date.now()}`,
      description: "Original product description",
      price: 500,
      stock: 10,
    });
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Update Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Product",
        description: "Updated product description",
        price: 750,
        stock: 25,
      });
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  
    expect(response.body.product.id).toBe(product.id);
    expect(response.body.product.name).toBe("Updated Product");
    expect(response.body.product.description).toBe(
      "Updated product description"
    );
    expect(Number(response.body.product.price)).toBe(750);
    expect(response.body.product.stock).toBe(25);
  
    // Fields not included in the update should remain unchanged.
    expect(response.body.product.slug).toBe(product.slug);
    expect(response.body.product.categoryId).toBe(category.id);
  
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
        email: adminEmail,
      },
    });
  });
  it("should reject updating a product with a duplicate slug", async () => {
    const adminEmail = `product-update-duplicate-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const product1 = await createTestProduct(category.id, {
      name: `Product One ${Date.now()}`,
      slug: `product-one-${Date.now()}`,
      description: "First product",
      price: 500,
      stock: 10,
    });
  
    const product2 = await createTestProduct(category.id, {
      name: `Product Two ${Date.now()}`,
      slug: `product-two-${Date.now()}`,
      description: "Second product",
      price: 700,
      stock: 10,
    });
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Product Duplicate Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .put(`/api/products/${product2.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        slug: product1.slug,
      });
  
    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "A product with this slug already exists"
    );
  
    await prisma.product.deleteMany({
      where: {
        id: {
          in: [product1.id, product2.id],
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
        email: adminEmail,
      },
    });
  });
  it("should reject updating a product with a non-existent category", async () => {
    const adminEmail = `product-update-category-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Category Update Product ${Date.now()}`,
      price: 600,
      stock: 10,
    });
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Category Update Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: 999999999,
      });
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "The specified category does not exist"
    );
  
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
        email: adminEmail,
      },
    });
  });
  it("should return 404 when updating a non-existent product", async () => {
    const adminEmail = `product-update-missing-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Missing Product Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .put("/api/products/999999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Missing Product",
      });
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Product not found");
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
  it("should reject product deletion by a non-admin user", async () => {
    const customerEmail = `product-delete-customer-${Date.now()}@example.com`;
    const password = "TestPassword123";
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Protected Delete Product ${Date.now()}`,
      price: 500,
      stock: 10,
    });
  
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete Customer",
        email: customerEmail,
        password,
      });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: customerEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .delete(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  
    // Verify the product was not deleted.
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(existingProduct).not.toBeNull();
  
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
        email: customerEmail,
      },
    });
  });
  it("should allow an admin to delete a product", async () => {
    const adminEmail = `product-delete-admin-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const category = await createTestCategory();
  
    const product = await createTestProduct(category.id, {
      name: `Delete Product ${Date.now()}`,
      price: 400,
      stock: 10,
    });
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Delete Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .delete(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Product deleted successfully");
  
    const deletedProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
  
    expect(deletedProduct).toBeNull();
  
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
  it("should return 404 when deleting a non-existent product", async () => {
    const adminEmail = `product-delete-missing-${Date.now()}@example.com`;
    const password = "AdminPassword123";
  
    const hashedPassword = await bcrypt.hash(password, 12);
  
    await prisma.user.create({
      data: {
        name: "Missing Delete Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });
  
    expect(loginResponse.status).toBe(200);
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .delete("/api/products/999999999")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Product not found");
  
    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });
  });
});