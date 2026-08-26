import prisma from "../../src/lib/prisma.js";

export async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: {
      name: "Test User",
      email: `test-${Date.now()}-${Math.random()}@example.com`,
      password: "$2b$12$testhashedpassword",
      ...overrides,
    },
  });
}

export async function createTestCategory(overrides = {}) {
  return prisma.category.create({
    data: {
      name: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}-${Math.random()}`,
      ...overrides,
    },
  });
}

export async function createTestProduct(categoryId, overrides = {}) {
  return prisma.product.create({
    data: {
      name: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}-${Math.random()}`,
      description: "Product created for automated testing",
      price: 100,
      stock: 10,
      categoryId,
      ...overrides,
    },
  });
}

export async function cleanupTestData() {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}
