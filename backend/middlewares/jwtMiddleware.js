const jwt = require("jsonwebtoken");

//middleware ensures that only requests with a valid JWT token can access protected routes
const verifyAuthToken = (req, res, next) => {
  // Extract token from cookies OR Authorization header
  let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  console.log("Received token:", token); //Log received token

  if (!token) {
    console.log("No token received!");
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token: ", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = verifyAuthToken;
