const test = require("node:test");
const assert = require("node:assert/strict");
const { Task } = require("../../src/domain/entities/Task");
const { ValidationError } = require("../../src/domain/errors");
const { TASK_STATUSES } = require("../../src/domain/taskStatus");

test("Task crea una tarea pendiente y normaliza sus textos", () => {
  const task = new Task({
    id: 10,
    title: "  Preparar sustentación  ",
    description: "  Explicar la arquitectura  "
  });

  assert.equal(task.id, 10);
  assert.equal(task.title, "Preparar sustentación");
  assert.equal(task.description, "Explicar la arquitectura");
  assert.equal(task.status, TASK_STATUSES.PENDING);
  assert.equal(Number.isNaN(Date.parse(task.createdAt)), false);
});

test("Task usa descripción vacía cuando no se envía", () => {
  const task = new Task({ id: 1, title: "Tarea válida" });

  assert.equal(task.description, "");
});

test("Task rechaza un título con menos de tres caracteres", () => {
  assert.throws(
    () => new Task({ id: 1, title: "  ok  " }),
    error => error instanceof ValidationError
      && error.message === "El título debe tener al menos 3 caracteres."
  );
});

test("Task rechaza un título que no sea texto", () => {
  assert.throws(
    () => new Task({ id: 1, title: 123 }),
    ValidationError
  );
});

test("Task rechaza un estado no permitido", () => {
  assert.throws(
    () => new Task({ id: 1, title: "Tarea válida", status: "cancelada" }),
    error => error instanceof ValidationError
      && error.message.includes("Estado inválido")
  );
});

test("Task.changeStatus actualiza el estado y valida el nuevo valor", () => {
  const task = new Task({ id: 1, title: "Tarea válida" });

  task.changeStatus(TASK_STATUSES.DONE);

  assert.equal(task.status, TASK_STATUSES.DONE);
  assert.throws(() => task.changeStatus("desconocido"), ValidationError);
  assert.equal(task.status, TASK_STATUSES.DONE);
});

test("Task.clone devuelve una copia independiente", () => {
  const original = new Task({
    id: 1,
    title: "Tarea original",
    status: TASK_STATUSES.IN_PROGRESS
  });

  const copy = original.clone();
  copy.changeStatus(TASK_STATUSES.DONE);

  assert.equal(copy.id, original.id);
  assert.equal(copy.status, TASK_STATUSES.DONE);
  assert.equal(original.status, TASK_STATUSES.IN_PROGRESS);
});
