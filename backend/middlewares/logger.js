//logs API requests to help with debugging
const logger = (req, res, next) => {
  console.log(
    `${req.method} request to ${req.url} at ${new Date().toISOString()}`
  );
  next();
};

module.exports = logger;
