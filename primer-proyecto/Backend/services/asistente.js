// services/asistente.js: el asistente de la malla, hecho con reglas (sin claves ni servicios externos).
//
// Recibe una pregunta en texto y devuelve una respuesta en texto. Entiende preguntas sobre:
//   - la malla (créditos, horas, nivel y código de una materia; materias de un nivel; totales)
//   - el avance del estudiante (aprobadas, cursando, pendientes, porcentaje)
//   - sus actividades (todas o la próxima)
//
// No inventa datos: si algo no está cargado (los prerrequisitos), lo dice.

const URL_MALLA_OFICIAL = "https://mallacurricular.espol.edu.ec/Malla/Imagen?codCarrera=CI013";

/* ---------- Utilidades de texto ---------- */

// "¿Cuántos CRÉDITOS?" -> "cuantos creditos"  (minúsculas, sin tildes ni signos)
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Palabras que no ayudan a reconocer una materia.
const PALABRAS_VACIAS = new Set(
  ("de la el los las un una unos unas y o en que cual cuales cuanto cuantos cuanta cuantas " +
    "tiene tienen tengo hay es son del al para por con mi mis me se lo le como donde dime dame " +
    "sobre acerca hablame habla informacion info materia materias asignatura asignaturas curso " +
    "cursos nivel niveles semestre credito creditos hora horas codigo quiero saber puedes decir " +
    "dar ver mostrar muestrame lista listame esta este esa ese estoy soy voy carrera malla " +
    "estan ya si no mas muy").split(" ")
);

function palabrasClave(textoNormalizado) {
  return [...new Set(textoNormalizado.split(" "))].filter(
    (p) => p.length >= 3 && !PALABRAS_VACIAS.has(p)
  );
}

function dos(n) {
  return String(Number(n.toFixed(2)));
}

function plural(n, singular, pluralTexto) {
  return n === 1 ? singular : pluralTexto;
}

function formatearFecha(fecha) {
  if (!fecha) return "sin fecha";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

// "Hoy" en Ecuador (YYYY-MM-DD), para saber cuál es la próxima actividad.
function hoyEcuador() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(new Date());
}

const ETIQUETAS = { pendiente: "Pendiente", cursando: "Cursando", aprobada: "Aprobada" };
const ROMANOS = { 1: "i", 2: "ii", 3: "iii", 4: "iv", 5: "v" };

/* ---------- Buscar materias y niveles en la pregunta ---------- */

// Devuelve las materias que la pregunta menciona (0, 1 o varias).
function buscarMaterias(q, materias) {
  // "ingles 3" -> "ingles iii"
  const texto = q.replace(/\bingles ([1-5])\b/, (_, n) => `ingles ${ROMANOS[n]}`);

  // 1) Por código: "ccpg1043"
  const codigos = texto.match(/\b[a-z]{4}\d{4}\b/g) || [];
  const porCodigo = materias.filter((m) => m.codigo && codigos.includes(m.codigo.toLowerCase()));
  if (porCodigo.length > 0) return porCodigo;

  // 2) Por nombre completo ("ingles ii" no se confunde con "ingles i")
  const porNombre = materias.filter((m) => {
    const nombre = normalizar(m.nombre);
    return new RegExp(`(^| )${nombre}( |$)`).test(texto);
  });
  if (porNombre.length > 0) {
    const mayor = Math.max(...porNombre.map((m) => m.nombre.length));
    return porNombre.filter((m) => m.nombre.length === mayor);
  }

  // 3) Por palabras sueltas: "estructuras", "bases de datos", "inteligencia"...
  const claves = palabrasClave(texto);
  if (claves.length === 0) return [];

  const puntuadas = materias.map((m) => {
    const palabrasNombre = palabrasClave(normalizar(m.nombre));
    let puntos = 0;
    for (const clave of claves) {
      if (palabrasNombre.includes(clave)) {
        puntos += 2; // la palabra está tal cual
      } else if (
        clave.length >= 5 &&
        palabrasNombre.some((p) => p.length >= 5 && p.slice(0, 5) === clave.slice(0, 5))
      ) {
        puntos += 1; // misma raíz: "programar" ~ "programación"
      }
    }
    return { materia: m, puntos };
  });

  const mejor = Math.max(...puntuadas.map((p) => p.puntos));
  if (mejor === 0) return [];
  return puntuadas.filter((p) => p.puntos === mejor).map((p) => p.materia);
}

const ORDINALES = { primer: 1, segundo: 2, tercer: 3, cuarto: 4, quinto: 5, sexto: 6, septimo: 7, octavo: 8 };

// Devuelve el número de nivel (1 a 8) que menciona la pregunta, o null.
// Acepta: "N200-I", "nivel 3", "tercer nivel", "semestre 5".
function buscarNivel(q, niveles) {
  const codigo = q.match(/\bn([1-4])00 ?(ii|i)\b/);
  if (codigo) {
    const nombre = `N${codigo[1]}00-${codigo[2].toUpperCase()}`;
    const nivel = niveles.find((n) => n.nombre === nombre);
    if (nivel) return nivel.nivel;
  }
  const numero = q.match(/\b(?:nivel|semestre) ([1-8])\b/);
  if (numero) return Number(numero[1]);
  const ordinal = q.match(/\b(primer|segundo|tercer|cuarto|quinto|sexto|septimo|octavo) (?:nivel|semestre)\b/);
  if (ordinal) return ORDINALES[ordinal[1]];
  return null;
}

/* ---------- El asistente ---------- */

const SUGERENCIAS_TEXTO =
  "Prueba con preguntas como:\n" +
  "- ¿Cuántos créditos tiene Estructuras de datos?\n" +
  "- ¿Qué materias hay en N200-I?\n" +
  "- ¿Cuánto llevo aprobado?\n" +
  "- ¿Qué estoy cursando?\n" +
  "- ¿Qué actividades tengo?";

// materias:    lista plana [{ id, codigo, nombre, horas, creditos, prerrequisitos, nivel, nivelNombre }]
// estados:     { "n1-1": "aprobada", ... }  (las que faltan están pendientes)
// actividades: [{ titulo, fecha, descripcion }]
function responder(pregunta, { materias, estados = {}, actividades = [] }) {
  const q = normalizar(pregunta);
  const estadoDe = (m) => estados[m.id] || "pendiente";
  const creditosDe = (lista) => lista.reduce((suma, m) => suma + (m.creditos || 0), 0);
  const descripcion = (m) => `${m.nombre} (${m.nivelNombre})`;

  const niveles = [];
  for (const m of materias) {
    if (!niveles.some((n) => n.nivel === m.nivel)) niveles.push({ nivel: m.nivel, nombre: m.nivelNombre });
  }

  const aprobadas = materias.filter((m) => estadoDe(m) === "aprobada");
  const cursando = materias.filter((m) => estadoDe(m) === "cursando");
  const pendientes = materias.filter((m) => estadoDe(m) === "pendiente");
  const totalCreditos = creditosDe(materias);

  if (q === "") return SUGERENCIAS_TEXTO;

  // --- Saludos y cortesía
  if (/^(hola|buenas|buenos dias|buen dia|hey|saludos)\b/.test(q) && q.split(" ").length <= 4) {
    return "¡Hola! Soy el asistente de tu malla de Computación. Puedo decirte créditos, horas y nivel de cada materia, y cómo vas de avance.\n\n" + SUGERENCIAS_TEXTO;
  }
  if (/\bgracias\b/.test(q)) return "¡De nada! Si necesitas algo más de tu malla, pregúntame.";
  if (/(quien eres|como te llamas|quien te (creo|hizo))/.test(q)) {
    return "Soy el asistente de UniLendar, creado por Samuel Teran para resolver dudas sobre la malla de Ingeniería en Ciencias de la Computación y tu avance.";
  }
  if (/(\bayuda\b|que puedes|que sabes|que haces|como funcionas)/.test(q)) return SUGERENCIAS_TEXTO;

  // --- Actividades
  if (/(actividad|tarea|entrega|agenda)/.test(q)) {
    if (actividades.length === 0) {
      return "No tienes actividades registradas. Agrégalas en el panel «Mis actividades» de esta página.";
    }
    const ordenadas = [...actividades].sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });
    if (/(proxima|siguiente|primera|mas cercana)/.test(q)) {
      const hoy = hoyEcuador();
      const proxima = ordenadas.find((a) => a.fecha && a.fecha >= hoy);
      if (!proxima) return "No tienes actividades próximas con fecha. Puedes agregar una en «Mis actividades».";
      const extra = proxima.descripcion ? `\n${proxima.descripcion}` : "";
      return `Tu próxima actividad es «${proxima.titulo}», el ${formatearFecha(proxima.fecha)}.${extra}`;
    }
    const lineas = ordenadas.slice(0, 6).map((a) => `- ${formatearFecha(a.fecha)} · ${a.titulo}`);
    const resto = ordenadas.length - lineas.length;
    const cola = resto > 0 ? `\n…y ${resto} más.` : "";
    return `Tienes ${ordenadas.length} ${plural(ordenadas.length, "actividad", "actividades")}:\n${lineas.join("\n")}${cola}`;
  }

  if (/(cursando|que curso|estoy tomando)/.test(q)) {
    if (cursando.length === 0) {
      return "No tienes materias marcadas como «Cursando». Puedes marcarlas en tu malla con el botón de estado de cada materia.";
    }
    return `Estás cursando ${cursando.length} ${plural(cursando.length, "materia", "materias")} (${dos(creditosDe(cursando))} créditos):\n` +
      cursando.map((m) => `- ${descripcion(m)}`).join("\n");
  }
  if (/(falta|faltan|por cursar|me queda|quedan|por aprobar|pendiente)/.test(q)) {
    if (pendientes.length === 0) return "¡No te queda nada pendiente! Todas tus materias están aprobadas o en curso.";
    const siguientes = pendientes.slice(0, 6).map((m) => `- ${descripcion(m)}`).join("\n");
    const resto = pendientes.length - Math.min(pendientes.length, 6);
    return `Te faltan ${pendientes.length} ${plural(pendientes.length, "materia", "materias")} por empezar (${dos(creditosDe(pendientes))} créditos). Las que siguen en tu malla:\n${siguientes}` +
      (resto > 0 ? `\n…y ${resto} más.` : "");
  }
  if (/(avance|progreso|porcentaje|cuanto llevo|llevo|como voy)/.test(q)) {
    const porcentaje = totalCreditos > 0 ? Math.round((creditosDe(aprobadas) / totalCreditos) * 100) : 0;
    return `Llevas ${aprobadas.length} de ${materias.length} materias aprobadas: ${dos(creditosDe(aprobadas))} de ${dos(totalCreditos)} créditos (${porcentaje}%).\n` +
      `Cursando: ${cursando.length}. Pendientes: ${pendientes.length}.`;
  }
  if (/(aprobad|aprobe|he pasado|ya pase|terminad|completad)/.test(q)) {
    if (aprobadas.length === 0) {
      return "Todavía no tienes materias aprobadas. Márcalas en tu malla pulsando el botón de estado de cada una.";
    }
    const lista = aprobadas.slice(0, 10).map((m) => `- ${m.nombre}`).join("\n");
    const resto = aprobadas.length - Math.min(aprobadas.length, 10);
    return `Tienes ${aprobadas.length} ${plural(aprobadas.length, "materia aprobada", "materias aprobadas")} (${dos(creditosDe(aprobadas))} créditos):\n${lista}` +
      (resto > 0 ? `\n…y ${resto} más.` : "");
  }
  if (/(cuantos|cuantas|total)/.test(q) && /(carrera|malla|en total|totales|\btotal\b)/.test(q) && /credito/.test(q)) {
    return `La malla tiene ${dos(totalCreditos)} créditos en total, repartidos en ${materias.length} materias y ${niveles.length} niveles.`;
  }
  if (/(cuantas|cuantos)/.test(q) && /(materias|niveles|semestres)/.test(q) && !buscarNivel(q, niveles)) {
    return `La malla tiene ${materias.length} materias repartidas en ${niveles.length} niveles (de ${niveles[0].nombre} a ${niveles[niveles.length - 1].nombre}).`;
  }
  const numeroNivel = buscarNivel(q, niveles);
  if (numeroNivel !== null) {
    const delNivel = materias.filter((m) => m.nivel === numeroNivel);
    if (delNivel.length === 0) return `No encontré el nivel ${numeroNivel} en la malla.`;
    const lineas = delNivel.map((m) => `- ${m.nombre} · ${m.creditos} ${plural(m.creditos, "crédito", "créditos")} · ${ETIQUETAS[estadoDe(m)]}`);
    return `${delNivel[0].nivelNombre} tiene ${delNivel.length} materias (${dos(creditosDe(delNivel))} créditos):\n${lineas.join("\n")}`;
  }
  if (/(itinerarios|que itinerario|cuales itinerario)/.test(q)) {
    return "En 7.º y 8.º nivel eliges dos itinerarios (Itinerario I e Itinerario II, 3 créditos cada uno).\n" +
      "Algunos que conozco: Gestión y analítica de datos (TICG1019, CCPG1047) y Multimedia (CCPG1040, CCPG1050).\n" +
      `No tengo la lista completa cargada; confírmala en la malla oficial: ${URL_MALLA_OFICIAL}`;
  }
  if (/(prerrequisit|prerequisit|correquisit|requisito|requiere|previa)/.test(q)) {
    const encontradas = buscarMaterias(q, materias);
    if (encontradas.length === 1 && encontradas[0].prerrequisitos.length > 0) {
      const m = encontradas[0];
      const nombres = m.prerrequisitos.map((id) => materias.find((x) => x.id === id || x.codigo === id)?.nombre || id);
      return `Para ${m.nombre} necesitas: ${nombres.join(", ")}.`;
    }
    const de = encontradas.length === 1 ? ` de ${encontradas[0].nombre}` : "";
    return `Todavía no tengo cargados los prerrequisitos${de}. Consúltalos en la malla oficial de ESPOL: ${URL_MALLA_OFICIAL}`;
  }
  const encontradas = buscarMaterias(q, materias);
  if (encontradas.length === 1) {
    const m = encontradas[0];
    return [
      m.nombre,
      `Código: ${m.codigo || "sin código"}`,
      `Nivel: ${m.nivelNombre}`,
      `Créditos: ${m.creditos} · Horas: ${m.horas}`,
      `Tu estado: ${ETIQUETAS[estadoDe(m)]}`
    ].join("\n");
  }
  if (encontradas.length > 1 && encontradas.length <= 6) {
    return `Encontré ${encontradas.length} materias que coinciden. ¿Cuál quieres?\n` +
      encontradas.map((m) => `- ${descripcion(m)}`).join("\n");
  }
  if (encontradas.length > 6) {
    return "Eso coincide con muchas materias. ¿Puedes ser más específico? Por ejemplo, escribe el nombre completo o el código.";
  }

  return "No estoy seguro de haber entendido tu pregunta.\n\n" + SUGERENCIAS_TEXTO;
}

module.exports = { responder, normalizar, buscarMaterias };
