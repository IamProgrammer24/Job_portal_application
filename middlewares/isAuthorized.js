import jwt from "jsonwebtoken";

// MIDDLEWARE TO CHECK IF THE USER HAS THE REQUIRED ROLE
const isAuthorized = (allowedRoles) => {
  return (req, res, next) => {
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
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      if (!decode) {
        // IF TOKEN IS INVALID, RETURN ERROR
        return res.status(401).json({
          message: "Invalid token",
          success: false,
        });
      }

      // EXTRACTING THE ROLE FROM THE DECODED TOKEN
      const role = decode.role;

      // CHECKING IF THE USER'S ROLE IS IN THE ALLOWED ROLES
      if (!allowedRoles.includes(role)) {
        // IF THE ROLE IS NOT ALLOWED, RETURN ACCESS DENIED ERROR
        return res
          .status(403)
          .json({ message: "Access denied. You do not have the right role." });
      }

      // IF THE USER IS AUTHORIZED, CONTINUE TO THE NEXT MIDDLEWARE
      next();
    } catch (error) {
      // LOGGING ANY ERROR THAT OCCURS DURING AUTHORIZATION
      console.log(error);
    }
  };
};

export default isAuthorized;
