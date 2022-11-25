const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

// TODO: fix to npm dependency

const {
  server,
  initConfLog,
  initMongoDb,
  codes
} = require("server-framework");


const configPath = path.join(__dirname, "config.json");

// path.join(__dirname, "logs", "error.log");

// TODO: https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/
// https://github.com/geshan/expressjs-structure

const defaultJsonParser = (body) => {
  // FST_ERR_CTP_EMPTY_JSON_BODY

  body = body ? JSON.parse(body) : {};
  return body;
};

const start = async () => {
 
  const { logger, config } = initConfLog(configPath);
  const dbConfig = config.get("dbConfig");
  const appPort = config.get("appPort");
  const collName = dbConfig.collName;
  const db = await initMongoDb();
  const app = server();

  app.addContentTypeParser("application/json", defaultJsonParser);

  app.get("/products/:id", async (req, res) => {
    //  /products/1, req.params has value  { id: '1' }
    try {
      const dbResponse = await db
        .collection(collName)
        .findOne({ _id: new ObjectId(req.params.id) });
      logger.info("res", dbResponse);

      res.json(dbResponse);
    } catch (e) {
      console.log(e);

      throw codes.INTERNAL_SERVER_ERROR;
    }
  });

  app.get("/products/", (req, res) => {
    // /products?page=1&pageSize=10 =>  { page: '1', pageSize: '10' }
    logger.info(req.query);
    res.send(JSON.stringify(req.query));
  });

  app.post("/products/", async (req, res) => {
    const data = req.body;
    logger.info("data", data);
    try {
      const dbResponse = await db.collection(collName).insertOne(data);

      logger.info(`dbResponse insertOne: ${dbResponse.insertedId.toString()}`);
      res.send(dbResponse.insertedId.toString());
    } catch (e) {
      console.log(e);
      throw codes.INTERNAL_SERVER_ERROR;
    }
  });

  app.get("/photos/:file", function (req, res) {
    // static
    const file = req.params.file;
    const pth = path.join(__dirname, "uploads", file + ".jpeg");

    logger.info(pth);
    if (fs.existsSync(pth)) {
      res.sendFile(pth);
    } else {
      throw codes.FORBIDDEN;
    }
  });

  const protectedMiddleware = (req, res, next) => {
    if (req.headers["authorization"] === "a123") {
      next();
    } else {
      throw codes.UNAUTHORIZED;
    }
  };

  app.get("/protected", protectedMiddleware, (req, res) => {
    res.end("protected route");
  });

  app.listen(appPort, () => {
    logger.info(`listening on port ${appPort}`);
  });
};

start();
