const defaultJsonParser = (body) => {
  // FST_ERR_CTP_EMPTY_JSON_BODY

  body = body ? JSON.parse(body) : {};
  return body;
};

module.exports = { defaultJsonParser };
