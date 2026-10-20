const express = require("express");

/**
 * Ruta de verificación usada por el frontend para comprobar que la API
 * está disponible. Se separa de las rutas de tareas para mantener cada
 * archivo enfocado en un recurso.
 */
function createHealthRoutes() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

module.exports = { createHealthRoutes };
