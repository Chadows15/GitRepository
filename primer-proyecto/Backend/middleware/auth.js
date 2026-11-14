const jwt = require("jsonwebtoken");
function requerirLogin(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Inicia sesión para continuar" });
  }
  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (error) {
    res.status(401).json({ error: "Tu sesión no es válida o venció. Inicia sesión otra vez" });
  }
}
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "No tienes permiso para esto" });
  }
  next();
}
module.exports = { requerirLogin, soloAdmin };