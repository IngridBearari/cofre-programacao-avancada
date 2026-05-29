function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET deve existir e ter pelo menos 32 caracteres.");
  }

  return process.env.JWT_SECRET;
}

function getEncryptionKey() {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");

  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY deve ser uma chave base64 de 32 bytes.");
  }

  return key;
}

function getAllowedOrigins() {
  const origins = process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173";

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  getJwtSecret,
  getEncryptionKey,
  getAllowedOrigins
};