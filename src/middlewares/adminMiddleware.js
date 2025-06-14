import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { USER_ROLE } from "../constants/index.js";

const checkAdmin = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findFirst({
        where: { id: id },
      });

      if (!req.user) {
        return res.status(401).send({ message: "Token is not valid" });
      }

      if (req?.user?.status == false) {
        return res
          .status(403)
          .send({ message: "Access denied. Your account is blocked." });
      }
      
      if (req?.user?.role != USER_ROLE.SUPER_ADMIN) {
        return res.status(403).send({ message: "Access denied" });
      }
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .send({ message: "Token has expired", error: error.message });
      } else {
        return res
          .status(401)
          .send({ message: "Token is not valid", error: error.message });
      }
    }
  }

  if (!token) {
    return res
      .status(401)
      .send({ message: "No token provided, authorization denied" });
  }
};

export default checkAdmin;
