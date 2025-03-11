import express from "express";
import { Tablero } from "../models/model_tableros.js";
import mongoose from "mongoose";

export const router = express.Router();

// router.get("/tablero", async (req, res) => {
//   try {
//     const tableros = await Tablero.find();
//     res.json(tableros);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/tablero", async (req, res) => {
  const { idUsuario } = req.query;
  // console.log("ID de usuario recibido:", idUsuario);
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
    // res.status(201).json({ message: "Tablero creado exitosamente" });
    res.status(201).json(tablero);
  } catch (error) {
    console.error("Error en POST /tablero:", error);
    res.status(500).json({ message: "Error al crear tablero" });
  }
});

router.post("/lista/:tableroId", async (req, res) => {
  console.log("Datos recibidos:", req.body, req.params);
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

router.get("/lista/:tableroId", async (req, res) => {
  console.log("Datos recibidos para las listas: ", req.params);
  try {
    const { tableroId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tableroId)) {
      return res.status(400).json({ message: "ID de tablero inválido" });
    }
    const tablero = await Tablero.findById(tableroId);
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }
    console.log("Listas del tablero:", tablero.listas);
    res.json(tablero.listas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/tarjeta/:listaId", async (req, res) => {
  console.log("Id de la lista para la tarjeta: ", req.params);
  console.log("Datos recibidos para la tarjeta: ", req.body);
  try {
    const { listaId } = req.params;
    const { titulo, descripcion, prioridad } = req.body;

    const nuevaTarjeta = { titulo, descripcion, prioridad };

    const tablero = await Tablero.findOne({ "listas._id": listaId });
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    // Encuentra la lista dentro del tablero y agrega la tarjeta
    const lista = tablero.listas.id(listaId);
    if (!lista) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    lista.cards.push(nuevaTarjeta);

    // Guarda los cambios en el tablero
    await tablero.save();

    res.status(201).json(lista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/tarjeta/:listaId", async (req, res) => {
  console.log("Id de la lista para la tarjeta: ", req.params);
  try {
    const { listaId } = req.params;
    const tablero = await Tablero.findOne({ "listas._id": listaId });
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }
    const lista = tablero.listas.id(listaId);
    if (!lista) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }
    res.json(lista.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/lista/sortable/:listaId", async (req, res) => {
  console.log("Datos recibidos para ordenar tarjetas: ", req.body);
  console.log("Id de la lista: ", req.params.listaId);

  try {
    const { listaId } = req.params;
    const { cards, oldIndex, newIndex } = req.body;
    console.log("Tarjetas recibidas: ", cards);
    console.log("Índices de ordenamiento: ", oldIndex, newIndex);

    // Verificar que se envió el array de tarjetas y los índices
    if (!Array.isArray(cards)) {
      return res
        .status(400)
        .json({ message: "No se recibieron tarjetas válidas" });
    }
    if (oldIndex === undefined || newIndex === undefined) {
      return res
        .status(400)
        .json({ message: "Faltan índices de ordenamiento" });
    }

    const tablero = await Tablero.findOne({ "listas._id": listaId });
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    const lista = tablero.listas.id(listaId);
    if (!lista) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    // Verificar que los índices están dentro de los límites
    if (
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= lista.cards.length ||
      newIndex >= lista.cards.length
    ) {
      return res.status(400).json({ message: "Índices fuera de rango" });
    }

    // Reordenar las tarjetas en la lista
    const card = lista.cards.splice(oldIndex, 1)[0]; // Extraer tarjeta
    lista.cards.splice(newIndex, 0, card); // Insertar en nueva posición

    console.log("Tarjetas ordenadas: ", lista.cards);

    // Guardar cambios en la base de datos
    await tablero.save();

    res.json({ message: "Tarjetas reordenadas correctamente", lista });
  } catch (error) {
    console.error("Error al ordenar tarjetas:", error);
    res.status(500).json({ error: error.message });
  }
});
