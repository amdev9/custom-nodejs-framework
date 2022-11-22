const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const config = require("./config");
const initDb = require("./initDb");
const server = require("./server");

const app = server();

const appPort = config.get("appPort");
const collName = config.get("collName");

const start = async () => {
  const db = await initDb();

  app.get("/products/:id", async (req, res) => {
    //  /products/1, req.params has value  { id: '1' }

    try {
      const dbResponse = await db
        .collection(collName)
        .findOne({ _id: new ObjectId(req.params.id) });
      console.log("res", dbResponse);

      res.json(dbResponse);
    } catch (e) {
      console.log("e", JSON.stringify(e.errInfo));
      res.statusCode = 500;
      res.send("Error db get ", JSON.stringify(e));
    }
  });
  app.get("/products/", (req, res) => {
    // /products?page=1&pageSize=10 =>  { page: '1', pageSize: '10' }
    console.log(req.query);
    res.send(JSON.stringify(req.query));
  });
  app.post("/products/", async (req, res) => {
    const data = req.body;
    console.info("data", data);
    try {
      const dbResponse = await db.collection(collName).insertOne(data);
      console.log("res", dbResponse.insertedId.toString());

      res.send(dbResponse.insertedId.toString());
    } catch (e) {
      console.log("e", JSON.stringify(e.errInfo));
      res.statusCode = 500;
      res.send("Error db insert ", JSON.stringify(e));
    }
  });

  app.get("/photos/:file", function (req, res) {
    const file = req.params.file;
    const pth = path.join(__dirname, "uploads", file + ".jpeg");

    console.log(pth);
    if (fs.existsSync(pth)) {
      res.sendFile(pth);
    } else {
      res.statusCode = 403;
      res.send("Sorry! you cant see that.");
    }
  });

  const protectedMiddleware = (req, res, next) => {
    if (req.headers["authorization"] === "a123") {
      next();
    } else {
      console.log("++ protectedMiddleware");
      res.statusCode = 401;
      res.send("Not allowed");
    }
  };

  app.get("/protected", protectedMiddleware, (req, res) => {
    res.end("protected route");
  });

  app.listen(appPort, () => {
    console.log(`listening on port ${appPort}`);
  });
};

start();
