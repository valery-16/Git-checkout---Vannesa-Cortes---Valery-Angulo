const { ValidationError, NotFoundError } = require("../../domain/errors");

/**
 * Traduce errores de la aplicación a respuestas HTTP.
 *
 * Esta es la frontera donde los errores de negocio reciben un código de
 * estado. El dominio no necesita saber qué es un 400 o un 404.
 */
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  // Error producido por express.json() cuando el cuerpo no es JSON válido.
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }

  // Los errores inesperados se registran, pero no se exponen detalles internos.
  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor." });
}

module.exports = { errorHandler };
