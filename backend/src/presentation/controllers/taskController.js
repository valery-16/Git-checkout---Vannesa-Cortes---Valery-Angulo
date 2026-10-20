/**
 * Controlador HTTP de tareas.
 *
 * Su única responsabilidad es traducir entre HTTP y los casos de uso:
 * lee la petición, llama al servicio y construye la respuesta. No contiene
 * SQL, reglas de negocio ni cálculo de estados.
 */
function createTaskController(service) {
  return {
    list(req, res, next) {
      try {
        res.json(service.listTasks());
      } catch (error) {
        next(error);
      }
    },

    create(req, res, next) {
      try {
        const task = service.createTask(req.body || {});
        res.status(201).json(task);
      } catch (error) {
        next(error);
      }
    },

    updateStatus(req, res, next) {
      try {
        const updatedTask = service.changeStatus(req.params.id, req.body?.status);
        res.json(updatedTask);
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = { createTaskController };
