const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { getJwtSecret } = require("../config/security");
const { validateRegister, validateLogin } = require("../validators");

const router = express.Router();
const loginAttempts = new Map();

function loginRateLimit(req, res, next) {
  const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "sem-email";
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5;
  const attempt = loginAttempts.get(key) || { count: 0, firstTry: now };

  if (now - attempt.firstTry > windowMs) {
    attempt.count = 0;
    attempt.firstTry = now;
  }

  attempt.count += 1;
  loginAttempts.set(key, attempt);

  if (attempt.count > maxAttempts) {
    res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
    return res.status(429).json({ message: "Muitas tentativas. Tente novamente mais tarde." });
  }

  return next();
}

router.post("/register", (req, res) => {
  const data = validateRegister(req.body);

  if (!data) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  const hashedPassword = bcrypt.hashSync(data.password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [data.name, data.email, hashedPassword],
    function (error) {
      if (error) {
        console.warn("Falha no cadastro:", error.message);
        return res.status(400).json({ message: "Dados inválidos." });
      }

      return res.status(201).json({
        message: "Usuário registrado com sucesso.",
        userId: this.lastID
      });
    }
  );
});

router.post("/login", loginRateLimit, (req, res) => {
  const data = validateLogin(req.body);

  if (!data) {
    return res.status(400).json({ message: "Credenciais inválidas." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [data.email], (error, user) => {
    if (error) {
      console.error("Erro ao buscar usuário:", error.message);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }

    if (!user) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const passwordIsValid = bcrypt.compareSync(data.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token
    });
  });
});

module.exports = router;