import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class authService {
  static async signIn(req) {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return {
            status: false,
            message: "Invalid credentials. Please enter valid credentials",
          };
        }

        if (!user.status) {
          return {
            status: false,
            message: "Oops! Your account is blocked by admin.",
          };
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "2d",
        });

        return {
          status: true,
          data: {
            token: token,
            user: user,
          },
        };
      } else {
        return {
          status: false,
          message: "Invalid credentials. Please enter valid credentials",
        };
      }
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async signUp(req) {
    try {
      const { firstName, lastName, email, password, phoneNo } = req.body;
      const emailExists = await prisma.user.findFirst({
        where: { email },
      });

      if (emailExists) {
        return {
          status: false,
          message: "Email already exists",
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashPassword,
          phoneNo,
        },
      });

      return {
        status: true,
        message: "User registered successfully",
        data: user,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async profile(req) {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return {
          status: false,
          message: "User not found",
        };
      }
      return {
        status: true,
        data: user,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }
}

export default authService;
