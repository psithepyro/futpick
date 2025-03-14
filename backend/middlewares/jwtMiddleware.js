const jwt = require("jsonwebtoken");

//middleware ensures that only requests with a valid JWT token can access protected routes
const verifyAuthToken = (req, res, next) => {
  // Extract token from cookies OR Authorization header
  let token =
    req.cookies.token ||
    (req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null);

  console.log("Received token:", token); //Log received token

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded token", decoded);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
  }

  //allow google OAuth session users
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log("Google OAuth user authenticated:", req.user);
    return next();
  }

  console.log("No token received and user is not authenticated!");
  return res
    .status(403)
    .json({ message: "Token is missing or user not authenticated" });
};

module.exports = verifyAuthToken;
