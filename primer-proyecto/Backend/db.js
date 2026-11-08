const mongoose = require("mongoose");

async function conectar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Falta MONGODB_URI en el archivo backend/.env");
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Conectado a MongoDB (base de datos: ${mongoose.connection.name})`);
}

module.exports = { conectar };