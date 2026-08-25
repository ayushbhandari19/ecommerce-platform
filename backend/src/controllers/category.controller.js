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
  const updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;

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
      console.error(error);

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message: "A category with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update category",
      });
    }
  };

  const deleteCategory = async (req, res) => {
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
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete category",
      });
    }
  };
module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};