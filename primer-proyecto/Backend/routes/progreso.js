const express = require("express");
const Materia = require("../models/materia");
const EstadoMateria = require("../models/EstadoMateria");
const { requerirLogin } = require("../middleware/auth");
const router = express.Router();
const ESTADOS = ["pendiente", "cursando", "aprobada"];
router.use(requerirLogin);

router.get("/", async (req, res) => {
  const registros = await EstadoMateria.find({ usuario: req.usuario.id }).lean();
  const estados = {};
  for (const registro of registros) {
    estados[registro.materiaId] = registro.estado;
  }
  res.json({ estados });
});
router.put("/:materiaId", async (req, res) => {
  const { materiaId } = req.params;
  const estado = req.body?.estado;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: "El estado debe ser pendiente, cursando o aprobada" });
  }
  if (!(await Materia.exists({ id: materiaId }))) {
    return res.status(404).json({ error: "Materia no encontrada" });
  }
  await EstadoMateria.findOneAndUpdate(
    { usuario: req.usuario.id, materiaId },
    { estado },
    { upsert: true }
  );
  res.json({ ok: true, materiaId, estado });
});
module.exports = router;