import express from "express";
import { Tablero } from "../models/model_tableros.js";
import mongoose from "mongoose";

export const router = express.Router();

router.get("/tablero", async (req, res) => {
  try {
    const tableros = await Tablero.find();
    res.json(tableros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/tablero", async (req, res) => {
  const { idUsuario } = req.query;
  console.log("ID de usuario recibido:", idUsuario);
  try {
    if (!mongoose.Types.ObjectId.isValid(idUsuario)) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }
    const tableros = await Tablero.find({ idUsuario });
    res.json(tableros);
  } catch (error) {
    res.status(500).json({ error: console.error(error) });
  }
});

router.get("/tablero/:id", async (req, res) => {
  try {
    const tablero = await Tablero.findById(req.params.id);
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }
    res.json(tablero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/tablero", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { idUsuario, nombre } = req.body;

    if (!mongoose.Types.ObjectId.isValid(idUsuario)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    const tablero = new Tablero({
      idUsuario: new mongoose.Types.ObjectId(idUsuario),
      nombre,
    });
    await tablero.save();
    res.status(201).json({ message: "Tablero creado exitosamente" });
  } catch (error) {
    console.error("Error en POST /tablero:", error);
    res.status(500).json({ message: "Error al crear tablero" });
  }
});

router.post("/lista/:tableroId", async (req, res) => {
  console.log("Datos recibidos:", req.body);
  try {
    const { tableroId } = req.params;
    const { titulo } = req.body;

    const nuevaLista = { titulo, tarjetas: [] }; // Creamos la lista sin tarjetas

    const tablero = await Tablero.findByIdAndUpdate(
      tableroId,
      { $push: { listas: nuevaLista } }, // Agregamos la lista al array
      { new: true } // Para que devuelva el tablero actualizado
    );

    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    res.status(201).json(tablero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
