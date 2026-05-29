const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const secretRoutes = require("./routes/secret.routes");
const errorHandler = require("./middleware/errorHandler");
const { getAllowedOrigins } = require("./config/security");

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || getAllowedOrigins().includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("Origem bloqueada pelo CORS.");
    error.statusCode = 403;
    return callback(error);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({ message: "Requisição inválida." });
  }

  return next();
});

app.use(express.json({ limit: "16kb" }));

app.use("/api", authRoutes);
app.use("/api/secrets", secretRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API O Cofre Digital rodando!" });
});

app.use(errorHandler);

module.exports = app;