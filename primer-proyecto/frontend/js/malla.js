const ESTADOS = ["pendiente", "cursando", "aprobada"];
const ETIQUETAS = { pendiente: "Pendiente", cursando: "Cursando", aprobada: "Aprobada" };

const sesion = leerSesion();

if (sesion === null) {
  window.location.replace("login.html");
} else {
  iniciar(sesion);
}

async function iniciar(sesion) {
  const zonaMensaje = document.getElementById("app-message");
  const contenedorMalla = document.getElementById("malla");
  function mostrarMensaje(texto) {
    zonaMensaje.textContent = texto;
  }
  document.getElementById("user-name").textContent = `Hola, ${sesion.usuario.nombre}`;
  document.getElementById("logout").addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
  });
  let malla;
  let estados;
  let actividades;

  try {
    const [mallaServidor, progreso, actividadesServidor] = await Promise.all([
      pedirApi("/api/malla", { conSesion: false }),
      pedirApi("/api/progreso"),
      pedirApi("/api/actividades")
    ]);
    malla = mallaServidor;
    estados = progreso.estados;
    actividades = actividadesServidor;
  } catch (error) {
    mostrarMensaje(`No se pudieron cargar tus datos: ${error.message}`);
    return;
  }

  if (malla.length === 0) {
    mostrarMensaje("La malla está vacía. Ejecuta «npm run seed» en la carpeta backend.");
  }

  function estadoDe(idMateria) {
    return estados[idMateria] || "pendiente";
  }

  function pintarEstado(tarjeta, boton, materia) {
    const estado = estadoDe(materia.id);
    tarjeta.dataset.status = estado;
    boton.textContent = ETIQUETAS[estado];
    boton.setAttribute(
      "aria-label",
      `${materia.nombre}: ${ETIQUETAS[estado]}. Pulsa para cambiar el estado.`
    );
  }

  function crearTarjeta(materia) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "course";
    const nombre = document.createElement("h3");
    nombre.textContent = materia.nombre;
    tarjeta.append(nombre);
    const partesInfo = [];
    if (materia.codigo) partesInfo.push(materia.codigo);
    if (materia.creditos !== null) {
      partesInfo.push(`${materia.creditos} ${materia.creditos === 1 ? "crédito" : "créditos"}`);
    }
    if (partesInfo.length > 0) {
      const info = document.createElement("p");
      info.textContent = partesInfo.join(" · ");
      tarjeta.append(info);
    }
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "status-btn";
    tarjeta.append(boton);
    pintarEstado(tarjeta, boton, materia);
    boton.addEventListener("click", async () => {
      const anterior = estadoDe(materia.id);
      const siguiente = ESTADOS[(ESTADOS.indexOf(anterior) + 1) % ESTADOS.length];
      estados[materia.id] = siguiente;
      pintarEstado(tarjeta, boton, materia);
      actualizarResumen();
      boton.disabled = true;
      try {
        await pedirApi(`/api/progreso/${materia.id}`, { metodo: "PUT", cuerpo: { estado: siguiente } });
        mostrarMensaje("");
      } catch (error) {
        estados[materia.id] = anterior;
        pintarEstado(tarjeta, boton, materia);
        actualizarResumen();
        mostrarMensaje(`No se pudo guardar el cambio: ${error.message}`);
      } finally {
        boton.disabled = false;
      }
    });
    return tarjeta;
  }

  function dibujarMalla() {
    contenedorMalla.replaceChildren();
    for (const nivel of malla) {
      const columna = document.createElement("div");
      columna.className = "semester";
      const tituloNivel = document.createElement("h2");
      tituloNivel.textContent = nivel.nombre;
      columna.append(tituloNivel);
      for (const materia of nivel.materias) {
        columna.append(crearTarjeta(materia));
      }
      contenedorMalla.append(columna);
    }
  }

  function actualizarResumen() {
    const cuenta = { pendiente: 0, cursando: 0, aprobada: 0 };
    for (const nivel of malla) {
      for (const materia of nivel.materias) {
        cuenta[estadoDe(materia.id)]++;
      }
    }
    document.getElementById("count-aprobadas").textContent = cuenta.aprobada;
    document.getElementById("count-cursando").textContent = cuenta.cursando;
    document.getElementById("count-pendientes").textContent = cuenta.pendiente;
  }

  const formActividad = document.getElementById("activity-form");
  const listaActividades = document.getElementById("activity-list");
  const campoTitulo = document.getElementById("activity-title");
  const campoFecha = document.getElementById("activity-date");
  const campoDescripcion = document.getElementById("activity-description");

  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  function dibujarActividades() {
    listaActividades.replaceChildren();
    if (actividades.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "activity-empty";
      vacio.textContent = "Todavía no tienes actividades.";
      listaActividades.append(vacio);
      return;
    }
    const ordenadas = [...actividades].sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });
    for (const actividad of ordenadas) {
      const item = document.createElement("li");
      item.className = "activity";
      const texto = document.createElement("div");
      const tituloActividad = document.createElement("strong");
      tituloActividad.textContent = actividad.titulo;
      const fecha = document.createElement("small");
      fecha.textContent = formatearFecha(actividad.fecha);
      texto.append(tituloActividad, fecha);
      if (actividad.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.textContent = actividad.descripcion;
        texto.append(descripcion);
      }
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "delete-btn";
      borrar.textContent = "Eliminar";
      borrar.setAttribute("aria-label", `Eliminar la actividad ${actividad.titulo}`);
      borrar.addEventListener("click", async () => {
        borrar.disabled = true;
        try {
          await pedirApi(`/api/actividades/${actividad.id}`, { metodo: "DELETE" });
          actividades = actividades.filter((a) => a.id !== actividad.id);
          mostrarMensaje("");
          dibujarActividades();
        } catch (error) {
          borrar.disabled = false;
          mostrarMensaje(`No se pudo eliminar: ${error.message}`);
        }
      });
      item.append(texto, borrar);
      listaActividades.append(item);
    }
  }

  formActividad.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const titulo = campoTitulo.value.trim();
    if (titulo === "") {
      campoTitulo.focus();
      return;
    }
    const botonAgregar = formActividad.querySelector("button[type='submit']");
    botonAgregar.disabled = true;
    try {
      const nueva = await pedirApi("/api/actividades", {
        metodo: "POST",
        cuerpo: { titulo, fecha: campoFecha.value, descripcion: campoDescripcion.value.trim() }
      });
      actividades.push(nueva);
      formActividad.reset();
      mostrarMensaje("");
      dibujarActividades();
    } catch (error) {
      mostrarMensaje(`No se pudo guardar la actividad: ${error.message}`);
    } finally {
      botonAgregar.disabled = false;
    }
  });
  dibujarMalla();
  actualizarResumen();
  dibujarActividades();
}