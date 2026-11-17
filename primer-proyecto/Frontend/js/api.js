const CLAVE_SESION = "unilendar.sesion";

class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.estado = estado;
  }
}

function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
    return sesion && sesion.token ? sesion : null;
  } catch (error) {
    return null;
  }
}

function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch (error) {
  }
}

function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch (error) {
  }
}
async function pedirApi(ruta, { metodo = "GET", cuerpo, conSesion = true } = {}) {
  const cabeceras = {};
  if (cuerpo !== undefined) {
    cabeceras["Content-Type"] = "application/json";
  }
  if (conSesion) {
    const sesion = leerSesion();
    if (sesion) cabeceras.Authorization = `Bearer ${sesion.token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
    });
  } catch (error) {
    throw new ErrorApi("No se pudo conectar con el servidor. Intenta más tarde.", 0);
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    if (respuesta.status === 401 && conSesion) {
      cerrarSesion();
      window.location.replace("login.html");
    }
    throw new ErrorApi(datos.error || "Ocurrió un error. Intenta de nuevo.", respuesta.status);
  }
  return datos;
}