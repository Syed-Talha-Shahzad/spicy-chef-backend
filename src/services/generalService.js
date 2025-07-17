import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class generalService {
  static async deliveryFee(req) {
    try {
      const { branch_id, deliveryFee, serviceFee, deliveryTime, discount } =
        req.body;
      const branch = await prisma.branch.findUnique({
        where: { id: branch_id },
      });
      if (!branch) {
        return {
          status: false,
          message: "Branch not found",
        };
      }

      const setting = await prisma.setting.findFirst({
        where: { branch_id },
      });

      if (setting) {
        const updatedSetting = await prisma.setting.update({
          where: { id: setting.id },
          data: { deliveryFee, serviceFee, deliveryTime, discount },
        });
        return {
          status: true,
          message: "Delivery fee updated successfully",
          data: {
            setting: updatedSetting,
          },
        };
      } else {
        const newSetting = await prisma.setting.create({
          data: {
            deliveryFee: deliveryFee,
            serviceFee: serviceFee,
            deliveryTime: deliveryTime,
            branch_id: branch_id,
          },
        });
        return {
          status: true,
          message: "Delivery fee created successfully",
          data: {
            setting: newSetting,
          },
        };
      }
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async getSetting(req) {
    try {
      const branch_id = req.params.id;
      const setting = await prisma.setting.findFirst({
        where: { branch_id },
      });
      if (!setting) {
        return {
          status: false,
          message: "Setting not found",
        };
      }
      return {
        status: true,
        message: "Setting retrieved successfully",
        data: {
          setting: setting,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async createOrUpdateBranchTimings(req) {
    const { branchId, timings } = req.body;

    try {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        return {
          status: false,
          message: "Branch not found",
        };
      }
      // Step 1: Delete existing timings for this branch
      await prisma.branchTiming.deleteMany({
        where: { branchId },
      });

      // Step 2: Create new timings
      const result = await prisma.branchTiming.createMany({
        data: timings.map((t) => ({
          branchId,
          day: t.day,
          openTime: t.openTime,
          closeTime: t.closeTime,
        })),
      });

      return {
        status: true,
        message: "Timings updated successfully",
        count: result,
      };
    } catch (error) {
      console.error("Error saving timings:", error);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async getBranchTimings (req){
    const { id } = req.params;
  
    try {

     const branch = await prisma.branch.findUnique({
        where: { id },
      });
      if (!branch) {
        return {
          status: false,
          message: "Branch not found",
        };
      }
      
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let  timings = await prisma.branchTiming.findMany({
        where: { branchId: id },
        select:{
          day: true,
          openTime: true,
          closeTime: true,
        },
        orderBy: {
          day: 'asc',
        },
      });

      const sortedTimings = timings.sort(
        (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
      );
  
      return {
        status: true,
        message: 'Timings retrieved successfully',
        data: sortedTimings,
      };
    }catch (error) {
      console.error('Error fetching timings:', error);
      return {
        status: false,
        message: error.message,
      }
    }
  };
}

export default generalService;
