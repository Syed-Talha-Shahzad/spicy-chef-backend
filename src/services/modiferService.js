import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class modifierService {
  static async createModifier(req) {
    try {
      const modifiers = req.body;

      const createdModifiers = [];

      for (const mod of modifiers) {
        const { name, branch_id, modifierOptions } = mod;

        const branchExists = await prisma.branch.findUnique({
          where: { id: branch_id },
        });

        if (!branchExists) {
          return {
            status: false,
            message: `Branch with ID ${branch_id} does not exist.`,
          };
        }

        const createdModifier = await prisma.modifier.create({
          data: {
            name,
            branch_id,
            modifierOption: {
              create: modifierOptions.map((opt) => ({
                name: opt.name,
                price: opt.price,
              })),
            },
          },
          include: {
            modifierOption: true,
          },
        });

        createdModifiers.push(createdModifier);
      }

      return {
        status: true,
        message: "Modifiers created successfully",
        data: createdModifiers,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async modifierListing(req) {
    try {
      const { branch_id } = req.query;

      const branchExists = await prisma.branch.findUnique({
        where: { id: branch_id },
      });

      if (!branchExists) {
        return {
          status: false,
          message: `Branch with ID ${branch_id} does not exist.`,
        };
      }

      const modifiers = await prisma.modifier.findMany({
        where: { branch_id },
        include: {
          modifierOption: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        status: true,
        message: "Modifiers fetched successfully",
        data: modifiers,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateModifier(req) {
    try {
      const { id } = req.params;
      const { name, modifierOptions } = req.body;
  
      const existingModifier = await prisma.modifier.findUnique({
        where: { id },
        include: { modifierOption: true },
      });
  
      if (!existingModifier) {
        return {
          status: false,
          message: "Modifier not found",
        };
      }
  
      // 1. Update modifier name
      await prisma.modifier.update({
        where: { id },
        data: { name },
      });
  
      const existingOptionIds = existingModifier.modifierOption.map((opt) => opt.id);
      const incomingOptionIds = modifierOptions.filter(opt => opt.id).map(opt => opt.id);
  
      // 2. Delete removed options
      const toDelete = existingOptionIds.filter(existingId => !incomingOptionIds.includes(existingId));
      if (toDelete.length > 0) {
        await prisma.modifierOption.deleteMany({
          where: {
            id: { in: toDelete },
          },
        });
      }
  
      // 3. Loop through incoming options
      for (const option of modifierOptions) {
        if (option.id && existingOptionIds.includes(option.id)) {
          // Update existing
          await prisma.modifierOption.update({
            where: { id: option.id },
            data: {
              name: option.name,
              price: option.price,
            },
          });
        } else {
          // Create new
          await prisma.modifierOption.create({
            data: {
              name: option.name,
              price: option.price,
              modifierId: id,
            },
          });
        }
      }
  
      // 4. Fetch and return the updated modifier with options
      const result = await prisma.modifier.findUnique({
        where: { id },
        include: { modifierOption: true },
      });
  
      return {
        status: true,
        message: "Modifier updated successfully",
        data: result,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async modifierDetails(req) {
    try {
      const { id } = req.params;
  
      const modifier = await prisma.modifier.findUnique({
        where: { id },
        include: { modifierOption: true },
      });
  
      if (!modifier) {
        return {
          status: false,
          message: "Modifier not found",
        };
      }
  
      return {
        status: true,
        message: "Modifier details fetched successfully",
        data: modifier,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async deleteModifier(req) {
    try {
      const { id } = req.params;
  
      const modifier = await prisma.modifier.findUnique({
        where: { id },
      });
  
      if (!modifier) {
        return {
          status: false,
          message: "Modifier not found",
        };
      }
  
      await prisma.modifier.delete({
        where: { id },
      });
  
      return {
        status: true,
        message: "Modifier deleted successfully",
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }
  
}

export default modifierService;
