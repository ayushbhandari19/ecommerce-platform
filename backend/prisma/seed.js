require("dotenv").config();

const prisma = require("../src/lib/prisma");

async function main() {
  const runningShoes = await prisma.category.upsert({
    where: { slug: "running-shoes" },
    update: {},
    create: {
      name: "running shoes",
      slug: "running-shoes",
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const products = [
    {
      name: "Nike Air Max",
      slug: "nike-air-max",
      description: "Nike Air Max running shoes.",
      price: 6999.99,
      stock: 10,
      image: "https://example.com/nike-air-max.jpg",
      categoryId: runningShoes.id,
    },
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Wireless headphones for everyday listening.",
      price: 2999.99,
      stock: 10,
      image: "https://example.com/headphones.jpg",
      categoryId: electronics.id,
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Sony WH-1000XM5 wireless noise-cancelling headphones.",
      price: 27999.99,
      stock: 7,
      image: null,
      categoryId: electronics.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Production catalog seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
