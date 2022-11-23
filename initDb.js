const config = require("./config");
const logger = require("./logger");
const { MongoClient } = require("mongodb");

const mongoUrl = config.get("mongoUrl");
const dbName = config.get("dbName");
const collName = config.get("collName");

const client = new MongoClient(mongoUrl);

const validatorObj = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Object Validation",
      required: ["login"],
      properties: {
        login: {
          bsonType: "string",
          description: "must be a string and required",
        },
        password: {
          bsonType: "string",
          description: "must be a string",
        },
      },
    },
  },
  validationAction: "error",
};

async function initDb() {
  logger.info("initDb");
  try {
    await client.connect();
    logger.info("Connected successfully to server");
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
    logger.error(`Error init database ${e}`);
  }
}

module.exports = initDb;
