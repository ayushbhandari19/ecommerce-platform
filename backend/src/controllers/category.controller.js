const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const createCategory = async (req, res, next) => {
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
    next(error);
  }
};
const getCategories = async (req, res, next) => {
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
    next(error);
  }
};
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }
    const category = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
      },
    });

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.products.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that contains products",
      });
    }

    await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};