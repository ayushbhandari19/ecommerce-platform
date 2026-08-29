const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      stock,
      image,
      categoryId,
    } = req.body;

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

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new AppError("A product with this slug already exists", 409)
      );
    }

    if (error.code === "P2003") {
      return next(
        new AppError("The specified category does not exist", 400)
      );
    }
    next(error);
  }
};
const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search = req.query.search?.trim();

    const skip = (page - 1) * limit;
    const category = req.query.category?.trim();
    const sort = req.query.sort?.trim() || "newest";

    const sortOptions = {
      price_asc: {
        price: "asc",
      },
      price_desc: {
        price: "desc",
      },
      newest: {
        createdAt: "desc",
      },
      oldest: {
        createdAt: "asc",
      },
    };

    const orderBy = sortOptions[sort];

    if (!orderBy) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option",
        allowedSorts: Object.keys(sortOptions),
      });
    }

    const where = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(category && {
        category: {
          slug: {
            equals: category,
            mode: "insensitive",
          },
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy,
      }),
      prisma.product.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      description,
      price,
      stock,
      image,
      categoryId,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new AppError("A product with this slug already exists", 409)
      );
    }

    if (error.code === "P2003") {
      return next(
        new AppError("The specified category does not exist", 400)
      );
    }
    next(error);
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};