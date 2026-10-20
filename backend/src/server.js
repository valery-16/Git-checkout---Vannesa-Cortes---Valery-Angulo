const { createApp } = require("./app");
const { TaskService } = require("./application/services/TaskService");
const { InMemoryTaskRepository } = require("./infrastructure/repositories/InMemoryTaskRepository");

/**
 * Punto de composición de la aplicación ("composition root").
 *
 * Aquí se eligen las implementaciones concretas y se conectan las capas:
 * repositorio en memoria -> servicio -> controlador -> aplicación Express.
 * Es el único archivo que conoce todas las piezas al mismo tiempo.
 */
const port = process.env.PORT || 3000;

function startServer() {
  const repository = new InMemoryTaskRepository();
  const taskService = new TaskService(repository);
  const app = createApp({ taskService });

  return app.listen(port, () => {
    console.log(`API lista en http://localhost:${port}`);
  });
}

// Solo se inicia el servidor cuando se ejecuta este archivo directamente.
// Así las pruebas pueden importar la aplicación sin abrir un puerto.
if (require.main === module) {
  startServer();
}
