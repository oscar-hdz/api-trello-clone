import express, { json } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { router } from "./routes/user.js";
import { router as routerTablero } from "./routes/tableros.js";
import { corsMiddleware } from "./middleware/cors.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run().catch(console.dir);

/* Middleware */
app.use(json());
app.disable("x-powered-by");
app.use(corsMiddleware());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Reemplaza con el dominio de tu frontend
    credentials: true, // Habilita el envío de cookies
  })
);

app.use("", router);
app.use("", routerTablero);

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   res.sendStatus(200);
// });

app.listen(PORT, () => {
  console.log(`Servidor listo, escuchando en el puerto ${PORT}`);
});
