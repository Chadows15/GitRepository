const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const { conectar } = require("../db");
const Materia = require("../models/materia");
const malla = require("../data/malla.json");

async function main() {
  await conectar();

  const operaciones = [];
  for (const nivel of malla) {
    nivel.materias.forEach((materia, indice) => {
      operaciones.push({
        updateOne: {
          filter: { id: materia.id },
          update: {
            $set: {
              ...materia,
              nivel: nivel.nivel,
              nivelNombre: nivel.nombre,
              orden: indice + 1
            }
          },
          upsert: true
        }
      });
    });
  }

  const resultado = await Materia.bulkWrite(operaciones);
  const total = await Materia.countDocuments();
  console.log(
    `Listo. Materias nuevas: ${resultado.upsertedCount}, actualizadas: ${resultado.modifiedCount}. Total en la base: ${total}`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error al cargar la malla:", error.message);
  process.exit(1);
});