const mongoose = require("mongoose");

const actividadSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    titulo: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    fecha: { type: String, default: "", match: [/^(\d{4}-\d{2}-\d{2})?$/, "Fecha no válida"] },
    descripcion: { type: String, default: "", trim: true, maxlength: 500 },
    creada: { type: Date, default: Date.now }
  },
  { versionKey: false }
);
module.exports = mongoose.model("Actividad", actividadSchema);