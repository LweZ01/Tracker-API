export function errorMiddleware(err, req, res, next) {
  console.error("=== ERROR DETECTADO ===");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Error:", err);
  console.error("Stack trace:", err.stack);
  console.error("URL:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Params:", req.params);
  console.error("Query:", req.query);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: "fail",
    });
  }

  console.error("⚠️ ERROR NO OPERACIONAL - REVISAR INMEDIATAMENTE");
  return res.status(500).json({
    error: "Ha ocurrido un error interno. Por favor, intenta más tarde.",
    status: "error",
  });
}

export default errorMiddleware;
