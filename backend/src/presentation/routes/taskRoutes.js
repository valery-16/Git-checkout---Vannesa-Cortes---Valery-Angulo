const express = require("express");

/**
 * Define las rutas del recurso "tareas" y las conecta con el controlador.
 * Las rutas no contienen lógica: solo declaran los endpoints existentes.
 */
function createTaskRoutes(controller) {
  const router = express.Router();

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.patch("/:id/status", controller.updateStatus);

  return router;
}

module.exports = { createTaskRoutes };
