const defaultJsonParser = (body) => {
  body = body ? JSON.parse(body) : {};

  return body;
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += "" + chunk;
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

function ContentTypeParser() {
  this.customParsers = new Map();
  this.customParsers.set("application/json", defaultJsonParser);
}

ContentTypeParser.prototype.run = async function (contentType, req) {
  console.log(contentType, this.customParsers);
  const parser = this.customParsers.get(contentType);
  let body = await readBody(req);
  return parser(body);
};

ContentTypeParser.prototype.add = function (contentType, parser) {
  const contentTypeIsString = typeof contentType === "string";
  if (!contentTypeIsString && !(contentType instanceof RegExp))
    throw new FST_ERR_CTP_INVALID_TYPE();

  console.log(this.customParsers);
  this.customParsers.set(contentType.toString(), parser);
};

module.exports = ContentTypeParser;
