const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Usuario = require("../models/usuario");
const { requerirLogin } = require("../middleware/auth");
const router = express.Router();
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo" }
});
function crearToken(usuario) {
  return jwt.sign({ id: String(usuario._id), rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}
function datosPublicos(usuario) {
  return { id: String(usuario._id), nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
}
router.post("/registro", limitarIntentos, async (req, res) => {
  const nombre = String(req.body?.nombre ?? "").trim();
  const correo = String(req.body?.correo ?? "").trim().toLowerCase();
  const contrasena = String(req.body?.contrasena ?? "");
  if (nombre.length < 2 || nombre.length > 60) {
    return res.status(400).json({ error: "El nombre debe tener entre 2 y 60 caracteres" });
  }
  if (!REGEX_CORREO.test(correo)) {
    return res.status(400).json({ error: "Escribe un correo válido" });
  }
  if (contrasena.length < 6 || contrasena.length > 72) {
    return res.status(400).json({ error: "La contraseña debe tener entre 6 y 72 caracteres" });
  }
  if (await Usuario.findOne({ correo })) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
  }
  const passwordHash = await bcrypt.hash(contrasena, 10);
  let usuario;
  try {
    usuario = await Usuario.create({ nombre, correo, passwordHash });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
    }
    throw error;
  }
  res.status(201).json({ token: crearToken(usuario), usuario: datosPublicos(usuario) });
});
router.post("/login", limitarIntentos, async (req, res) => {
  const correo = String(req.body?.correo ?? "").trim().toLowerCase();
  const contrasena = String(req.body?.contrasena ?? "");
  const usuario = await Usuario.findOne({ correo }).select("+passwordHash");
  const valido = usuario ? await bcrypt.compare(contrasena, usuario.passwordHash) : false;
  if (!valido) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }
  res.json({ token: crearToken(usuario), usuario: datosPublicos(usuario) });
});
router.get("/yo", requerirLogin, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id);
  if (!usuario) {
    return res.status(401).json({ error: "La cuenta ya no existe" });
  }
  res.json({ usuario: datosPublicos(usuario) });
});
module.exports = router;