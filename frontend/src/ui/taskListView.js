(function (global) {
  "use strict";

  const { TASK_STATUSES } = global.TaskApp.constants;

  /**
   * Vista del tablero de tareas.
   *
   * Convierte los datos que devuelve la API en HTML y actualiza los mensajes
   * de la pantalla. No hace peticiones HTTP ni conoce reglas de negocio.
   */
  function createTaskListView({ taskList, message, apiStatus }) {
    function renderTasks(tasks) {
      if (!tasks.length) {
        taskList.innerHTML = "<p>No hay tareas todavía. Crea la primera.</p>";
        return;
      }

      taskList.innerHTML = tasks.map(renderTaskCard).join("");
    }

    function renderTaskCard(task) {
      return `
        <article class="task">
          <div class="task-top">
            <div>
              <h3>${escapeHtml(task.title)}</h3>
              <p>${escapeHtml(task.description || "Sin descripción")}</p>
            </div>
            <strong>#${task.id}</strong>
          </div>
          <div class="task-actions">
            <label for="status-${task.id}">Estado</label>
            <select id="status-${task.id}" data-task-id="${task.id}">
              ${renderStatusOptions(task.status)}
            </select>
            <button type="button" class="secondary" data-save-id="${task.id}">Guardar estado</button>
          </div>
        </article>
      `;
    }

    function renderStatusOptions(currentStatus) {
      return TASK_STATUSES.map(status => {
        const selected = status === currentStatus ? "selected" : "";
        return `<option ${selected}>${escapeHtml(status)}</option>`;
      }).join("");
    }

    function renderLoadError(errorMessage) {
      taskList.innerHTML = `<p>${escapeHtml(errorMessage)}. Verifica que el backend esté iniciado.</p>`;
    }

    function renderApiStatus(isConnected) {
      apiStatus.textContent = isConnected ? "API conectada" : "API no disponible";
      apiStatus.classList.toggle("status-error", !isConnected);
    }

    function showMessage(text, type = "error") {
      message.textContent = text;
      message.dataset.type = type;
    }

    function clearMessage() {
      message.textContent = "";
      delete message.dataset.type;
    }

    return {
      renderTasks,
      renderLoadError,
      renderApiStatus,
      showMessage,
      clearMessage
    };
  }

  /**
   * Evita inyección de HTML cuando un título o una descripción contienen
   * caracteres especiales escritos por el usuario.
   */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));
  }

  global.TaskApp.createTaskListView = createTaskListView;
})(window);
