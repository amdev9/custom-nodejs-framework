const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { MongoClient } = require("mongodb");
const nconf = require("nconf");

class ServerGlobal {
  _config;
  _logger;

  static _instance;

  constructor(configPathname) {
    console.log("path", configPathname);
    this._config = nconf.argv().env().file({ file: configPathname });
    const { errorFile, combinedFile, env } = this._config.get("logger");

    const logsFolderPath = path.join(__dirname, "logs");

    if (!fs.existsSync(logsFolderPath)) {
      fs.mkdirSync(logsFolderPath, { recursive: true });
    }

    this._logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: path.join(logsFolderPath, errorFile),
          level: "error",
        }),
        new winston.transports.File({
          filename: path.join(logsFolderPath, combinedFile),
        }),
      ],
    });
    if (env !== "production") {
      this._logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      );
    }
  }

  async initMongo() {
    const { mongoUrl, dbName, collName, validatorObj } =
      this._config.get("dbConfig");
    const client = new MongoClient(mongoUrl);

    this._logger.info("initDb");
    try {
      await client.connect();
      this._logger.info("Connected successfully to server");
      const db = client.db(dbName);

      const collection = await client
        .db(dbName)
        .listCollections({}, { nameOnly: true })
        .toArray();

      if (
        collection.filter((collectionItem) => collectionItem.name === collName)
          .length
      ) {
        return db;
      } else {
        await db.createCollection(collName, validatorObj);
        return db;
      }
    } catch (e) {
      this._logger.error(`Error init database collection ${e}`);
    }
  }

  static getInstance(path) {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new ServerGlobal(path);
    return this._instance;
  }

  get config() {
    return this._config;
  }

  get logger() {
    return this._logger;
  }
}

// const initLogger = ({ errorPath, combinedPath, env }) => {
//   const logger = winston.createLogger({
//     level: "info",
//     format: winston.format.json(),
//     transports: [
//       new winston.transports.File({
//         filename: errorPath,
//         level: "error",
//       }),
//       new winston.transports.File({
//         filename: combinedPath,
//       }),
//     ],
//   });

//   if (env !== "production") {
//     logger.add(
//       new winston.transports.Console({
//         format: winston.format.simple(),
//       })
//     );
//   }

//   return logger;
// };

module.exports = ServerGlobal;
