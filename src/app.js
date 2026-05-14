const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const secretRoutes = require("./routes/secret.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/secrets", secretRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API O Cofre Digital rodando!" });
});

module.exports = app;