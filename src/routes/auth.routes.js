const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    function (error) {
      if (error) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      return res.status(201).json({
        message: "Usuário registrado com sucesso.",
        userId: this.lastID
      });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (error, user) => {
    if (error) {
      return res.status(500).json({ message: "Erro ao buscar usuário." });
    }

    if (!user) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token
    });
  });
});

module.exports = router;