import { Company } from "../models/company.model.js";
import Recruiter from "../models/recruiter.model.js";

// REGISTER A NEW COMPANY
export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;

    // CHECK IF THE COMPANY NAME IS PROVIDED
    if (!companyName) {
      return res.status(400).json({
        message: "COMPANY NAME IS REQUIRED.",
        success: false,
      });
    }

    // CHECK IF THE COMPANY ALREADY EXISTS
    let company = await Company.findOne({
      name: { $regex: new RegExp("^" + companyName + "$", "i") },
    });
    if (company) {
      return res.status(400).json({
        message: "YOU CAN'T REGISTER THE SAME COMPANY.", // AVOID DUPLICATE COMPANY REGISTRATION
        success: false,
      });
    }

    // CREATE A NEW COMPANY IN THE DATABASE
    company = await Company.create({
      name: companyName,
      userId: req.user.userId, // ASSOCIATE THE COMPANY WITH THE LOGGED-IN USER
    });

    // UPDATE THE RECRUITER’S COMPANY NAME FIELD
    await Recruiter.findByIdAndUpdate(
      req.user.userId, // FIND THE RECRUITER BY THEIR ID
      { companyName: company.name }, // UPDATE THE RECRUITER’S companyName FIELD WITH THE COMPANY NAME
      { new: true } // RETURN THE UPDATED DOCUMENT INSTEAD OF THE ORIGINAL
    );

    // RETURN SUCCESS RESPONSE WITH THE COMPANY DETAILS
    return res.status(201).json({
      message: "COMPANY REGISTERED SUCCESSFULLY.",
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SERVER ERROR. PLEASE TRY AGAIN LATER.",
      success: false,
    });
  }
};

// GET ALL COMPANIES ASSOCIATED WITH THE LOGGED-IN USER
export const getCompany = async (req, res) => {
  try {
    const userId = req.user.userId; // LOGGED-IN USER ID
    const companies = await Company.find({ userId });

    // CHECK IF COMPANIES EXIST FOR THE USER
    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "NO COMPANIES FOUND FOR THIS USER.", // NO COMPANIES FOUND FOR THE USER
        success: false,
      });
    }

    // RETURN LIST OF COMPANIES
    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SERVER ERROR. PLEASE TRY AGAIN LATER.",
      success: false,
    });
  }
};

// GET A COMPANY BY ITS ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id; // EXTRACT COMPANY ID FROM THE REQUEST PARAMETERS
    const company = await Company.findById(companyId);

    // CHECK IF THE COMPANY EXISTS
    if (!company) {
      return res.status(404).json({
        message: "COMPANY NOT FOUND.",
        success: false,
      });
    }

    // RETURN THE COMPANY DETAILS
    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SERVER ERROR. PLEASE TRY AGAIN LATER.", // HANDLE SERVER ERRORS
      success: false,
    });
  }
};

// UPDATE A COMPANY'S DETAILS
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const logo = req.file.path;

    // PREPARE THE UPDATED COMPANY DATA
    const updateData = { name, description, website, location, logo };

    // FIND THE COMPANY BY ID AND UPDATE ITS DETAILS
    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    // CHECK IF THE COMPANY WAS FOUND AND UPDATED
    if (!company) {
      return res.status(404).json({
        message: "COMPANY NOT FOUND.", // COMPANY NOT FOUND ERROR
        success: false,
      });
    }

    // RETURN SUCCESS MESSAGE
    return res.status(200).json({
      message: "COMPANY INFORMATION UPDATED.", // SUCCESS MESSAGE
      company, // RETURN THE UPDATED COMPANY DATA
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SERVER ERROR. PLEASE TRY AGAIN LATER.",
      success: false,
    });
  }
};

// DELETE OPERATION FOR COMPANY
export const deleteCompany = async (req, res) => {
  try {
    // ATTEMPT TO FIND AND DELETE THE COMPANY BY ITS ID
    const response = await Company.findByIdAndDelete(req.params.id);

    // IF THE COMPANY WAS NOT FOUND OR DELETED
    if (!response) {
      return res.status(404).json({
        message: "COMPANY NOT FOUND OR ALREADY DELETED.",
      });
    }

    // IF THE COMPANY IS FOUND AND DELETED
    return res.status(200).json({
      message: "COMPANY DELETED SUCCESSFULLY.",
    });
  } catch (error) {
    // HANDLE UNEXPECTED ERRORS
    return res.status(500).json({
      message: "AN ERROR OCCURRED WHILE TRYING TO DELETE THE COMPANY.",
      error: error.message,
    });
  }
};
