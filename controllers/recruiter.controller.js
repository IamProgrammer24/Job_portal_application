// IMPORTING MODULES
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// IMPORTING MODEL
import Recruiter from "../models/recruiter.model.js";

// REGISTER A NEW RECRUITER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // VALIDATION: CHECK IF REQUIRED FIELDS ARE MISSING
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // CHECK IF RECRUITER ALREADY EXISTS WITH THE PROVIDED EMAIL
    const recruiter = await Recruiter.findOne({ email });
    if (recruiter) {
      return res.status(400).json({
        message: "User already exists with this email.",
        success: false,
      });
    }

    // HASH THE PASSWORD BEFORE STORING IT IN THE DATABASE
    const hashedPassword = await bcrypt.hash(password, 10); // 10 IS THE SALT ROUND

    // CREATE A NEW RECRUITER IN THE DATABASE
    await Recruiter.create({
      name,
      email,
      password: hashedPassword,
      companyName: "",
      role: "recruiter",
    });

    // RETURN SUCCESS MESSAGE ONCE THE ACCOUNT IS CREATED
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// RECRUITER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATION: ENSURE BOTH EMAIL AND PASSWORD ARE PROVIDED
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // FIND RECRUITER BY EMAIL
    let recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    // COMPARE THE PROVIDED PASSWORD WITH THE HASHED PASSWORD STORED IN DB
    const isPasswordMatch = await bcrypt.compare(password, recruiter.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    // CREATE TOKEN PAYLOAD CONTAINING RECRUITER ID AND ROLE
    const tokenData = {
      // STORE RECRUITER ID AND ROLE FOR AUTHENTICATION AND AUTHORIZATION
      userId: recruiter._id,
      role: recruiter.role,
    };

    // GENERATE JWT TOKEN WITH 1 DAY EXPIRATION
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // CREATE A RESPONSE OBJECT EXCLUDING SENSITIVE INFORMATION (PASSWORD)
    recruiter = {
      _id: recruiter._id,
      name: recruiter.name,
      companyName: recruiter.companyName,
      jobsPosted: recruiter.jobsPosted,
    };

    // SEND RESPONSE WITH COOKIE STORING THE JWT TOKEN
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true, // SECURE THE COOKIE BY MAKING IT INACCESSIBLE TO JS
        sameSite: "strict", // SECURE COOKIE HANDLING
      })
      .json({
        message: `Welcome back ${recruiter.name}`,
        recruiter,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// LOGOUT RECRUITER (CLEAR TOKEN COOKIE)
export const logout = async (req, res) => {
  try {
    // CLEAR THE AUTHENTICATION TOKEN COOKIE
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// UPDATE RECRUITER PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const recruiterId = req.user.userId; // EXTRACT RECRUITER ID FROM THE JWT (AUTHENTICATION MIDDLEWARE)

    // CHECK IF THE RECRUITER EXISTS BY ID
    let recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    // UPDATE RECRUITER FIELDS IF THEY ARE PROVIDED IN THE REQUEST BODY
    if (name) recruiter.name = name;
    if (email) recruiter.email = email;

    // SAVE THE UPDATED RECRUITER TO THE DATABASE
    await recruiter.save();

    // RETURN THE UPDATED RECRUITER DETAILS
    return res.status(200).json({
      message: "Profile updated successfully.",
      recruiter,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};
