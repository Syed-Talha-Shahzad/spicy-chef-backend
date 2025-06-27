import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class categoryService {
  static async createCategory(req) {
    try {
      const { name, image, items, branch_id } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required",
        };
      }

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: name,
        },
      });

      if (existingCategory) {
        return {
          status: false,
          message: "A category with this name already exists.",
        };
      }

      const existingBranch = await prisma.branch.findFirst({
        where: {
          id: branch_id,
        },
      });

      if (!existingBranch) {
        return {
          status: false,
          message: "Invalid branch ID: No matching branch found.",
        };
      }

      const category = await prisma.category.create({
        data: {
          name,
          image,
          branch_id,
          item: {
            create: items.map((i) => ({
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description,
            })),
          },
        },
        include: {
          item: true,
        },
      });

      return {
        status: true,
        data: category,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateCategory(req) {
    try {
      const { id, name, image, branch_id, items } = req.body;

      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!existingCategory) {
        return {
          status: false,
          message: "Category not found.",
        };
      }

      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (duplicateCategory) {
        return {
          status: false,
          message: "A category with this name already exists.",
        };
      }

      const branchExists = await prisma.branch.findUnique({
        where: { id: branch_id },
      });

      if (!branchExists) {
        return {
          status: false,
          message: "Invalid branch ID: No matching branch found.",
        };
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required to update the category.",
        };
      }

      // Update category
      await prisma.category.update({
        where: { id },
        data: {
          name,
          image,
          branch_id,
        },
      });

      const updatedItemIds = [];

      for (const i of items) {
        if (i.id) {
          // Check if item exists under this category
          const existingItem = await prisma.item.findFirst({
            where: {
              id: i.id,
              category_id: id,
            },
          });

          if (existingItem) {
            const updated = await prisma.item.update({
              where: { id: i.id },
              data: {
                name: i.name,
                price: i.price,
                image: i.image,
                description: i.description,
              },
            });
            updatedItemIds.push(updated.id);
          }
        } else {
          const created = await prisma.item.create({
            data: {
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description,
              category_id: id,
            },
          });
          updatedItemIds.push(created.id);
        }
      }

      // Delete removed items
      await prisma.item.deleteMany({
        where: {
          category_id: id,
          NOT: {
            id: { in: updatedItemIds },
          },
        },
      });

      const finalCategory = await prisma.category.findUnique({
        where: { id },
        include: { item: true },
      });

      return {
        status: true,
        data: finalCategory,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async categoryDetails(req) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          item: true,
        },
      });

      if (!category) {
        return {
          status: false,
          message: "Category not found.",
        };
      }

      return {
        status: true,
        data: category,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async deleteCategory(req) {
    try {
      const { id } = req.params;

      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return {
          status: false,
          message: "Category not found.",
        };
      }

      // Will cascade delete items if defined in the Prisma schema
      await prisma.category.delete({
        where: { id },
      });

      return {
        status: true,
        message: "Category deleted successfully.",
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async listingCategories(req) {
    try {
      const { branch_id } = req.query;

      const branchExists = await prisma.branch.findUnique({
        where: { id: branch_id },
      });

      if (!branchExists) {
        return {
          status: false,
          message: "No branch found with the provided ID.",
        };
      }

      // Fetch all categories for the branch
      const categories = await prisma.category.findMany({
        where: { branch_id },
        include: { item: true },
        orderBy: { createdAt: "desc" },
      });

      return {
        status: true,
        data: categories,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async createItem(req) {
    try {
      const { name, price, image, description, category_id } = req.body;

      const categoryExists = await prisma.category.findUnique({
        where: { id: category_id },
      });

      if (!categoryExists) {
        return {
          status: false,
          message: "Invalid category_id. Category not found",
        };
      }

      const item = await prisma.item.create({
        data: {
          name,
          price,
          image,
          description,
          category_id,
        },
      });

      return {
        status: true,
        message: "Item created successfully",
        data: item,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async getItemListing(req) {
    try {
      const { category_id, status } = req.query;
      let where = {};

      if (category_id) {
        where.category_id = category_id;
      }

      if (status === "active") {
        where.status = true;
      } else if (status === "inactive") {
        where.status = false;
      }

      const items = await prisma.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      });

      return {
        status: true,
        message: "Items fetched successfully",
        data: items,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateItem(req) {
    try {
     
      const { id } = req.params;
      const { name, price, image, description, category_id, status } = req.body;

      if (category_id) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: category_id },
        });

        if (!categoryExists) {
          return {
            status: false,
            message: "Invalid category_id. Category not found",
          };
        }
      }

      const existingItem = await prisma.item.findFirst({
        where: { id },
      });
      
      if (!existingItem) {
        return {
          status: false,
          message: "Item not found",
        };
      }

      const updatedItem = await prisma.item.update({
        where: { id },
        data: {
          name,
          price,
          image,
          description,
          category_id,
          status,
        },
      });

      return {
        status: true,
        message: "Item updated successfully",
        data: updatedItem,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async deleteItem(req) {
    try {
      const { id } = req.params;

      const itemExists = await prisma.item.findFirst({
        where: { id },
      });

      if (!itemExists) {
        return {
          status: false,
          message: "Item does not exists",
        };
      }
      await prisma.item.delete({
        where: { id },
      });

      return {
        status: true,
        message: "Item deleted successfully",
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }
}

export default categoryService;
