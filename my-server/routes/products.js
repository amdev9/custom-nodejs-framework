const productsController = require("../controllers/products");

function productRoutes(router) {
  router.get("/products/:id", productsController.getId);
  router.get("/products/", productsController.getAll);
  router.post("/products/", productsController.create);
}


module.exports = productRoutes;