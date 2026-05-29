const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/security");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token inválido." });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    console.warn("Falha na autenticação:", error.message);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

module.exports = auth;