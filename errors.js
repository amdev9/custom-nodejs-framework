function createError(code, message, statusCode = 500) {
  if (!code) throw new Error("error code must not be empty");
  if (!message) throw new Error("error message must not be empty");

  class CustomError extends Error {
    constructor() {
      this.name = "CustomError";
      this.message = message;
      this.code = code;
      this.statusCode = statusCode;
    }
    toString = function () {
      return `${this.name} [${this.code}]: ${this.message}`;
    };
  }

  return CustomError;
}

const codes = {
  /**
   * Basic
   */
  FST_ERR_NOT_FOUND: createError("FST_ERR_NOT_FOUND", "Not Found", 404),
  FST_ERR_CTP_EMPTY_JSON_BODY: createError(
    "FST_ERR_CTP_EMPTY_JSON_BODY",
    "Body cannot be empty when content-type is set to 'application/json'",
    400
  ),
  FST_ERR_CTP_INVALID_TYPE: createError(
    "FST_ERR_CTP_INVALID_TYPE",
    "FST_ERR_CTP_INVALID_TYPE",
    "The content type should be a string or a RegExp",
    500,
    TypeError
  ),
};

module.exports = codes;
