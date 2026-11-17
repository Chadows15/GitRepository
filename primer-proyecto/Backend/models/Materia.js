const mongoose = require("mongoose");

const materiaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    codigo: { type: String, default: null },
    nombre: { type: String, required: true, trim: true },
    horas: { type: Number, required: true },
    creditos: { type: Number, default: null },
    prerrequisitos: { type: [String], default: [] },
    nivel: { type: Number, required: true },
    nivelNombre: { type: String, required: true },
    orden: { type: Number, required: true }
  },
  {
    id: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Materia", materiaSchema);