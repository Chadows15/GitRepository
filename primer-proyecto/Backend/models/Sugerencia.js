const mongoose = require("mongoose");

const sugerenciaSchema = new mongoose.Schema(
  {
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo no válido"]
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    fecha: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model("Sugerencia", sugerenciaSchema);