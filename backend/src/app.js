const express = require("express");
const cors = require("cors");
const { createTaskController } = require("./presentation/controllers/taskController");
const { createTaskRoutes } = require("./presentation/routes/taskRoutes");
const { createHealthRoutes } = require("./presentation/routes/healthRoutes");
const { notFoundHandler } = require("./presentation/middleware/notFoundHandler");
const { errorHandler } = require("./presentation/middleware/errorHandler");

/**
 * Construye la aplicación Express sin ponerla a escuchar.
 *
 * Separar la creación de la aplicación del arranque del servidor permite
 * reutilizarla en pruebas de integración y evita efectos secundarios al
 * importar este módulo.
 */
function createApp({ taskService }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const taskController = createTaskController(taskService);

  app.use("/api/health", createHealthRoutes());
  app.use("/api/tasks", createTaskRoutes(taskController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
