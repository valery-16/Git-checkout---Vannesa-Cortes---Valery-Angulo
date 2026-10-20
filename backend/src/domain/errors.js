/**
 * Errores propios del dominio y de la aplicación.
 *
 * Decisión de diseño: estos errores NO conocen códigos HTTP. Una tarea con
 * título inválido es un error de negocio, sin importar si la petición llegó
 * por HTTP, por consola o desde una prueba. La capa de presentación es la
 * encargada de traducir cada error a un código de estado (400, 404, etc.).
 */
class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
  }
}

class ValidationError extends DomainError {}

class NotFoundError extends DomainError {}

module.exports = { DomainError, ValidationError, NotFoundError };
