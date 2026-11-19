# UniLendar

Calendario y malla académica para estudiantes universitarios. Cada estudiante crea su cuenta, ve la malla de Ingeniería en Ciencias de la Computación, marca el estado de cada materia (pendiente, cursando, aprobada) y registra sus actividades. Incluye un asistente que responde dudas sobre la malla y el avance, y un panel de administración.

Proyecto final de Jóvenes creaTIvos, desarrollado por Samuel Teran.

# Enlaces
| | Dirección |
| Página publicada (Netlify) | https://unilendar.netlify.app/ |
| Servidor / API (Render) | https://gitrepository-j202.onrender.com/ |
| Repositorio | https://github.com/Chadows15/GitRepository.git |

# Qué se puede hacer
- *Ver la malla* completa: 8 niveles y 45 materias, con código, créditos y horas.
- *Crear una cuenta e iniciar sesión.* Cada estudiante ve solo su propio progreso.
- *Marcar el estado de cada materia* con un clic (pendiente → cursando → aprobada) y ver el resumen de avance.
- *Registrar actividades* (nombre, fecha y descripción) y eliminarlas.
- *Preguntar al asistente*, por ejemplo: «¿Cuánto llevo aprobado?», «¿Qué materias hay en N200-I?», «¿Cuántos créditos tiene Estructuras de datos?».
- *Enviar sugerencias* desde el formulario de contacto de la página principal.
- *Panel de administrador:* totales, sugerencias recibidas (con opción de eliminarlas) y lista de usuarios.
- *Diseño responsive:* se adapta a computador, tablet y celular.

# Tecnologías

| Parte | Tecnología |
| Frontend | HTML, CSS y JavaScript |
| Servidor | Node.js y Express |
| Base de datos | MongoDB Atlas con Mongoose |
| Cuentas | bcryptjs (contraseñas cifradas) y JWT (sesión) |
| Seguridad | CORS por lista de dominios, límite de intentos (express-rate-limit), validación en el servidor |
| Publicación | Netlify (frontend) y Render (backend) |

# Estructura
backend/
  server.js            Punto de entrada: conecta a MongoDB y enciende el servidor
  app.js               Configura Express (CORS, rutas, errores, archivos estáticos)
  db.js                Conexión a MongoDB
  models/              Materia, Usuario, EstadoMateria, Actividad, Sugerencia
  routes/              malla, auth, progreso, actividades, sugerencias, admin, chatbot
  middleware/auth.js   Verificación del token y del rol de administrador
  services/asistente.js  Motor de respuestas del asistente
  scripts/             seed.js (carga la malla) y hacer-admin.js
  data/malla.json      Datos de la malla
frontend/
  index.html           Página principal y formulario de contacto
  pages/               login.html, malla.html, admin.html
  css/                 styles.css y pages.css
  js/                  config.js, api.js, login.js, malla.js, admin.js, chatbot.js, suggestions.js
  Imgs/                Imágenes

# Autor
Samuel Teran · github.com/Chadows15 : (https://github.com/Chadows15)
