const { ValidationError } = require("./errors");

/**
 * Estados válidos del ciclo de vida de una tarea.
 *
 * Están en el dominio porque son una regla del negocio: ni el controlador ni
 * el repositorio deben inventar estados. Se congelan para evitar que otra
 * parte del programa los modifique por accidente.
 */
const TASK_STATUSES = Object.freeze({
  PENDING: "pendiente",
  IN_PROGRESS: "en progreso",
  DONE: "finalizada"
});

const TASK_STATUS_VALUES = Object.freeze(Object.values(TASK_STATUSES));

function isValidTaskStatus(status) {
  return TASK_STATUS_VALUES.includes(status);
}

/**
 * Valida un estado y lanza un error de negocio si no es permitido.
 * Centralizar el mensaje evita duplicarlo en la entidad y en el servicio.
 */
function assertValidTaskStatus(status) {
  if (!isValidTaskStatus(status)) {
    throw new ValidationError(`Estado inválido. Use: ${TASK_STATUS_VALUES.join(", ")}.`);
  }
}

module.exports = { TASK_STATUSES, TASK_STATUS_VALUES, isValidTaskStatus, assertValidTaskStatus };
