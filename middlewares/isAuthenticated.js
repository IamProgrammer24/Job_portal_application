import jwt from "jsonwebtoken";

// MIDDLEWARE TO CHECK IF THE USER IS AUTHENTICATED
const isAuthenticated = async (req, res, next) => {
  try {
    // GETTING THE TOKEN FROM COOKIES
    const token = req.cookies.token;
    if (!token) {
      // IF TOKEN IS NOT PRESENT, RETURN UNAUTHORIZED ERROR
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    // VERIFYING THE TOKEN USING THE SECRET KEY
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      // IF TOKEN IS INVALID, RETURN ERROR
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    // ATTACHING THE DECODED USER DATA TO THE REQUEST OBJECT
    req.user = decode;

    // PROCEED TO NEXT MIDDLEWARE OR ROUTE HANDLER
    next();
  } catch (error) {
    // LOGGING ANY ERROR THAT OCCURS DURING AUTHENTICATION
    console.log(error);
  }
};

export default isAuthenticated;
