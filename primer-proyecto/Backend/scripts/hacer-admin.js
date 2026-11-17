const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const { conectar } = require("../db");
const Usuario = require("../models/Usuario");

async function main() {
  const correo = String(process.argv[2] ?? "").trim().toLowerCase();
  if (!correo) {
    throw new Error("Falta el correo. Uso: npm run admin -- tucorreo@ejemplo.com");
  }
  await conectar();
  const resultado = await Usuario.updateOne({ correo }, { rol: "admin" });
  if (resultado.matchedCount === 0) {
    throw new Error(`No existe ninguna cuenta con el correo ${correo}. Regístrate primero en la página.`);
  }
  console.log(`Listo: ${correo} ahora es administrador. Cierra sesión y vuelve a entrar.`);
  await mongoose.disconnect();
}
main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});