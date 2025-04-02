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
  //console.log("ID de usuario recibido:", idUsuario);
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
    console.log("Datos recibidos xD:", req.body);
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

// Ruta para crear una lista en un tablero
router.post("/lista/:tableroId", async (req, res) => {
  console.log("Datos recibidos para crear una lista:", req.body, req.params);
  try {
    const { tableroId } = req.params;
    const { titulo } = req.body;

    const nuevaLista = {
      _id: new mongoose.Types.ObjectId(),
      titulo,
      tarjetas: [],
    }; // Generamos un ID manualmente

    const tablero = await Tablero.findByIdAndUpdate(
      tableroId,
      { $push: { listas: nuevaLista } }, // Agregamos la lista al array
      { new: true } // Para que devuelva el tablero actualizado
    );

    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    // Buscar la lista recién agregada y devolverla
    const listaAgregada = tablero.listas.find((lista) =>
      lista._id.equals(nuevaLista._id)
    );

    res.status(201).json(listaAgregada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener las listas de un tablero
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

//Ruta para crear una tarjeta en una lista
router.post("/tarjeta/:listaId", async (req, res) => {
  console.log("Id de la lista para la tarjeta: ", req.params);
  console.log("Datos recibidos para la tarjeta: ", req.body);
  try {
    const { listaId } = req.params;
    const { titulo, descripcion, prioridad } = req.body;

    const nuevaTarjeta = {
      _id: new mongoose.Types.ObjectId(),
      titulo,
      descripcion,
      prioridad,
    };

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

    res.status(201).json(nuevaTarjeta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Ruta para obtener las tarjetas de una lista
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
    const { oldIndex, newIndex } = req.body;
    console.log("Índices de ordenamiento: ", oldIndex, newIndex);

    const tablero = await Tablero.findOne({ "listas._id": listaId });
    if (!tablero) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    const lista = tablero.listas.id(listaId);
    if (!lista) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    const tarjeta = lista.cards.splice(oldIndex, 1)[0];
    lista.cards.splice(newIndex, 0, tarjeta);

    await tablero.save();

    res.json(tablero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Eliminar Tablero
router.delete("/tablero/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tablero = await Tablero.findByIdAndDelete(id);
    if (tablero) {
      res
        .status(200)
        .json({ message: `Tablero con id: ${id} eliminado exitosamente` });
    } else {
      res.status(404).json({ message: "Tablero no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Eliminar Listas
router.delete("/lista/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tablero = await Tablero.findOneAndUpdate(
      { "listas._id": id },
      { $pull: { listas: { _id: id } } },
      { new: true }
    );
    if (tablero) {
      res.status(200).json(tablero.listas);
    } else {
      res.status(404).json({ message: "Lista no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Eliminar tarjetas
router.delete("/tarjeta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id de la tarjeta a eliminar: ", id);

    // 1️⃣ Buscar el tablero que contiene la tarjeta
    const tablero = await Tablero.findOne({ "listas.cards._id": id });

    if (!tablero) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    // 2️⃣ Encontrar la lista que contiene la tarjeta
    const listaAfectada = tablero.listas.find((lista) =>
      lista.cards.some((card) => card._id.toString() === id)
    );

    if (!listaAfectada) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    // 3️⃣ Ahora sí eliminamos la tarjeta
    await Tablero.findOneAndUpdate(
      { "listas.cards._id": id },
      { $pull: { "listas.$[].cards": { _id: id } } },
      { new: true }
    );

    console.log(
      "Tarjetas restantes en la lista: ",
      listaAfectada.cards.filter((card) => card._id.toString() !== id)
    );

    // 4️⃣ Enviar solo las tarjetas restantes de la lista afectada
    res
      .status(200)
      .json(listaAfectada.cards.filter((card) => card._id.toString() !== id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
