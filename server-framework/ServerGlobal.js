const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { MongoClient } = require("mongodb");
const nconf = require("nconf");

class ServerGlobal {
  _config;
  _logger;

  static _instance;

  constructor(configPathname, logsFolderPath) {
    console.log("path", configPathname);
    this._config = nconf.argv().env().file({ file: configPathname });
    const { errorFile, combinedFile, env } = this._config.get("logger");

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

  static getInstance(path, logsPath) {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new ServerGlobal(path, logsPath);
    return this._instance;
  }

  get config() {
    return this._config;
  }

  get logger() {
    return this._logger;
  }
}


module.exports = ServerGlobal;
