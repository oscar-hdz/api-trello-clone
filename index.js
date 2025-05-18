import express, { json } from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Conectado a la base de datos MongoDB de Trello Clone");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

run().catch(console.dir);

app.use(json());
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("Bienvenido a mi API");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
