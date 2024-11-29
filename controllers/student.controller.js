// IMPORTING MODEL
import { Student } from "../models/student.model.js";

// IMPORTING MODULES
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER NEW STUDENT
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;

    // VALIDATION : CHECK IF ANY REQUIRED FIELD IS MISSING
    if (!fullname || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // CHECK IF A STUDENT ALREADY EXISTS WITH THE PROVIDED EMAIL
    const student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({
        message: "User already exist with this email.",
        success: false,
      });
    }

    // HASH THE PASSWORD BEFORE SAVING IT IN THE DATABSE
    const hashedPassword = await bcrypt.hash(password, 10); // 10 IS THE SALT ROUND

    // CREATE A NEW STUDENT IN A DATABSE
    await Student.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword, // STORE HASH PASSWORD INSTEAD OF PLAIN
      role: "student",
    });

    // RETURN THE SUCCESS RESPONSE ONCE THE DATA STORED
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    // CATCH ANY ERRORS AND LOG THEM FOR DEBUGGING
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// STUDENT LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATION : CHECK IF ANY REQUIRED FIELD IS MISSING
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // CHECK IF THE STUDENT EXISTS WITH THE PROVIDED EMAIL
    let student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    // COMPARE THE PROVIDED PASSWORD WITH THE STORED HASHED PASSWORD
    const isPasswordMatch = await bcrypt.compare(password, student.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    // CREATE JWT TOKEN TO MAINTAIN THE SESSION
    const tokenData = {
      // STORE USER ID AND ROLE FOR AUTHENTICATION AND AUTHORIZATION
      userId: student._id,
      role: student.role,
    };
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d", // TOKEN EXPIRE DURATION
    });

    // RETURN STUDENT DATA (EXCLUDING PASSWORD) ALONG WITH THE TOKEN
    student = {
      _id: student._id,
      fullname: student.fullname,
      email: student.email,
      phoneNumber: student.phoneNumber,
      role: student.role,
      profile: student.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // TOKEN EXPIRE DURATION
        httpOnly: true, // ENSURE THE TOKEN IS NOT ACCESSIBLE BY JAVASCRIPT (FOR SECURITY).
        sameSite: "strict", // PREVENT CROSS-SITE REQUEST FORGERY (CSRF).
      })
      .json({
        message: `Welcome back ${student.fullname}`,
        student, // RETURN THE STUDENT DETAILS (EXCLUDING PASSWORD)
        success: true,
      });
  } catch (error) {
    // CATCH ANY ERRORS AND LOG THEM FOR DEBUGGING
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// STUDENT LOGOUT
export const logout = async (req, res) => {
  try {
    // CLEAR THE COOKIE THAT STORES THE TOKEN
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    // CATCH ANY ERRORS AND LOG THEM FOR DEBUGGING
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// UPDATE STUDENT PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const resume = req.file.path;
    const studentId = req.user.userId; // EXTRACT STUDENT ID FROM AUTHENTICATION MIDDLEWARE
    let student = await Student.findById(studentId);

    // IF STUDENT NOT FOUND, RETURN AN ERROR RESPONSE
    if (!student) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    // UPDATE THE STUDENT'S PROFILE DATA
    if (fullname) student.fullname = fullname;
    if (email) student.email = email;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (bio) student.profile.bio = bio;
    if (skills) student.profile.skills = skills;
    if (resume) student.profile.resume = resume;

    // SAVE THE UPDATED STUDENT DATA TO THE DATABASE
    const newStudent = await student.save();

    // RETURN THE UPDATED STUDENT PROFILE
    return res.status(200).json({
      message: "Profile updated successfully.",
      newStudent, // Return the updated student details
      success: true,
    });
  } catch (error) {
    // CATCH ANY ERRORS AND LOG THEM FOR DEBUGGING
    console.log(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};
