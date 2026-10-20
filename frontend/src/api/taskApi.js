(function (global) {
  "use strict";

  const { API_BASE_URL } = global.TaskApp.config;

  /**
   * Cliente HTTP de la API de tareas.
   *
   * Concentra fetch, las cabeceras y la lectura de errores. La interfaz no
   * necesita saber cómo se construye una URL ni cómo responde el servidor.
   */
  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.error || "No se pudo completar la operación.");
    }

    return data;
  }

  function listTasks() {
    return request("/tasks");
  }

  function createTask({ title, description }) {
    return request("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description })
    });
  }

  function updateTaskStatus(id, status) {
    return request(`/tasks/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }

  global.TaskApp.taskApi = Object.freeze({
    listTasks,
    createTask,
    updateTaskStatus
  });
})(window);
