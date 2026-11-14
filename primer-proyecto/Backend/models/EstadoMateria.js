const mongoose = require("mongoose");
const estadoMateriaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    materiaId: { type: String, required: true },
    estado: { type: String, enum: ["pendiente", "cursando", "aprobada"], required: true }
  },
  { versionKey: false }
);
estadoMateriaSchema.index({ usuario: 1, materiaId: 1 }, { unique: true });

module.exports = mongoose.model("EstadoMateria", estadoMateriaSchema);