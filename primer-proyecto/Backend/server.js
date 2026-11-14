require("dotenv").config({ quiet: true });
const app = require("./app");
const { conectar } = require("./db");
const PORT = process.env.PORT || 3000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Falta JWT_SECRET en backend/.env (mínimo 32 caracteres). Mira .env.example");
  process.exit(1);
}
conectar()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor listo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  });