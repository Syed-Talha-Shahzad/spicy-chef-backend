import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class generalService {
  static async deliveryFee(req) {
    try {
      const { branch_id, deliveryFee , serviceFee} = req.body;
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
          data: { deliveryFee, serviceFee },
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
}

export default generalService;
