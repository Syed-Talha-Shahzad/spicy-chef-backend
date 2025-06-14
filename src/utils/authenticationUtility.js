const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { promisify } = require("util");
const Users = require("../db/models/user.model.js");

dotenv.config();

const generateAuthToken = async (payload, expiresIn = "7d") => {
  return jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn });
};

const authenticate = async (req, res, next) => {
  // 1) Getting token and check of it's there
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res
        .status(403)
        .json({ status: false, message: "Token not found" });
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.payload?.user?.id; // Access the id within the user object
    // 3) Check if user still exists
    const currentUser = await Users.findByPk(userId);
    if (!currentUser) {
      return res.status(403).json({ status: false, message: "User not found" });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    if (err.message === "jwt expired") {
      return res.status(401).json({ status: false, message: "Token expired" });
    }
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

const isValidToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return false;
    } else {
      return true;
    }
  });
};

const destroyToken = async (token) => {
  if (!token) {
    return false;
  } else {
    const destroy = jwt.destroy(token);
    console.log("destroying...", destroy);
  }
};

const getAuthenticateId = async (req) => {
  let token = req.headers["authorization"];
  const decoded = jwt_decode(token);
  let id = decoded.payload.id;
  return id;
};

module.exports = {
  authenticate,
  destroyToken,
  generateAuthToken,
  getAuthenticateId,
  isValidToken,
};
