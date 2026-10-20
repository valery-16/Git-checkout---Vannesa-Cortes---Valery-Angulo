(function (global) {
  "use strict";

  /**
   * Estados que el usuario puede elegir en la interfaz.
   *
   * Es una copia deliberada del contrato público de la API: el navegador y el
   * backend son aplicaciones separadas. El backend siempre valida de nuevo,
   * por lo que una modificación manual del HTML no puede guardar estados
   * inválidos.
   */
  const TASK_STATUSES = Object.freeze(["pendiente", "en progreso", "finalizada"]);

  const taskApp = global.TaskApp || (global.TaskApp = {});
  taskApp.constants = Object.freeze({ TASK_STATUSES });
})(window);
