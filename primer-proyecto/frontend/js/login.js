const formLogin = document.getElementById("login-form");
const formRegistro = document.getElementById("register-form");
const botonAlternar = document.getElementById("toggle-form");
const textoAlternar = document.getElementById("switch-text");
const titulo = document.getElementById("auth-title");
const errorLogin = document.getElementById("login-error");
const errorRegistro = document.getElementById("register-error");

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar({ nombre, correo, contrasena }, pideNombre) {
  if (pideNombre && nombre.length < 2) {
    return "Escribe tu nombre (mínimo 2 letras).";
  }
  if (!REGEX_CORREO.test(correo)) {
    return "Escribe un correo válido, por ejemplo nombre@correo.com.";
  }
  if (contrasena.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return "";
}

function mostrarRegistro(mostrar) {
  formLogin.hidden = mostrar;
  formRegistro.hidden = !mostrar;
  titulo.textContent = mostrar ? "Crea tu cuenta" : "Bienvenido";
  textoAlternar.textContent = mostrar ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
  botonAlternar.textContent = mostrar ? "Iniciar sesión" : "Crear cuenta";
  errorLogin.textContent = "";
  errorRegistro.textContent = "";
}

async function enviar(ruta, cuerpo, formulario, zonaError) {
  const boton = formulario.querySelector("button[type='submit']");
  zonaError.textContent = "";
  boton.disabled = true;
  try {
    const datos = await pedirApi(ruta, { metodo: "POST", cuerpo, conSesion: false });
    guardarSesion({ token: datos.token, usuario: datos.usuario });
    window.location.href = "malla.html";
  } catch (error) {
    zonaError.textContent = error.message;
    boton.disabled = false;
  }
}

botonAlternar.addEventListener("click", () => {
  mostrarRegistro(formLogin.hidden === false);
});

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const correo = document.getElementById("login-email").value.trim();
  const contrasena = document.getElementById("login-password").value;
  const mensaje = validar({ nombre: "", correo, contrasena }, false);
  if (mensaje) {
    errorLogin.textContent = mensaje;
    return;
  }
  enviar("/api/auth/login", { correo, contrasena }, formLogin, errorLogin);
});

formRegistro.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = document.getElementById("reg-name").value.trim();
  const correo = document.getElementById("reg-email").value.trim();
  const contrasena = document.getElementById("reg-password").value;
  const mensaje = validar({ nombre, correo, contrasena }, true);
  if (mensaje) {
    errorRegistro.textContent = mensaje;
    return;
  }
  enviar("/api/auth/registro", { nombre, correo, contrasena }, formRegistro, errorRegistro);
});

if (leerSesion() !== null) {
  window.location.replace("malla.html");
}