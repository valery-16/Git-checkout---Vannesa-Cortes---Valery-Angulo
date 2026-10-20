const { Task } = require("../../domain/entities/Task");

/**
 * Tareas de ejemplo que existían en el proyecto base.
 * Son datos iniciales del adaptador en memoria, no reglas de negocio.
 */
const DEFAULT_TASKS = [
  {
    id: 1,
    title: "Analizar el proyecto base",
    description: "Identificar responsabilidades",
    status: "en progreso"
  },
  {
    id: 2,
    title: "Diseñar la arquitectura",
    description: "Proponer módulos",
    status: "pendiente"
  }
];

/**
 * Adaptador de persistencia en memoria.
 *
 * Responsabilidad única: guardar y recuperar tareas. No valida reglas de
 * negocio (eso lo hace la entidad/servicio) ni conoce HTTP. Devuelve copias
 * para no filtrar sus objetos internos.
 *
 * Si más adelante se usa una base de datos real, se crea otro repositorio con
 * los mismos métodos y se cambia la instancia en server.js.
 */
class InMemoryTaskRepository {
  constructor(initialTasks = DEFAULT_TASKS) {
    this.tasks = initialTasks.map(taskData => new Task(taskData));
    this.nextId = this.calculateNextId();
  }

  findAll() {
    return this.tasks.map(task => task.clone());
  }

  findById(id) {
    const task = this.findInternalTask(id);
    return task ? task.clone() : null;
  }

  create({ title, description, status }) {
    // La identidad la asigna el repositorio porque es un detalle de almacenamiento.
    const task = new Task({ id: this.nextId, title, description, status });

    this.nextId += 1;
    this.tasks.push(task);

    return task.clone();
  }

  updateStatus(id, status) {
    const task = this.findInternalTask(id);

    if (!task) {
      return null;
    }

    // La entidad aplica la regla de estados válidos antes de modificar el dato.
    task.changeStatus(status);
    return task.clone();
  }

  findInternalTask(id) {
    return this.tasks.find(task => task.id === Number(id));
  }

  calculateNextId() {
    const highestId = this.tasks.reduce(
      (maximum, task) => Math.max(maximum, Number(task.id) || 0),
      0
    );

    return highestId + 1;
  }
}

module.exports = { InMemoryTaskRepository };
