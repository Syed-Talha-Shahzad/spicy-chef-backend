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

      // Check if category name already exists
      const existingCategory = await prisma.category.findFirst({
        where: { name },
      });

      if (existingCategory) {
        return {
          status: false,
          message: "A category with this name already exists.",
        };
      }

      // Check if branch exists
      const existingBranch = await prisma.branch.findFirst({
        where: { id: branch_id },
      });

      if (!existingBranch) {
        return {
          status: false,
          message: "Invalid branch ID: No matching branch found.",
        };
      }

      // Create category with nested items and variations
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
              variation: {
                create: i.variation.map((v) => ({
                  name: v.name,
                  price: v.price,
                })),
              },
            })),
          },
        },
        include: {
          item: {
            include: {
              variation: true,
            },
          },
        },
      });

      return {
        status: true,
        message: "Category created successfully",
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
  
      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          item: {
            include: { variation: true },
          },
        },
      });
  
      if (!existingCategory) {
        return {
          status: false,
          message: "Category not found.",
        };
      }
  
      // Check for duplicate category name
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
  
      // Check branch exists
      const branchExists = await prisma.branch.findUnique({
        where: { id: branch_id },
      });
  
      if (!branchExists) {
        return {
          status: false,
          message: "Invalid branch ID: No matching branch found.",
        };
      }
  
      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required to update the category.",
        };
      }
  
      // Update category info
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
          // Ensure item exists and belongs to this category
          const existingItem = await prisma.item.findFirst({
            where: {
              id: i.id,
              category_id: id,
            },
          });
  
          if (!existingItem) {
            return {
              status: false,
              message: `Item with ID ${i.id} not found under this category.`,
            };
          }
  
          const updatedItem = await prisma.item.update({
            where: { id: i.id },
            data: {
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description,
            },
          });
  
          updatedItemIds.push(updatedItem.id);
  
          // Sync variations
          const existingVariations = await prisma.variation.findMany({
            where: { itemId: i.id },
          });
  
          const existingVariationIds = existingVariations.map(v => v.id);
          const incomingVariationIds = (i.variation || [])
            .filter(v => v.id)
            .map(v => v.id);
  
          const toDelete = existingVariationIds.filter(
            id => !incomingVariationIds.includes(id)
          );
  
          if (toDelete.length > 0) {
            await prisma.variation.deleteMany({ where: { id: { in: toDelete } } });
          }
  
          for (const v of i.variation || []) {
            if (v.id && existingVariationIds.includes(v.id)) {
              await prisma.variation.update({
                where: { id: v.id },
                data: {
                  name: v.name,
                  price: v.price,
                },
              });
            } else {
              await prisma.variation.create({
                data: {
                  name: v.name,
                  price: v.price,
                  itemId: i.id,
                },
              });
            }
          }
  
        } else {
          // Create new item with variations
          const createdItem = await prisma.item.create({
            data: {
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description,
              category_id: id,
              variation: {
                create: i.variation.map(v => ({
                  name: v.name,
                  price: v.price,
                })),
              },
            },
          });
  
          updatedItemIds.push(createdItem.id);
        }
      }
  
      await prisma.item.deleteMany({
        where: {
          category_id: id,
          NOT: { id: { in: updatedItemIds } },
        },
      });
  
      const finalCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          item: {
            include: { variation: true },
          },
        },
      });
  
      return {
        status: true,
        message: "Category updated successfully.",
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
          item: {
            include: {
              variation: true,
            },
          },
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
        include: {
          item: {
            include: { variation: true },
          },
        },
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
      const { name, price, image, description, category_id, variation } =
        req.body;

      const categoryExists = await prisma.category.findUnique({
        where: { id: category_id },
      });
      if (!categoryExists) {
        return {
          status: false,
          message: "Category does not exist",
        };
      }

      const createdItem = await prisma.item.create({
        data: {
          name,
          price,
          image,
          description,
          category_id,
          variation:
            variation && Array.isArray(variation)
              ? {
                  create: variation.map((v) => ({
                    name: v.name,
                    price: v.price,
                  })),
                }
              : undefined,
        },
        include: {
          variation: true,
        },
      });

      return {
        status: true,
        message: "Item created successfully",
        data: createdItem,
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
          variation: true,
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
      const {
        name,
        price,
        image,
        description,
        category_id,
        status,
        variation, // <-- this is the array of variations
      } = req.body;

      // Check if item exists
      const existingItem = await prisma.item.findUnique({
        where: { id },
        include: { variation: true }, // Use correct relation name
      });

      if (!existingItem) {
        return {
          status: false,
          message: "Item not found",
        };
      }

      // Optional: Validate category_id
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

      // Update item basic fields
      await prisma.item.update({
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

      // Prepare variation syncing
      const existingVariationIds = existingItem.variation.map((v) => v.id);
      const incomingVariationIds = (variation || [])
        .filter((v) => v.id)
        .map((v) => v.id);

      // 1. Delete removed variations
      const toDelete = existingVariationIds.filter(
        (existingId) => !incomingVariationIds.includes(existingId)
      );

      if (toDelete.length > 0) {
        await prisma.variation.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // 2. Create or update variations
      for (const v of variation || []) {
        if (v.id && existingVariationIds.includes(v.id)) {
          await prisma.variation.update({
            where: { id: v.id },
            data: {
              name: v.name,
              price: v.price,
            },
          });
        } else {
          await prisma.variation.create({
            data: {
              name: v.name,
              price: v.price,
              itemId: id,
            },
          });
        }
      }

      const updatedItemWithVariations = await prisma.item.findUnique({
        where: { id },
        include: { variation: true },
      });

      return {
        status: true,
        message: "Item updated successfully",
        data: updatedItemWithVariations,
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
