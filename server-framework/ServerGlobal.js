const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { MongoClient } = require("mongodb");
const nconf = require("nconf");

class ServerGlobal {
  _config;
  _logger;
  _dbConnection;

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
    const { mongoUrl, dbName } = this._config.get("dbConfig");
    const client = new MongoClient(mongoUrl);

    this._logger.info("initDb");
    try {
      await client.connect();
      this._logger.info("Connected successfully to server");
      this._dbConnection = client.db(dbName);
    } catch (e) {
      this._logger.error(`Error init database collection ${e}`);
    }
  }

  async getDbWithCollectionInit() {
    const { collName, validatorObj } = this._config.get("dbConfig");

    try {
      const collection = await this._dbConnection
        .listCollections({}, { nameOnly: true })
        .toArray();

      if (
        collection.filter((collectionItem) => collectionItem.name === collName)
          .length
      ) {
        return this._dbConnection;
      } else {
        await this._dbConnection.createCollection(collName, validatorObj);
        return this._dbConnection;
      }
    } catch (e) {
      this._logger.error(`Error collection create ${e}`);
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

  get db() {
    return this._dbConnection;
  }
}

module.exports = ServerGlobal;
