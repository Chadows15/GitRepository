const express = require("express");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Sugerencia = require("../models/Sugerencia");
const Actividad = require("../models/Actividad");
const { requerirLogin, soloAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requerirLogin, soloAdmin);

router.get("/resumen", async (req, res) => {
  const [usuarios, sugerencias, actividades] = await Promise.all([
    Usuario.countDocuments(),
    Sugerencia.countDocuments(),
    Actividad.countDocuments()
  ]);
  res.json({ usuarios, sugerencias, actividades });
});
router.get("/sugerencias", async (req, res) => {
  const lista = await Sugerencia.find().sort({ fecha: -1 }).limit(200).lean();
  res.json(
    lista.map((s) => ({ id: String(s._id), correo: s.correo, mensaje: s.mensaje, fecha: s.fecha }))
  );
});
router.delete("/sugerencias/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  const borrada = await Sugerencia.findByIdAndDelete(req.params.id);
  if (!borrada) {
    return res.status(404).json({ error: "Sugerencia no encontrada" });
  }
  res.json({ ok: true });
});
router.get("/usuarios", async (req, res) => {
  const lista = await Usuario.find().sort({ creado: -1 }).limit(200).lean();
  res.json(
    lista.map((u) => ({
      id: String(u._id),
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      creado: u.creado
    }))
  );
});

module.exports = router;