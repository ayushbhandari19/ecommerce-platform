const prisma = require("../lib/prisma");

const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, stock, image, categoryId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        image,
        categoryId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

module.exports = {
  createProduct,
};