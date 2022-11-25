const { codes } = require("server-framework");

const protectedMiddleware = (req, res, next) => {
  if (req.headers["authorization"] === "a123") {
    next();
  } else {
    throw codes.UNAUTHORIZED;
  }
};

module.exports = protectedMiddleware;
