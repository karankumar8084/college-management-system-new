const adminDetails = require("../../models/details/admin-details.model");
const resetToken = require("../../models/reset-password.model");
const bcrypt = require("bcryptjs");
const ApiResponse = require("../../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const sendResetMail = require("../../utils/SendMail");

const loginAdminController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await adminDetails.findOne({ email });

    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return ApiResponse.unauthorized("Invalid password").send(res);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return ApiResponse.success({ token }, "Login successful").send(res);
  } catch (error) {
    console.error("Login Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getAllDetailsController = async (req, res, next) => {
  try {
    const users = await adminDetails.find().select("-__v -password");

    if (!users || users.length === 0) {
      return ApiResponse.notFound("No Admin Found").send(res);
    }

    return ApiResponse.success(users, "Admin Details Found!").send(res);
  } catch (error) {
    console.error("Get Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const generateEmployeeId = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const registerAdminController = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    const profile = req.file.filename;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    if (!/^\d{10}$/.test(phone)) {
      return ApiResponse.badRequest("Phone number must be 10 digits").send(res);
    }

    const existingAdmin = await adminDetails.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingAdmin) {
      return ApiResponse.conflict(
        "Admin with these details already exists"
      ).send(res);
    }

    const employeeId = generateEmployeeId();

    // FIXED PASSWORD HASH
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const user = await adminDetails.create({
      ...req.body,
      employeeId,
      profile,
      password: hashedPassword,
    });

    const sanitizedUser = await adminDetails
      .findById(user._id)
      .select("-__v -password");

    return ApiResponse.created(sanitizedUser, "Admin Details Added!").send(res);
  } catch (error) {
    console.error("Add Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  loginAdminController,
  getAllDetailsController,
  registerAdminController,
};