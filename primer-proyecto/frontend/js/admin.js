const sesion = leerSesion();

if (sesion === null) {
  window.location.replace("login.html");
} else if (sesion.usuario.rol !== "admin") {
  window.location.replace("malla.html");
} else {
  iniciar(sesion);
}
async function iniciar(sesion) {
  const zonaMensaje = document.getElementById("app-message");
  const listaSugerencias = document.getElementById("suggestion-list");
  const tablaUsuarios = document.getElementById("user-table");
  document.getElementById("user-name").textContent = `Hola, ${sesion.usuario.nombre}`;
  document.getElementById("logout").addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
  });
  function mostrarMensaje(texto) {
    zonaMensaje.textContent = texto;
  }
  function formatearFecha(iso) {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
  }
  let sugerencias;
  let usuarios;
  try {
    const [resumen, listaSug, listaUsu] = await Promise.all([
      pedirApi("/api/admin/resumen"),
      pedirApi("/api/admin/sugerencias"),
      pedirApi("/api/admin/usuarios")
    ]);
    document.getElementById("count-usuarios").textContent = resumen.usuarios;
    document.getElementById("count-sugerencias").textContent = resumen.sugerencias;
    document.getElementById("count-actividades").textContent = resumen.actividades;
    sugerencias = listaSug;
    usuarios = listaUsu;
  } catch (error) {
    mostrarMensaje(`No se pudo cargar el panel: ${error.message}`);
    return;
  }
  function dibujarSugerencias() {
    listaSugerencias.replaceChildren();
    document.getElementById("count-sugerencias").textContent = sugerencias.length;
    if (sugerencias.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "activity-empty";
      vacio.textContent = "Todavía no hay sugerencias.";
      listaSugerencias.append(vacio);
      return;
    }
    for (const sugerencia of sugerencias) {
      const item = document.createElement("li");
      item.className = "suggestion";
      const texto = document.createElement("div");
      const correo = document.createElement("strong");
      correo.textContent = sugerencia.correo;
      const fecha = document.createElement("small");
      fecha.textContent = formatearFecha(sugerencia.fecha);
      const mensaje = document.createElement("p");
      mensaje.textContent = sugerencia.mensaje;
      texto.append(correo, fecha, mensaje);
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "delete-btn";
      borrar.textContent = "Eliminar";
      borrar.setAttribute("aria-label", `Eliminar la sugerencia de ${sugerencia.correo}`);
      borrar.addEventListener("click", async () => {
        borrar.disabled = true;
        try {
          await pedirApi(`/api/admin/sugerencias/${sugerencia.id}`, { metodo: "DELETE" });
          sugerencias = sugerencias.filter((s) => s.id !== sugerencia.id);
          mostrarMensaje("");
          dibujarSugerencias();
        } catch (error) {
          borrar.disabled = false;
          mostrarMensaje(`No se pudo eliminar: ${error.message}`);
        }
      });
      item.append(texto, borrar);
      listaSugerencias.append(item);
    }
  }
  function dibujarUsuarios() {
    tablaUsuarios.replaceChildren();
    for (const usuario of usuarios) {
      const fila = document.createElement("tr");
      for (const valor of [usuario.nombre, usuario.correo, usuario.rol, formatearFecha(usuario.creado)]) {
        const celda = document.createElement("td");
        celda.textContent = valor;
        fila.append(celda);
      }
      tablaUsuarios.append(fila);
    }
  }
  dibujarSugerencias();
  dibujarUsuarios();
}