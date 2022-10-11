const Admin = require('../models/admin.models');
const { passwordHash, passwordCompare } = require("../helper/hashing");
const { jwtSign } = require("../helper/jwt");
const {
  signUpValidation,
  loginValidation,
} = require("../validation/validation");
const { Services } = require("../services/services");
const cloudinary = require('../utils/cloudinary');
const ourServices = require('../models/savings.services.models')

exports.adminSignUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, role } =
      req.body;
    const validation = signUpValidation(req.body);
    if (validation.error) {
      return res
        .status(400)
        .json({ message: validation.error.details[0].message });
    }

    const hashedPassword = await passwordHash(password);

    const data = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    };
    const new_admin = await Services.signUp(data);
    return res
      .status(201)
      .json({ message: "admin added successfully", new_admin: new_admin._id });
  } catch (error) {
    return res
    .status(500)
    .json({ message: 'Email or PhoneNumber Already Exist'});
  }
};

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validation = loginValidation(req.body);
    if (validation.error)
      return res
        .status(400)
        .json({ message: validation.error.details[0].message });
    const admin = await Services.findAdminByEmail({ email });
    const isMatch = await passwordCompare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const payload = {
      id: admin._id,
    };
    const token = jwtSign(payload);
    res.cookie("access_token", token, { httpOnly: true });
    const dataInfo = {
      status: "success",
      message: "Admin Logged in successful",
      access_token: token,
    };
    return res.status(200).json(dataInfo);
  } catch (error) {
    next(error);
  }
};
exports.addServices = async (req, res, next) =>{
    try {
        const{item,amount,image,charge}= req.body;
        const result = await cloudinary.uploader.upload(req.file.path);
        const new_services = new ourServices ({
            item,
            amount,
            image: result.secure_url,
            charge,
        });
        // console.log(new_services);
const newServices = await new_services.save();
        return res.status(201).json({ newServices, message: "Service Saved by Admin"})
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Service not added" });

    }
}