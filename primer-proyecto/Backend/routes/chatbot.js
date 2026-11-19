const express = require("express");
const rateLimit = require("express-rate-limit");
const Materia = require("../models/Materia");
const EstadoMateria = require("../models/EstadoMateria");
const Actividad = require("../models/Actividad");
const { requerirLogin } = require("../middleware/auth");
const { responder } = require("../services/asistente");

const router = express.Router();

router.use(requerirLogin);

const limitarPreguntas = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Estás preguntando muy rápido. Espera un momento e inténtalo de nuevo" }
});

const MODELO_IA = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

function armarContexto({ materias, estados, actividades }) {
  const nombreDe = (id) => materias.find((x) => x.id === id)?.nombre || id;
  const lineasMalla = materias.map((m) => {
    const estado = estados[m.id] || "pendiente";
    const requisitos = [];
    if (m.prerrequisitos?.length) requisitos.push(`prerrequisitos: ${m.prerrequisitos.map(nombreDe).join(", ")}`);
    if (m.correquisitos?.length) requisitos.push(`correquisitos: ${m.correquisitos.map(nombreDe).join(", ")}`);
    if ((m.materiasAprobadasMin || 0) > 0) requisitos.push(`exige ${m.materiasAprobadasMin} materias aprobadas`);
    return `${m.nivelNombre} | ${m.codigo || "sin código"} | ${m.nombre} | ${m.creditos} créditos | ${m.horas} h | ${estado} | ${requisitos.join("; ") || "sin requisitos"}`;
  });
  const lineasActividades = actividades.map(
    (a) => `${a.fecha || "sin fecha"} | ${a.titulo}${a.descripcion ? " | " + a.descripcion : ""}`
  );
  return (
    "MALLA Y AVANCE DEL ESTUDIANTE (nivel | código | materia | créditos | horas | estado | requisitos):\n" +
    lineasMalla.join("\n") +
    "\n\nACTIVIDADES DEL ESTUDIANTE (fecha | título | descripción):\n" +
    (lineasActividades.length > 0 ? lineasActividades.join("\n") : "ninguna")
  );
}

const INSTRUCCIONES_IA =
  "Eres el asistente de UniLendar, una página para estudiantes de Ingeniería en Ciencias de la Computación de ESPOL. " +
  "Respondes en español, de forma amable y breve (máximo 120 palabras), en texto plano sin markdown. " +
  "Solo hablas de la malla curricular, el avance del estudiante y sus actividades; si te preguntan otra cosa, " +
  "explica con amabilidad que solo puedes ayudar con eso. " +
  "Usa únicamente los datos que se te dan; no inventes datos. Un prerrequisito debe estar aprobado antes; " +
  "un correquisito se cursa al mismo tiempo o ya aprobado. Al hablar de requisitos, compara con el estado " +
  "del estudiante.\n\n";

async function responderConIA(mensaje, datos) {
  const respuesta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODELO_IA,
      max_tokens: 400,
      system: INSTRUCCIONES_IA + armarContexto(datos),
      messages: [{ role: "user", content: mensaje }]
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!respuesta.ok) {
    throw new Error(`La IA respondió ${respuesta.status}`);
  }
  const cuerpo = await respuesta.json();
  const texto = cuerpo.content?.find((bloque) => bloque.type === "text")?.text?.trim();
  if (!texto) throw new Error("La IA no devolvió texto");
  return texto;
}
router.post("/", limitarPreguntas, async (req, res) => {
  const mensaje = typeof req.body?.mensaje === "string" ? req.body.mensaje.trim() : "";

  if (mensaje === "") {
    return res.status(400).json({ error: "Escribe tu pregunta" });
  }
  if (mensaje.length > 300) {
    return res.status(400).json({ error: "La pregunta es muy larga (máximo 300 caracteres)" });
  }
  const [materias, registros, actividadesDb] = await Promise.all([
    Materia.find().sort({ nivel: 1, orden: 1 }).select("-_id").lean(),
    EstadoMateria.find({ usuario: req.usuario.id }).lean(),
    Actividad.find({ usuario: req.usuario.id }).lean()
  ]);
  const estados = {};
  for (const registro of registros) estados[registro.materiaId] = registro.estado;
  const actividades = actividadesDb.map((a) => ({
    titulo: a.titulo,
    fecha: a.fecha,
    descripcion: a.descripcion
  }));
  const datos = { materias, estados, actividades };
  let texto = null;
  let origen = "reglas";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      texto = await responderConIA(mensaje, datos);
      origen = "ia";
    } catch (error) {
      console.error("IA no disponible, se usan las reglas:", error.message);
    }
  }
  if (texto === null) {
    texto = responder(mensaje, datos);
  }
  res.json({ respuesta: texto, origen });
});

module.exports = router;
