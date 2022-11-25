const { codes, CustomError } = require("./errors");
const ServerGlobal = require("./ServerGlobal");

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

class ContentTypeParser {
  constructor() {
    this.customParsers = new Map();
    this.logger = ServerGlobal.getInstance().logger;
    // this.customParsers.set("application/json", defaultJsonParser);
  }

  async run(contentType, req) {
    try {
      this.logger.info(`run ${contentType} parser`);
      const parser = this.customParsers.get(contentType);

      let body = await readBody(req);

      return parser(body);
    } catch (e) {
      if (e instanceof CustomError) {
        throw e;
      }
      throw codes.BAD_REQUEST;
    }
  }

  add(contentType, parser) {
    const contentTypeIsString = typeof contentType === "string";
    if (!contentTypeIsString && !(contentType instanceof RegExp))
      throw codes.INVALID_TYPE;

    this.customParsers.set(contentType.toString(), parser);
    this.logger.info([...this.customParsers.entries()]);
  }
}

module.exports = ContentTypeParser;
