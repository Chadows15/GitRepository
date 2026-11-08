const express = require("express");
const Sugerencia = require("../models/sugerencia");

const router = express.Router();

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
  const correo = String(req.body?.correo ?? "").trim();
  const mensaje = String(req.body?.mensaje ?? "").trim();

  if (!REGEX_CORREO.test(correo)) {
    return res.status(400).json({ error: "Escribe un correo válido" });
  }
  if (mensaje.length < 10 || mensaje.length > 1000) {
    return res.status(400).json({ error: "El mensaje debe tener entre 10 y 1000 caracteres" });
  }

  await Sugerencia.create({ correo, mensaje });
  res.status(201).json({ ok: true, mensaje: "¡Gracias por tu sugerencia!" });
});

module.exports = router;