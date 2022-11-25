const fs = require("fs");
const path = require("path");

const { server, initConfLog, codes } = require("server-framework");

const protectedMiddleware = require("./middlewares/protectedMiddleware");
const productRoutes = require("./routes/products");
const { defaultJsonParser } = require("./utils");

const configPath = path.join(__dirname, "configs", "config.json");
const logsFolderPath = path.join(__dirname, "logs");

const start = async () => {

  const { logger, config } = initConfLog(configPath, logsFolderPath);
  const appPort = config.get("appPort");

  const app = server();
  app.addContentTypeParser("application/json", defaultJsonParser);

  const router = app.Router;

  productRoutes(router);

  // static
  router.get("/photos/:file", function (req, res) {
    const file = req.params.file;
    const pth = path.join(__dirname, "uploads", file + ".jpeg");

    logger.info(pth);
    if (fs.existsSync(pth)) {
      res.sendFile(pth);
    } else {
      throw codes.FORBIDDEN;
    }
  });

  // middleware example
  router.get("/protected", protectedMiddleware, (req, res) => {
    res.end("protected route");
  });

  app.listen(appPort, () => {
    logger.info(`listening on port ${appPort}`);
  });
};

start();
