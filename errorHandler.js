const logger = require("./logger");
const { CustomError } = require("./errors");

function errorHandler(err, req, res, next) {
  if (err instanceof CustomError) {
    logger.error(err.toString());
    res.statusCode = err.statusCode;
    return res.send(err.message);
  }

  logger.log({
    private: true,
    level: 'error',
    message: `unknown error ${err}`
  });
  res.statusCode = 500;
  return res.send("Oops unknown error");
}

module.exports = errorHandler;
