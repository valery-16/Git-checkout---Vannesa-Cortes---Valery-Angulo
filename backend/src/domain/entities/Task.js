const { TASK_STATUSES, assertValidTaskStatus } = require("../taskStatus");
const { ValidationError } = require("../errors");

const MIN_TITLE_LENGTH = 3;

/**
 * Entidad Task: representa una tarea y protege sus invariantes.
 *
 * La entidad no sabe cómo se guarda ni cómo se muestra: solo garantiza que
 * una tarea siempre tenga un título válido, una descripción de texto y un
 * estado permitido. Así las reglas viajan con el concepto del negocio.
 */
class Task {
  constructor({
    id,
    title,
    description = "",
    status = TASK_STATUSES.PENDING,
    createdAt = new Date().toISOString()
  }) {
    assertValidTaskStatus(status);

    this.id = id;
    this.title = normalizeTitle(title);
    this.description = normalizeDescription(description);
    this.status = status;
    this.createdAt = createdAt;
  }

  /**
   * Cambia el estado aplicando la regla del dominio.
   * El repositorio delega aquí para no asignar `status` directamente.
   */
  changeStatus(newStatus) {
    assertValidTaskStatus(newStatus);
    this.status = newStatus;
    return this;
  }

  /**
   * Devuelve una copia independiente. El repositorio la usa para que quien
   * consulte no pueda modificar el estado interno de su almacenamiento.
   */
  clone() {
    return new Task({
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt
    });
  }
}

function normalizeTitle(title) {
  const normalizedTitle = typeof title === "string" ? title.trim() : "";

  if (normalizedTitle.length < MIN_TITLE_LENGTH) {
    throw new ValidationError("El título debe tener al menos 3 caracteres.");
  }

  return normalizedTitle;
}

function normalizeDescription(description) {
  // El valor por defecto del constructor cubre `undefined`; String conserva
  // el mismo comportamiento que tenía la normalización original del servicio.
  return String(description).trim();
}

module.exports = { Task };
