import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class branchService {
  static async createbranch(req) {
    try {
      const { name, address, startTime, endTime } = req.body;
      const branchExists = await prisma.branch.findFirst({ where: { name } });

      if (branchExists) {
        return {
          status: false,
          message: "Branch already exists",
        };
      }
      const branch = await prisma.branch.create({ data: { name, address, startTime, endTime } });
      await prisma.setting.create({
        data: {
          branch_id: branch.id,
        },
      });

      return {
        status: true,
        data: branch,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async listBranches() {
    try {
      const branches = await prisma.branch.findMany();

      return {
        status: true,
        data: branches,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateBranch(req) {
    try {
      const { id } = req.params;
      const {name, address, startTime, endTime } = req.body;

      const branch = await prisma.branch.findUnique({ where: { id } });

      if (!branch) {
        return {
          status: false,
          message: "Branch not found",
        };
      }

      const updatedBranch = await prisma.branch.update({
        where: { id },
        data: { name, address, startTime, endTime  },
      });

      return {
        status: true,
        data: updatedBranch,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async deleteBranch(req) {
    try {
      const { id } = req.params;

      const branch = await prisma.branch.findUnique({ where: { id } });

      if (!branch) {
        return {
          status: false,
          message: "Branch not found",
        };
      }

      await prisma.branch.delete({ where: { id } });

      return {
        status: true,
        message: "Branch deleted successfully",
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }
}

export default branchService;
