const { codes } = require("server-framework");

const defaultJsonParser = (body) => {
  if (body) {
    body = JSON.parse(body);
  } else {
    throw codes.EMPTY_JSON_BODY;
  }
  return body;
};

module.exports = { defaultJsonParser };
