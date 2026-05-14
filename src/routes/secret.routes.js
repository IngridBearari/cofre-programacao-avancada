const express = require("express");
const db = require("../database/db");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, (req, res) => {
  const { title, secret_content } = req.body;

  if (!title || !secret_content) {
    return res.status(400).json({ message: "Título e conteúdo secreto são obrigatórios." });
  }

  db.run(
    "INSERT INTO secrets (title, secret_content, user_id) VALUES (?, ?, ?)",
    [title, secret_content, req.user.id],
    function (error) {
      if (error) {
        return res.status(500).json({ message: "Erro ao criar anotação secreta." });
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
        return res.status(500).json({ message: "Erro ao buscar anotação secreta." });
      }

      if (!secret) {
        return res.status(404).json({ message: "Anotação secreta não encontrada." });
      }

      return res.json(secret);
    }
  );
});

module.exports = router;