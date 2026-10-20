(function (global) {
  "use strict";

  const { taskApi, createTaskListView } = global.TaskApp;

  const form = document.querySelector("#task-form");
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const refreshButton = document.querySelector("#refresh");
  const taskList = document.querySelector("#task-list");
  const message = document.querySelector("#message");
  const apiStatus = document.querySelector("#api-status");

  const view = createTaskListView({ taskList, message, apiStatus });

  /**
   * Orquesta la pantalla: conecta eventos del usuario con el cliente HTTP y
   * con la vista. No construye HTML ni conoce detalles de fetch.
   */
  async function loadTasks() {
    try {
      const tasks = await taskApi.listTasks();
      view.renderTasks(tasks);
      view.renderApiStatus(true);
    } catch (error) {
      view.renderApiStatus(false);
      view.renderLoadError(error.message);
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    view.clearMessage();

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
    }
  });

  refreshButton.addEventListener("click", loadTasks);

  taskList.addEventListener("click", async event => {
    const button = event.target.closest("[data-save-id]");

    if (!button) {
      return;
    }

    const id = button.dataset.saveId;
    const select = taskList.querySelector(`[data-task-id="${id}"]`);

    try {
      await taskApi.updateTaskStatus(id, select.value);
      await loadTasks();
    } catch (error) {
      view.showMessage(error.message);
    }
  });

  loadTasks();
})(window);
