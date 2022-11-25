const path = require("path");
const { ObjectId } = require("mongodb");
const { initConfLog, initMongoDb, codes } = require("server-framework");

const configPath = path.join(__dirname, "configs", "config.json");

const getId = async (req, res) => {
  //  /products/1, req.params has value  { id: '1' }
  try {
    const { logger, config } = initConfLog(configPath);
    const collName = config.get("dbConfig").collName;

    const db = await initMongoDb();
    
    const dbResponse = await db
      .collection(collName)
      .findOne({ _id: new ObjectId(req.params.id) });
    logger.info("res", dbResponse);

    res.json(dbResponse);
  } catch (e) {
    console.log(e);

    throw codes.INTERNAL_SERVER_ERROR;
  }
};

const getAll = (req, res) => {
  // /products?page=1&pageSize=10 =>  { page: '1', pageSize: '10' }

  const { logger } = initConfLog(configPath);
  const params = JSON.stringify(req.query);
  logger.info(params);
  res.send(params);
};

const create = async (req, res) => {
  const { logger, config } = initConfLog(configPath);
  const collName = config.get("dbConfig").collName;

  const db = await initMongoDb();

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
};

module.exports = { getId, getAll, create };
