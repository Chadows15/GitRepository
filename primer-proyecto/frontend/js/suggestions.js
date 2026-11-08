const formSugerencias = document.getElementById("suggestion-form");
const estadoSugerencias = document.getElementById("suggestion-status");
const campoCorreo = document.getElementById("correo");
const campoMensaje = document.getElementById("mensaje");
const botonEnviar = formSugerencias.querySelector("button[type='submit']");

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formSugerencias.addEventListener("submit", async (evento) => {
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
  botonEnviar.disabled = true;
  estadoSugerencias.textContent = "Enviando...";
  try {
    const respuesta = await fetch(`${API_URL}/api/sugerencias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, mensaje })
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      estadoSugerencias.textContent = datos.error || "No se pudo enviar. Intenta de nuevo.";
      return;
    }
    estadoSugerencias.textContent = "¡Gracias por tu sugerencia!";
    formSugerencias.reset();
  } catch (error) {
    estadoSugerencias.textContent = "No se pudo conectar con el servidor. Intenta más tarde.";
  } finally {
    botonEnviar.disabled = false;
  }
});