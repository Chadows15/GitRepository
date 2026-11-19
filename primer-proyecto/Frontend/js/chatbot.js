// chatbot.js: el asistente flotante de malla.html.
// Necesita cargados antes: config.js y api.js (pedirApi, leerSesion).
//
// Todo va dentro de una función para no chocar con los nombres de malla.js.
// Los mensajes se escriben con textContent (nunca innerHTML), así que nada se ejecuta como código.

(function iniciarChat() {
  const sesion = leerSesion();
  if (sesion === null) return; // malla.js ya se encarga de mandar al login

  const botonAbrir = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const botonCerrar = document.getElementById("chat-close");
  const registro = document.getElementById("chat-log");
  const zonaSugerencias = document.getElementById("chat-chips");
  const formulario = document.getElementById("chat-form");
  const campo = document.getElementById("chat-input");
  const botonEnviar = formulario.querySelector("button[type='submit']");

  const PREGUNTAS_SUGERIDAS = [
    "¿Cuánto llevo aprobado?",
    "¿Qué estoy cursando?",
    "¿Qué materias hay en N200-I?",
    "¿Cuántos créditos tiene Estructuras de datos?",
    "¿Qué actividades tengo?"
  ];

  let saludado = false;
  let esperando = false;

  function agregarMensaje(texto, quien) {
    const burbuja = document.createElement("div");
    burbuja.className = `chat-msg chat-${quien}`;
    burbuja.textContent = texto;
    registro.append(burbuja);
    registro.scrollTop = registro.scrollHeight;
    return burbuja;
  }

  function abrir() {
    panel.hidden = false;
    botonAbrir.setAttribute("aria-expanded", "true");
    if (!saludado) {
      saludado = true;
      const primerNombre = sesion.usuario.nombre.split(" ")[0];
      agregarMensaje(
        `Hola, ${primerNombre}. Soy el asistente de tu malla. Pregúntame por una materia, un nivel o tu avance.`,
        "bot"
      );
    }
    campo.focus();
  }

  function cerrar() {
    panel.hidden = true;
    botonAbrir.setAttribute("aria-expanded", "false");
    botonAbrir.focus();
  }

  async function preguntar(texto) {
    const pregunta = texto.trim();
    if (pregunta === "" || esperando) return;

    esperando = true;
    botonEnviar.disabled = true;
    agregarMensaje(pregunta, "user");
    campo.value = "";
    const pensando = agregarMensaje("Escribiendo…", "bot");

    try {
      const datos = await pedirApi("/api/chatbot", { metodo: "POST", cuerpo: { mensaje: pregunta } });
      pensando.textContent = datos.respuesta;
    } catch (error) {
      pensando.textContent = `No pude responder: ${error.message}`;
    } finally {
      esperando = false;
      botonEnviar.disabled = false;
      registro.scrollTop = registro.scrollHeight;
      campo.focus();
    }
  }

  for (const pregunta of PREGUNTAS_SUGERIDAS) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chat-chip";
    chip.textContent = pregunta;
    chip.addEventListener("click", () => preguntar(pregunta));
    zonaSugerencias.append(chip);
  }

  botonAbrir.addEventListener("click", () => (panel.hidden ? abrir() : cerrar()));
  botonCerrar.addEventListener("click", cerrar);
  panel.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrar();
  });
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    preguntar(campo.value);
  });
})();
