const test = require("node:test");
const assert = require("node:assert/strict");
const { InMemoryTaskRepository } = require("../../src/infrastructure/repositories/InMemoryTaskRepository");
const { TASK_STATUSES } = require("../../src/domain/taskStatus");

test("InMemoryTaskRepository inicia con las dos tareas del proyecto base", () => {
  const repository = new InMemoryTaskRepository();

  const tasks = repository.findAll();

  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].title, "Analizar el proyecto base");
  assert.equal(tasks[1].title, "Diseñar la arquitectura");
});

test("InMemoryTaskRepository asigna identificadores consecutivos", () => {
  const repository = new InMemoryTaskRepository();

  const first = repository.create({
    title: "Tercera tarea",
    description: "",
    status: TASK_STATUSES.PENDING
  });
  const second = repository.create({
    title: "Cuarta tarea",
    description: "",
    status: TASK_STATUSES.PENDING
  });

  assert.equal(first.id, 3);
  assert.equal(second.id, 4);
});

test("InMemoryTaskRepository devuelve copias y no expone su estado interno", () => {
  const repository = new InMemoryTaskRepository();
  const listedTask = repository.findAll()[0];

  listedTask.status = TASK_STATUSES.DONE;
  listedTask.title = "Modificada por fuera";

  const taskFromRepository = repository.findById(1);
  assert.equal(taskFromRepository.status, TASK_STATUSES.IN_PROGRESS);
  assert.equal(taskFromRepository.title, "Analizar el proyecto base");
});

test("InMemoryTaskRepository actualiza el estado y devuelve una copia", () => {
  const repository = new InMemoryTaskRepository();

  const updatedTask = repository.updateStatus("2", TASK_STATUSES.DONE);
  updatedTask.title = "Cambio externo";

  assert.equal(updatedTask.id, 2);
  assert.equal(repository.findById(2).status, TASK_STATUSES.DONE);
  assert.equal(repository.findById(2).title, "Diseñar la arquitectura");
});

test("InMemoryTaskRepository devuelve null cuando la tarea no existe", () => {
  const repository = new InMemoryTaskRepository();

  assert.equal(repository.findById(999), null);
  assert.equal(repository.updateStatus(999, TASK_STATUSES.DONE), null);
});
