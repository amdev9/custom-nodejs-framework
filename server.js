const fs = require("fs");
const path = require("path");
const http = require("http");
const queryParse = require("./query-params.js");
const parse = require("./url-to-regex");

function createResponse(res) {
  res.send = (message) => res.end(message);
  res.json = (message) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(message));
  };
  res.html = (message) => {
    res.setHeader("Content-Type", "text/html");
    res.end(message);
  };

  res.sendFile = (path) => {
    const fileStream = fs.createReadStream(path);
    fileStream.on("open", () => {
      fileStream.pipe(res);
    });
  };
  return res;
}

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

function processMiddleware(middleware, req, res) {
  if (!middleware) {
    // resolve false
    return new Promise((resolve) => resolve(true));
  }

  return new Promise((resolve) => {
    middleware(req, res, function () {
      resolve(true);
    });
  });
}

function myServer() {
  let routeTable = {};
  let parseMethod = "json";

  const server = http.createServer(async (req, res) => {
    const routes = Object.keys(routeTable);
    let match = false;
    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];
      const parsedRoute = parse(route);
      if (
        new RegExp(parsedRoute).test(req.url) &&
        routeTable[route][req.method.toLowerCase()]
      ) {
        let cb = routeTable[route][req.method.toLowerCase()];

        let middleware =
          routeTable[route][`${req.method.toLowerCase()}-middleware`];

        const m = req.url.match(new RegExp(parsedRoute));

        req.params = m.groups;
        req.query = queryParse(req.url);

        let body = await readBody(req);

        if (parseMethod === "json") {
          body = body ? JSON.parse(body) : {};
        }
        req.body = body;

        const result = await processMiddleware(
          middleware,
          req,
          createResponse(res)
        );
        if (result) {
          cb(req, res);
        }

        match = true;
        break;
      }
    }
    if (!match) {
      res.statusCode = 404;
      res.end("Not found");
    }
  });

  function registerPath(path, cb, method, middleware) {
    console.log("----------< ", middleware);
    if (!routeTable[path]) {
      routeTable[path] = {};
    }
    routeTable[path] = {
      ...routeTable[path],
      [method]: cb,
      [method + "-middleware"]: middleware,
    };
    routeTable[path] = {
      ...routeTable[path],
      [method]: cb,
      [method + "-middleware"]: middleware,
    };
  }

  return {
    get: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "get");
      } else {
        registerPath(path, rest[1], "get", rest[0]);
      }
    },

    post: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "post");
      } else {
        registerPath(path, rest[1], "post", rest[0]);
      }
    },

    put: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "put");
      } else {
        registerPath(path, rest[1], "put", rest[0]);
      }
    },

    delete: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "delete");
      } else {
        registerPath(path, rest[1], "delete", rest[0]);
      }
    },
    bodyParse: (method) => (parseMethod = method),
    //TODO: static: () =>
    listen(port, cb) {
      server.listen(port, cb);
    },
    _server: server,
  };
}

module.exports = myServer;
