const express = require("express");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { validateSecret } = require("../validators");
const { encrypt, decrypt } = require("../services/cryptoService");

const router = express.Router();

router.post("/", auth, (req, res) => {
  const data = validateSecret(req.body);

  if (!data) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  const encryptedContent = encrypt(data.secret_content);

  db.run(
    "INSERT INTO secrets (title, secret_content, user_id) VALUES (?, ?, ?)",
    [data.title, encryptedContent, req.user.id],
    function (error) {
      if (error) {
        console.error("Erro ao criar segredo:", error.message);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      return res.status(201).json({
        message: "Anotação secreta criada com sucesso.",
        secretId: this.lastID
      });
    }
  );
});

router.get("/:id", auth, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, title, secret_content FROM secrets WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (error, secret) => {
      if (error) {
        console.error("Erro ao buscar segredo:", error.message);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      if (!secret) {
        return res.status(404).json({ message: "Anotação secreta não encontrada." });
      }

      try {
        secret.secret_content = decrypt(secret.secret_content);
        return res.json(secret);
      } catch (decryptError) {
        console.error("Erro ao descriptografar segredo:", decryptError.message);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
    }
  );
});

module.exports = router;