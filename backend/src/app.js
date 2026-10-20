const path = require("path");
const express = require("express");
const cors = require("cors");
const { createTaskController } = require("./presentation/controllers/taskController");
const { createTaskRoutes } = require("./presentation/routes/taskRoutes");
const { createHealthRoutes } = require("./presentation/routes/healthRoutes");
const { notFoundHandler } = require("./presentation/middleware/notFoundHandler");
const { errorHandler } = require("./presentation/middleware/errorHandler");

const FRONTEND_DIRECTORY = path.resolve(__dirname, "../../frontend");

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

  // Sirve la interfaz existente para poder probar el sistema completo desde
  // http://localhost:3000, sin necesidad de abrir el HTML como archivo.
  app.use(express.static(FRONTEND_DIRECTORY));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
