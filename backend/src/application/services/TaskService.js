const { TASK_STATUSES, assertValidTaskStatus } = require("../../domain/taskStatus");
const { NotFoundError } = require("../../domain/errors");

/**
 * Servicio de aplicación con los casos de uso de las tareas.
 *
 * Recibe un repositorio por inyección de dependencias: no sabe si los datos
 * están en memoria, en SQLite o en una API externa. Tampoco conoce Express,
 * por lo que puede probarse con un repositorio falso, sin levantar el servidor
 * ni una base de datos.
 */
class TaskService {
  constructor(repository) {
    this.repository = repository;
  }

  /** Caso de uso: consultar todas las tareas. */
  listTasks() {
    return this.repository.findAll();
  }

  /**
   * Caso de uso: registrar una tarea nueva.
   * Regla de negocio: toda tarea nueva comienza en estado "pendiente".
   * La entidad Task valida y normaliza el título y la descripción.
   */
  createTask({ title, description } = {}) {
    return this.repository.create({
      title,
      description,
      status: TASK_STATUSES.PENDING
    });
  }

  /**
   * Caso de uso: cambiar el estado de una tarea existente.
   *
   * Se valida primero el estado y después la existencia. Así se conserva el
   * comportamiento original: un estado inválido responde 400 incluso si el
   * identificador no existe, y un estado válido con id inexistente responde 404.
   */
  changeStatus(id, status) {
    assertValidTaskStatus(status);

    const updatedTask = this.repository.updateStatus(id, status);

    if (!updatedTask) {
      throw new NotFoundError("No existe una tarea con ese identificador.");
    }

    return updatedTask;
  }
}

module.exports = { TaskService };
