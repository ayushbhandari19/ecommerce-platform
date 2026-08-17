const prisma = require("../lib/prisma");

const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(error);
  
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }
  
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};
const getCategories = async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          products: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  };

module.exports = {
  createCategory,
  getCategories,
};