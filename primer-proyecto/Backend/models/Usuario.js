const mongoose = require("mongoose");
const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    correo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo no válido"]
    },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ["estudiante", "admin"], default: "estudiante" },
    creado: { type: Date, default: Date.now }
  },
  { versionKey: false }
);
module.exports = mongoose.model("Usuario", usuarioSchema);