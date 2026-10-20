const test = require("node:test");
const assert = require("node:assert/strict");
const { TaskService } = require("../../src/application/services/TaskService");
const { NotFoundError, ValidationError } = require("../../src/domain/errors");
const { TASK_STATUSES } = require("../../src/domain/taskStatus");

/**
 * Repositorio falso para demostrar que el servicio se puede probar sin
 * Express ni una base de datos real. Solo implementa el contrato que usa
 * TaskService y registra cuántas veces se invoca.
 */
class FakeTaskRepository {
  constructor(initialTasks = []) {
    this.tasks = initialTasks.map(task => ({ ...task }));
    this.nextId = 1;
    this.updateStatusCalls = 0;
    this.lastCreatedData = null;
  }

  findAll() {
    return this.tasks.map(task => ({ ...task }));
  }

  create(data) {
    this.lastCreatedData = data;
    const task = { id: this.nextId++, ...data };
    this.tasks.push(task);
    return { ...task };
  }

  updateStatus(id, status) {
    this.updateStatusCalls += 1;
    const task = this.tasks.find(candidate => candidate.id === Number(id));

    if (!task) {
      return null;
    }

    task.status = status;
    return { ...task };
  }
}

test("TaskService lista las tareas usando el repositorio", () => {
  const repository = new FakeTaskRepository([
    { id: 1, title: "Primera", description: "", status: TASK_STATUSES.PENDING }
  ]);
  const service = new TaskService(repository);

  const tasks = service.listTasks();

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, "Primera");
});

test("TaskService crea la tarea siempre en estado pendiente", () => {
  const repository = new FakeTaskRepository();
  const service = new TaskService(repository);

  const task = service.createTask({
    title: "Nueva tarea",
    description: "Descripción",
    status: TASK_STATUSES.DONE
  });

  assert.equal(task.status, TASK_STATUSES.PENDING);
  assert.equal(repository.lastCreatedData.status, TASK_STATUSES.PENDING);
});

test("TaskService rechaza un estado inválido antes de buscar la tarea", () => {
  const repository = new FakeTaskRepository();
  const service = new TaskService(repository);

  assert.throws(
    () => service.changeStatus("999", "archivada"),
    error => error instanceof ValidationError
      && error.message === "Estado inválido. Use: pendiente, en progreso, finalizada."
  );
  assert.equal(repository.updateStatusCalls, 0);
});

test("TaskService informa cuando la tarea no existe", () => {
  const repository = new FakeTaskRepository();
  const service = new TaskService(repository);

  assert.throws(
    () => service.changeStatus("999", TASK_STATUSES.DONE),
    error => error instanceof NotFoundError
      && error.message === "No existe una tarea con ese identificador."
  );
});

test("TaskService cambia el estado de una tarea existente", () => {
  const repository = new FakeTaskRepository([
    { id: 1, title: "Primera", description: "", status: TASK_STATUSES.PENDING }
  ]);
  const service = new TaskService(repository);

  const updatedTask = service.changeStatus("1", TASK_STATUSES.IN_PROGRESS);

  assert.equal(updatedTask.status, TASK_STATUSES.IN_PROGRESS);
  assert.equal(repository.tasks[0].status, TASK_STATUSES.IN_PROGRESS);
});
