const express = require("express");
const Materia = require("../models/materia");

const router = express.Router();

function agruparPorNivel(materias) {
  const niveles = [];
  for (const m of materias) {
    let nivel = niveles.find((n) => n.nivel === m.nivel);
    if (!nivel) {
      nivel = { nivel: m.nivel, nombre: m.nivelNombre, materias: [] };
      niveles.push(nivel);
    }
    const { nivel: _nivel, nivelNombre: _nombre, orden: _orden, ...datos } = m;
    nivel.materias.push(datos);
  }
  return niveles;
}

router.get("/", async (req, res) => {
  const materias = await Materia.find().sort({ nivel: 1, orden: 1 }).select("-_id").lean();
  res.json(agruparPorNivel(materias));
});

router.get("/materias/:id", async (req, res) => {
  const materia = await Materia.findOne({ id: req.params.id }).select("-_id").lean();
  if (!materia) {
    return res.status(404).json({ error: "Materia no encontrada" });
  }
  const { nivel: _nivel, nivelNombre, orden: _orden, ...datos } = materia;
  res.json({ ...datos, nivel: nivelNombre });
});

module.exports = router;