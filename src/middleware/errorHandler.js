function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Erro interno:", {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    stack: error.stack
  });

  if (error.statusCode === 403) {
    return res.status(403).json({ message: "Acesso não permitido." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Requisição inválida." });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Requisição inválida." });
  }

  return res.status(500).json({ message: "Erro interno do servidor." });
}

module.exports = errorHandler;