(function (global) {
  "use strict";

  const { TASK_STATUSES } = global.TaskApp.constants;

  /**
   * Vista del tablero de tareas.
   *
   * Convierte los datos que devuelve la API en HTML y actualiza los mensajes
   * de la pantalla. No hace peticiones HTTP ni conoce reglas de negocio.
   */
  function createTaskListView({ taskList, message, boardMessage, apiStatus }) {
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
          <div class="task-content">
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description || "Sin descripción")}</p>
          </div>
          <div class="task-actions">
            <label for="status-${task.id}">Estado</label>
            <select id="status-${task.id}" class="task-status" data-task-id="${task.id}">
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

    const formMessage = createMessagePresenter(message);
    const boardStatus = createMessagePresenter(boardMessage);

    /**
     * Deshabilita un botón mientras hay una petición en curso y le cambia el
     * texto. Al terminar restaura su estado original.
     */
    function setButtonBusy(button, isBusy, busyText = "Procesando…") {
      if (!button) {
        return;
      }

      if (isBusy) {
        button.dataset.idleText = button.textContent;
        button.textContent = busyText;
        button.disabled = true;
        return;
      }

      if (button.dataset.idleText) {
        button.textContent = button.dataset.idleText;
        delete button.dataset.idleText;
      }

      button.disabled = false;
    }

    return {
      renderTasks,
      renderLoadError,
      renderApiStatus,
      showMessage: formMessage.show,
      clearMessage: formMessage.clear,
      showBoardMessage: boardStatus.show,
      clearBoardMessage: boardStatus.clear,
      setButtonBusy
    };
  }

  /**
   * Controla el texto y el tipo de un mensaje de estado del DOM.
   */
  function createMessagePresenter(element) {
    return {
      show(text, type = "error") {
        element.textContent = text;
        element.dataset.type = type;
      },
      clear() {
        element.textContent = "";
        delete element.dataset.type;
      }
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
