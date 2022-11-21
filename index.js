const fs = require("fs");
const path = require("path");
const server = require("./server");
const app = server();
const PORT = 3000;

app.get("/products/:id", (req, res) => {
  //  /products/1, req.params has value  { id: '1' }
  res.send(req.params.id);
});
app.get("/products/", (req, res) => {
  // /products?page=1&pageSize=10 =>  { page: '1', pageSize: '10' }
  console.log(req.query);
  res.send(JSON.stringify(req.query));
});
app.post("/products/", (req, res) => {
  console.info("body", req.body);
  res.json(req.body);
});

app.get("/photos/:file", function (req, res) {
  const file = req.params.file;
  const pth = path.join(__dirname, "uploads", file + ".jpeg");

  console.log(pth)
  if (fs.existsSync(pth)) {
    res.sendFile(pth);
  } else {
    res.send(403, "Sorry! you cant see that.");
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
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
