
const formSugerencias = document.getElementById("suggestion-form");
const estadoSugerencias = document.getElementById("suggestion-status");
const campoCorreo = document.getElementById("correo");
const campoMensaje = document.getElementById("mensaje");

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formSugerencias.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const correo = campoCorreo.value.trim();
  const mensaje = campoMensaje.value.trim();

  if (!REGEX_CORREO.test(correo)) {
    estadoSugerencias.textContent = "Escribe un correo válido.";
    campoCorreo.focus();
    return;
  }
  if (mensaje.length < 10) {
    estadoSugerencias.textContent = "Tu mensaje debe tener al menos 10 caracteres.";
    campoMensaje.focus();
    return;
  }

  estadoSugerencias.textContent = "¡Gracias por tu sugerencia!";
  formSugerencias.reset();
});
