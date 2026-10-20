(function (global) {
  "use strict";

  const { taskApi, createTaskListView } = global.TaskApp;

  const form = document.querySelector("#task-form");
  const submitButton = form.querySelector('button[type="submit"]');
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const refreshButton = document.querySelector("#refresh");
  const taskList = document.querySelector("#task-list");
  const message = document.querySelector("#message");
  const boardMessage = document.querySelector("#board-message");
  const apiStatus = document.querySelector("#api-status");

  const view = createTaskListView({ taskList, message, boardMessage, apiStatus });

  /**
   * Orquesta la pantalla: conecta eventos del usuario con el cliente HTTP y
   * con la vista. No construye HTML ni conoce detalles de fetch.
   *
   * `trigger` es el botón que originó la recarga (si existe) y se bloquea
   * mientras dura la petición. `successMessage` se muestra solo si la lista
   * se actualizó correctamente.
   */
  async function loadTasks({ trigger, successMessage } = {}) {
    view.setButtonBusy(trigger, true, "Actualizando…");

    try {
      const tasks = await taskApi.listTasks();
      view.renderTasks(tasks);
      view.renderApiStatus(true);

      if (successMessage) {
        view.showBoardMessage(successMessage, "success");
      }

      return true;
    } catch (error) {
      view.renderApiStatus(false);
      view.renderLoadError(error.message);
      view.showBoardMessage("No se pudieron cargar las tareas.");
      return false;
    } finally {
      view.setButtonBusy(trigger, false);
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    view.clearMessage();
    view.setButtonBusy(submitButton, true, "Guardando…");

    try {
      await taskApi.createTask({
        title: titleInput.value,
        description: descriptionInput.value
      });
      form.reset();
      view.showMessage("Tarea creada correctamente.", "success");
      await loadTasks();
    } catch (error) {
      view.showMessage(error.message);
    } finally {
      view.setButtonBusy(submitButton, false);
    }
  });

  refreshButton.addEventListener("click", () => {
    loadTasks({ trigger: refreshButton, successMessage: "Lista actualizada." });
  });

  taskList.addEventListener("click", async event => {
    const button = event.target.closest("[data-save-id]");

    if (!button) {
      return;
    }

    const select = button.closest(".task")?.querySelector(".task-status");

    if (!select) {
      return;
    }

    view.clearBoardMessage();
    view.setButtonBusy(button, true, "Guardando…");

    try {
      await taskApi.updateTaskStatus(button.dataset.saveId, select.value);
      const reloaded = await loadTasks();

      if (reloaded) {
        view.showBoardMessage("Estado actualizado correctamente.", "success");
      }
    } catch (error) {
      view.showBoardMessage(error.message);
    } finally {
      view.setButtonBusy(button, false);
    }
  });

  loadTasks();
})(window);
