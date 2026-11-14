const express = require("express");
const mongoose = require("mongoose");
const Actividad = require("../models/Actividad");
const { requerirLogin } = require("../middleware/auth");
const router = express.Router();
router.use(requerirLogin);
function aJson(actividad) {
  return {
    id: String(actividad._id),
    titulo: actividad.titulo,
    fecha: actividad.fecha,
    descripcion: actividad.descripcion
  };
}
router.get("/", async (req, res) => {
  const actividades = await Actividad.find({ usuario: req.usuario.id }).sort({ fecha: 1, creada: 1 });
  res.json(actividades.map(aJson));
});
router.post("/", async (req, res) => {
  const titulo = String(req.body?.titulo ?? "").trim();
  const fecha = String(req.body?.fecha ?? "").trim();
  const descripcion = String(req.body?.descripcion ?? "").trim();
  if (titulo.length < 1 || titulo.length > 120) {
    return res.status(400).json({ error: "El título debe tener entre 1 y 120 caracteres" });
  }
  if (fecha !== "" && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha)))) {
    return res.status(400).json({ error: "La fecha no es válida" });
  }
  if (descripcion.length > 500) {
    return res.status(400).json({ error: "La descripción no puede pasar de 500 caracteres" });
  }
  const actividad = await Actividad.create({ usuario: req.usuario.id, titulo, fecha, descripcion });
  res.status(201).json(aJson(actividad));
});
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  const borrada = await Actividad.findOneAndDelete({ _id: req.params.id, usuario: req.usuario.id });
  if (!borrada) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  res.json({ ok: true });
});
module.exports = router;