const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createApp } = require("../../src/app");
const { TaskService } = require("../../src/application/services/TaskService");
const { InMemoryTaskRepository } = require("../../src/infrastructure/repositories/InMemoryTaskRepository");

/**
 * Levanta la aplicación real en un puerto libre y la cierra al terminar.
 * No se usa una base de datos externa porque el adaptador es en memoria.
 */
async function startTestServer(t) {
  const repository = new InMemoryTaskRepository();
  const taskService = new TaskService(repository);
  const app = createApp({ taskService });
  const server = app.listen(0, "127.0.0.1");

  await once(server, "listening");

  const { port } = server.address();
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  }));

  return `http://127.0.0.1:${port}`;
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  return { response, data: await response.json() };
}

test("GET / sirve el frontend del gestor de tareas", async t => {
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type").includes("text/html"), true);
  assert.match(html, /<h1>Gestor de tareas<\/h1>/);
});

test("GET /api/health informa que la API está disponible", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(data, { status: "ok" });
});

test("GET /api/tasks devuelve las tareas iniciales", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks");

  assert.equal(response.status, 200);
  assert.equal(data.length, 2);
  assert.equal(data[0].title, "Analizar el proyecto base");
  assert.equal(data[0].status, "en progreso");
});

test("POST /api/tasks crea una tarea pendiente y normaliza los textos", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: "  Preparar exposición  ",
      description: "  Explicar las capas  "
    })
  });

  assert.equal(response.status, 201);
  assert.equal(data.id, 3);
  assert.equal(data.title, "Preparar exposición");
  assert.equal(data.description, "Explicar las capas");
  assert.equal(data.status, "pendiente");
  assert.equal(typeof data.createdAt, "string");

  const listResponse = await requestJson(baseUrl, "/api/tasks");
  assert.equal(listResponse.data.length, 3);
});

test("POST /api/tasks ignora el estado enviado por el cliente", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: "Tarea con estado manual",
      status: "finalizada"
    })
  });

  assert.equal(response.status, 201);
  assert.equal(data.status, "pendiente");
});

test("POST /api/tasks rechaza un título demasiado corto", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "ok" })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(data, { error: "El título debe tener al menos 3 caracteres." });
});

test("PATCH /api/tasks/:id/status actualiza una tarea existente", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks/1/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "finalizada" })
  });

  assert.equal(response.status, 200);
  assert.equal(data.id, 1);
  assert.equal(data.status, "finalizada");

  const listResponse = await requestJson(baseUrl, "/api/tasks");
  assert.equal(listResponse.data[0].status, "finalizada");
});

test("PATCH /api/tasks/:id/status valida el estado antes de buscar el id", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks/999/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "archivada" })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(data, {
    error: "Estado inválido. Use: pendiente, en progreso, finalizada."
  });
});

test("PATCH /api/tasks/:id/status responde 404 si la tarea no existe", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks/999/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "finalizada" })
  });

  assert.equal(response.status, 404);
  assert.deepEqual(data, { error: "No existe una tarea con ese identificador." });
});

test("un JSON mal formado responde 400 con un mensaje claro", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/tasks", {
    method: "POST",
    body: "{\"title\":"
  });

  assert.equal(response.status, 400);
  assert.deepEqual(data, { error: "El cuerpo de la petición no es un JSON válido." });
});

test("una ruta inexistente responde 404 en formato JSON", async t => {
  const baseUrl = await startTestServer(t);

  const { response, data } = await requestJson(baseUrl, "/api/ruta-inexistente");

  assert.equal(response.status, 404);
  assert.deepEqual(data, { error: "Ruta no encontrada." });
});
