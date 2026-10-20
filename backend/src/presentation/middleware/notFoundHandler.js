/**
 * Responde con JSON cuando la ruta solicitada no existe.
 * Se coloca después de todas las rutas y antes del manejador de errores.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." });
}

module.exports = { notFoundHandler };
