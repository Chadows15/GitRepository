
const CLAVE_SESION = "unilendar.sesion";
const ESTADOS = ["pendiente", "cursando", "aprobada"];
const ETIQUETAS = { pendiente: "Pendiente", cursando: "Cursando", aprobada: "Aprobada" };

function leer(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? valorPorDefecto : JSON.parse(texto);
  } catch (error) {
    return valorPorDefecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
  
  }
}

const sesion = leer(CLAVE_SESION, null);
if (sesion === null) {
  window.location.replace("login.html");
} else {
  iniciar(sesion);
}
function iniciar(sesion) {
  const claveEstados = `unilendar.estados.${sesion.correo}`;
  const claveActividades = `unilendar.actividades.${sesion.correo}`;
  let estados = leer(claveEstados, {});
  let actividades = leer(claveActividades, []);
  const contenedorMalla = document.getElementById("malla");
  function estadoDe(idMateria) {
    return estados[idMateria] || "pendiente";
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
    boton.addEventListener("click", () => {
      const actual = ESTADOS.indexOf(estadoDe(materia.id));
      estados[materia.id] = ESTADOS[(actual + 1) % ESTADOS.length];
      guardar(claveEstados, estados);
      pintarEstado(tarjeta, boton, materia);
      actualizarResumen();
    });
    return tarjeta;
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
  function dibujarMalla() {
    contenedorMalla.replaceChildren();
    for (const nivel of MALLA) {
      const columna = document.createElement("div");
      columna.className = "semester";
      const titulo = document.createElement("h2");
      titulo.textContent = nivel.nombre;
      columna.append(titulo);
      for (const materia of nivel.materias) {
        columna.append(crearTarjeta(materia));
      }
      contenedorMalla.append(columna);
    }
  }
  function actualizarResumen() {
    const cuenta = { pendiente: 0, cursando: 0, aprobada: 0 };
    for (const nivel of MALLA) {
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
      const titulo = document.createElement("strong");
      titulo.textContent = actividad.titulo;
      const fecha = document.createElement("small");
      fecha.textContent = formatearFecha(actividad.fecha);
      texto.append(titulo, fecha);
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
      borrar.addEventListener("click", () => {
        actividades = actividades.filter((a) => a.id !== actividad.id);
        guardar(claveActividades, actividades);
        dibujarActividades();
      });
      item.append(texto, borrar);
      listaActividades.append(item);
    }
  }
  formActividad.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const titulo = campoTitulo.value.trim();
    if (titulo === "") {
      campoTitulo.focus();
      return;
    }
    actividades.push({
      id: Date.now(),
      titulo,
      fecha: campoFecha.value,
      descripcion: campoDescripcion.value.trim()
    });
    guardar(claveActividades, actividades);
    formActividad.reset();
    dibujarActividades();
  });
  document.getElementById("logout").addEventListener("click", () => {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (error) {}
    window.location.href = "login.html";
  });
  dibujarMalla();
  actualizarResumen();
  dibujarActividades();
}
