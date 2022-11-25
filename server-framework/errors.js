class CustomError extends Error {
  constructor(code, message, statusCode) {
    super(code, message, statusCode);
    this.name = "CustomError";
    this.message = message;
    this.code = code;
    this.statusCode = statusCode;
  }
  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

function createError(code, message, statusCode = 500) {
  if (!code) throw new Error("error code must not be empty");
  if (!message) throw new Error("error message must not be empty");

  console.log(message)
  return new CustomError(code, message, statusCode);
}

const codes = {
  EMPTY_JSON_BODY: createError(
    "EMPTY_JSON_BODY",
    "Body cannot be empty when content-type is set to 'application/json'",
    400
  ),
  INVALID_TYPE: createError(
    "INVALID_TYPE",
    "The content type should be a string or a RegExp",
    500
  ),
  UNKNOWN_ERROR: createError("UNKNOWN_ERROR", "Unknown error", 500),
  BAD_REQUEST: createError("BAD_REQUEST", "Bad request", 400),
  UNAUTHORIZED: createError("UNAUTHORIZED", "Unauthorized", 401),
  FORBIDDEN: createError("FORBIDDEN", "Forbidden", 403),
  RESOURCE_NOT_FOUND: createError(
    "RESOURCE_NOT_FOUND",
    "Resource not found",
    404
  ),
  INTERNAL_SERVER_ERROR: createError(
    "INTERNAL_SERVER_ERROR",
    "Something went wrong, Please try again later.",
    500
  ),
  BAD_GATEWAY: createError("BAD_GATEWAY", "Bad gateway", 502),
  SERVICE_UNAVAILABLE: createError(
    "SERVICE_UNAVAILABLE",
    "Service unavailable",
    503
  ),
  GATEWAY_TIMEOUT: createError("GATEWAY_TIMEOUT", "Gateway timeout", 504),
};

module.exports = { codes, CustomError };
