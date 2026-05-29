const crypto = require("crypto");
const { getEncryptionKey } = require("../config/security");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const ENCODING = "base64";

function encrypt(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);

  return [
    iv.toString(ENCODING),
    cipher.getAuthTag().toString(ENCODING),
    encrypted.toString(ENCODING)
  ].join(":");
}

function decrypt(encryptedText) {
  const [ivText, authTagText, contentText] = encryptedText.split(":");

  if (!ivText || !authTagText || !contentText) {
    throw new Error("Conteúdo criptografado inválido.");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivText, ENCODING)
  );

  decipher.setAuthTag(Buffer.from(authTagText, ENCODING));

  return Buffer.concat([
    decipher.update(Buffer.from(contentText, ENCODING)),
    decipher.final()
  ]).toString("utf8");
}

module.exports = {
  encrypt,
  decrypt
};
