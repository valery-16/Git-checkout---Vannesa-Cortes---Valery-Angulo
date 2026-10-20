(function (global) {
  "use strict";

  /**
   * Configuración del cliente.
   *
   * La URL se mantiene igual que en el proyecto original. Si algún día cambia
   * el puerto o el host de la API, solo se modifica este archivo.
   */
  const API_BASE_URL = "http://localhost:3000/api";

  const taskApp = global.TaskApp || (global.TaskApp = {});
  taskApp.config = Object.freeze({ API_BASE_URL });
})(window);
