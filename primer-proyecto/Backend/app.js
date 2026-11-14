const express = require("express");
const cors = require("cors");
const path = require("path");

const mallaRoutes = require("./routes/malla");
const sugerenciasRoutes = require("./routes/sugerencias");
const authRoutes = require("./routes/auth");
const progresoRoutes = require("./routes/progreso");
const actividadesRoutes = require("./routes/actividades");

const app = express();

app.set("trust proxy", 1);
const ORIGENES_PERMITIDOS = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];
app.use(cors({ origin: ORIGENES_PERMITIDOS }));
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (req, res) => {
  res.json({ estado: "ok", hora: new Date().toISOString() });
});
app.use("/api/malla", mallaRoutes);
app.use("/api/sugerencias", sugerenciasRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/actividades", actividadesRoutes);
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta de la API no encontrada" });
});
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El JSON enviado no es válido" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;