import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class categoryService {
  static async createCategory(req) {
    const { name, image, items, branch_id, is_deal } = req.body;

    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required",
        };
      }

      // Check for duplicate category
      const existingCategory = await prisma.category.findFirst({
        where: { name },
      });

      if (existingCategory) {
        return {
          status: false,
          message: "A category with this name already exists.",
        };
      }

      // Validate branch
      const existingBranch = await prisma.branch.findFirst({
        where: { id: branch_id },
      });

      if (!existingBranch) {
        return {
          status: false,
          message: "Invalid branch ID: No matching branch found.",
        };
      }

      // Step 1: Validate all modifier IDs in all items
      const allModifierIds = items
        .flatMap((item) => item.modifiers || [])
        .filter(Boolean); // remove null/undefined

      let validModifierIds = [];
      if (allModifierIds.length > 0) {
        const foundModifiers = await prisma.modifier.findMany({
          where: { id: { in: allModifierIds } },
          select: { id: true },
        });

        validModifierIds = foundModifiers.map((m) => m.id);
        const invalidIds = allModifierIds.filter(
          (id) => !validModifierIds.includes(id)
        );

        if (invalidIds.length > 0) {
          return {
            status: false,
            message: `Invalid modifier IDs: ${invalidIds.join(", ")}`,
          };
        }
      }

      // Step 2: Create category with items (and variations if provided)
      const category = await prisma.category.create({
        data: {
          name,
          image,
          is_deal,
          branch_id,
        },
      });

      // Step 3: Create items and modifiers separately (manual loop)
      for (const item of items) {
        const createdItem = await prisma.item.create({
          data: {
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description || "",
            category_id: category.id,
            variation: item.variation?.length
              ? {
                  create: item.variation.map((v) => ({
                    name: v.name,
                    price: v.price,
                  })),
                }
              : undefined,
          },
        });

        // Link modifiers to item
        const itemModifierIds = (item.modifiers || []).filter((id) =>
          validModifierIds.includes(id)
        );

        if (itemModifierIds.length > 0) {
          await prisma.itemModifier.createMany({
            data: itemModifierIds.map((modifierId) => ({
              itemId: createdItem.id,
              modifierId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Final fetch
      const fullCategory = await prisma.category.findUnique({
        where: { id: category.id },
        include: {
          item: {
            include: {
              variation: true,
              itemModifier: {
                include: {
                  modifier: true,
                },
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "Category created successfully",
        data: fullCategory,
      };
    } catch (error) {
      console.error("Create Category Error:", error);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateCategory(req) {
    try {
      const { id, name, image, branch_id, items, is_deal } = req.body;

      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          item: { include: { variation: true, itemModifier: true } },
        },
      });

      if (!existingCategory) {
        return { status: false, message: "Category not found." };
      }

      const duplicate = await prisma.category.findFirst({
        where: { name, NOT: { id } },
      });

      if (duplicate) {
        return {
          status: false,
          message: "A category with this name already exists.",
        };
      }

      const branchExists = await prisma.branch.findUnique({
        where: { id: branch_id },
      });
      if (!branchExists) {
        return { status: false, message: "Invalid branch ID." };
      }

      // Get all unique modifier IDs
      const allModifierIds = items.flatMap((i) => i.modifiers || []);
      const dbModifiers = await prisma.modifier.findMany({
        where: { id: { in: allModifierIds } },
        select: { id: true },
      });

      const validModifierIds = dbModifiers.map((m) => m.id);
      const invalidIds = allModifierIds.filter(
        (id) => !validModifierIds.includes(id)
      );
      if (invalidIds.length) {
        return {
          status: false,
          message: `Invalid modifier IDs: ${invalidIds.join(", ")}`,
        };
      }

      // Update category
      await prisma.category.update({
        where: { id },
        data: { name, image, branch_id, is_deal },
      });

      const updatedItemIds = [];

      for (const i of items) {
        let itemId = i.id;
        let isNewItem = false;

        if (itemId) {
          const existingItem = await prisma.item.findFirst({
            where: { id: itemId, category_id: id },
          });
          if (!existingItem) {
            return {
              status: false,
              message: `Item with ID ${itemId} not found in this category.`,
            };
          }

          await prisma.item.update({
            where: { id: itemId },
            data: {
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description || "",
            },
          });
        } else {
          const newItem = await prisma.item.create({
            data: {
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description || "",
              category_id: id,
            },
          });
          itemId = newItem.id;
          isNewItem = true;
        }

        updatedItemIds.push(itemId);

        // Sync variations
        const existingVarIds = (
          await prisma.variation.findMany({ where: { itemId } })
        ).map((v) => v.id);

        const incomingVarIds = (i.variation || [])
          .filter((v) => v.id)
          .map((v) => v.id);
        const toDeleteVar = existingVarIds.filter(
          (id) => !incomingVarIds.includes(id)
        );
        if (toDeleteVar.length) {
          await prisma.variation.deleteMany({
            where: { id: { in: toDeleteVar } },
          });
        }

        for (const v of i.variation || []) {
          if (v.id && existingVarIds.includes(v.id)) {
            await prisma.variation.update({
              where: { id: v.id },
              data: { name: v.name, price: v.price },
            });
          } else {
            await prisma.variation.create({
              data: { name: v.name, price: v.price, itemId },
            });
          }
        }

        // Sync modifiers
        await prisma.itemModifier.deleteMany({ where: { itemId } });

        const incomingModIds = (i.modifiers || []).filter((id) =>
          validModifierIds.includes(id)
        );

        if (incomingModIds.length) {
          await prisma.itemModifier.createMany({
            data: incomingModIds.map((modId) => ({
              itemId,
              modifierId: modId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Delete items that were removed
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
            include: {
              variation: true,
              itemModifier: {
                include: { modifier: true },
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "Category updated successfully.",
        data: finalCategory,
      };
    } catch (error) {
      console.error("Update Category Error:", error);
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
              itemModifier: {
                include: {
                  modifier: {
                    include: {
                      modifierOption: true,
                    },
                  },
                },
              },
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
            include: {
              variation: true,
              itemModifier: {
                include: {
                  modifier: {
                    include: {
                      modifierOption: true,
                    },
                  },
                },
              },
            },
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
      const {
        name,
        price,
        image,
        description,
        category_id,
        variation = [],
        modifiers = [],
      } = req.body;

      // Check category exists
      const categoryExists = await prisma.category.findUnique({
        where: { id: category_id },
      });

      if (!categoryExists) {
        return {
          status: false,
          message: "Category does not exist",
        };
      }

      // Validate modifier IDs
      let validModifierIds = [];
      if (Array.isArray(modifiers) && modifiers.length > 0) {
        const dbModifiers = await prisma.modifier.findMany({
          where: { id: { in: modifiers } },
          select: { id: true },
        });

        validModifierIds = dbModifiers.map((m) => m.id);
        const invalidModifierIds = modifiers.filter(
          (id) => !validModifierIds.includes(id)
        );

        if (invalidModifierIds.length > 0) {
          return {
            status: false,
            message: `Invalid modifier IDs: ${invalidModifierIds.join(", ")}`,
          };
        }
      }

      // Create item with variations
      const createdItem = await prisma.item.create({
        data: {
          name,
          price,
          image,
          description,
          category_id,
          variation:
            variation.length > 0
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

      // Link modifiers (if any)
      if (validModifierIds.length > 0) {
        await prisma.itemModifier.createMany({
          data: validModifierIds.map((modifierId) => ({
            itemId: createdItem.id,
            modifierId,
          })),
          skipDuplicates: true, // in case of re-try
        });
      }

      // Fetch item again with included modifiers
      const fullItem = await prisma.item.findUnique({
        where: { id: createdItem.id },
        include: {
          variation: true,
          itemModifier: {
            include: {
              modifier: {
                include: {
                  modifierOption: true,
                },
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "Item created successfully",
        data: fullItem,
      };
    } catch (error) {
      console.error("Item creation error:", error);
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
          itemModifier: {
            include: {
              modifier: {
                select: {
                  modifierOption: true,
                },
              },
            },
          },
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
        variation = [],
        modifiers = [],
      } = req.body;

      // Check if item exists
      const existingItem = await prisma.item.findUnique({
        where: { id },
        include: {
          variation: true,
          itemModifier: true,
        },
      });

      if (!existingItem) {
        return { status: false, message: "Item not found" };
      }

      // Check if category exists
      const categoryExists = await prisma.category.findUnique({
        where: { id: category_id },
      });

      if (!categoryExists) {
        return {
          status: false,
          message: "Category does not exist",
        };
      }

      // Validate modifier IDs
      let validModifierIds = [];
      if (Array.isArray(modifiers) && modifiers.length > 0) {
        const dbModifiers = await prisma.modifier.findMany({
          where: { id: { in: modifiers } },
          select: { id: true },
        });

        validModifierIds = dbModifiers.map((m) => m.id);
        const invalidModifierIds = modifiers.filter(
          (id) => !validModifierIds.includes(id)
        );

        if (invalidModifierIds.length > 0) {
          return {
            status: false,
            message: `Invalid modifier IDs: ${invalidModifierIds.join(", ")}`,
          };
        }
      }

      // Update the item
      await prisma.item.update({
        where: { id },
        data: { name, price, image, description, category_id, status },
      });

      // ========== VARIATIONS ==========
      const existingVariationIds = existingItem.variation.map((v) => v.id);
      const incomingVariationIds = variation
        .filter((v) => v.id)
        .map((v) => v.id);

      // Delete removed variations
      const toDeleteVarIds = existingVariationIds.filter(
        (id) => !incomingVariationIds.includes(id)
      );
      if (toDeleteVarIds.length) {
        await prisma.variation.deleteMany({
          where: { id: { in: toDeleteVarIds } },
        });
      }

      // Create or update variations
      for (const v of variation) {
        if (v.id && existingVariationIds.includes(v.id)) {
          await prisma.variation.update({
            where: { id: v.id },
            data: { name: v.name, price: v.price },
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

      // ========== MODIFIERS ==========
      // Remove all existing modifier links
      await prisma.itemModifier.deleteMany({
        where: { itemId: id },
      });

      // Add new modifier links
      if (validModifierIds.length > 0) {
        await prisma.itemModifier.createMany({
          data: validModifierIds.map((modifierId) => ({
            itemId: id,
            modifierId,
          })),
          skipDuplicates: true,
        });
      }

      // Return updated item
      const updatedItem = await prisma.item.findUnique({
        where: { id },
        include: {
          variation: true,
          itemModifier: {
            include: {
              modifier: {
                include: { modifierOption: true },
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "Item updated successfully",
        data: updatedItem,
      };
    } catch (error) {
      console.error("Item update error:", error);
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

  static async updateItemDiscount(req) {
    try {
      const { id } = req.params;
      const { discount } = req.body;
      const item = await prisma.item.findUnique({
        where: { id },
      });
      if (!item) {
        return {
          status: false,
          message: "Item not found",
        };
      }
   
      const updatedItem = await prisma.item.update({
        where: { id },
        data: { discount },
      });
      return {
        status: true,
        message: "Item discount updated successfully",
        data: updatedItem,
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
