import express from "express";
import { Kanban } from "../models/model_kanban.js";
import mongoose from "mongoose";

export const kanbanRouter = express.Router();

/* Métodos GET */

// Obtener todos los tableros - ✔
kanbanRouter.get("/boards", async (req, res) => {
  try {
    const kanbans = await Kanban.find();
    res.json(kanbans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener tableros por ID de usuario - ✔
kanbanRouter.get("/boards/:userId", async (req, res) => {
  try {
    const kanbans = await Kanban.find({ userId: req.params.userId });
    res.json(kanbans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener tablero por ID del tablero - ✔
kanbanRouter.get("/boards/:kanbanId/kanban", async (req, res) => {
  try {
    const kanban = await Kanban.findById(req.params.kanbanId);
    res.json(kanban);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener todas las listas - ✔
kanbanRouter.get("/lists", async (req, res) => {
  try {
    const lists = await Kanban.find();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener listas por ID del usuario - ✔
kanbanRouter.get("/lists/:userId", async (req, res) => {
  try {
    const lists = await Kanban.find({ userId: req.params.userId });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener listas por ID del Tablero
kanbanRouter.get("/lists/kanban/:kanbanId", async (req, res) => {
  try {
    const lists = await Kanban.findById(req.params.kanbanId);
    res.json(lists.lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener todas las tarjetas - ✔
kanbanRouter.get("/cards", async (req, res) => {
  try {
    const cards = await Kanban.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener tarjetas por ID del usuario - ✔
kanbanRouter.get("/cards/:userId", async (req, res) => {
  try {
    const cards = await Kanban.find({ userId: req.params.userId });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener tarjetas por ID de la Lista
kanbanRouter.get("/cards/lists/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const boards = await Kanban.findOne({ "lists._id": listId });

    if (!boards || !boards.length === 0) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    const lists = boards.lists.id(listId);

    if (!lists) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }
    res.json(lists.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Métodos POST */

// Crear un nuevo tablero - ✔
kanbanRouter.post("/boards", async (req, res) => {
  try {
    const newKanban = new Kanban(req.body);
    const savedKanban = await newKanban.save();
    res.status(201).json(savedKanban);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una lista dentro de un tablero - ✔
kanbanRouter.post("/boards/:kanbanId/lists", async (req, res) => {
  try {
    const newList = {
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      cards: [],
    };

    const board = await Kanban.findByIdAndUpdate(
      req.params.kanbanId,
      { $push: { lists: newList } },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    const listAdded = board.lists.find((list) => list._id.equals(newList._id));

    res.status(201).json(listAdded);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una tarjeta dentro de una lista - ✔
kanbanRouter.post("/boards/lists/:listId/cards", async (req, res) => {
  try {
    const newCard = {
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
    };

    const board = await Kanban.findOne({ "lists._id": req.params.listId });

    if (!board) {
      return res.status(404).json({ message: "Tablero no encontrado" });
    }

    const list = board.lists.id(req.params.listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada" });
    }

    list.cards.push(newCard);

    await board.save();

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Metodos DELETE */

// Eliminar un tablero - ✔
kanbanRouter.delete("/boards/:kanbanId", async (req, res) => {
  try {
    const deletedKanban = await Kanban.findByIdAndDelete(req.params.kanbanId);
    res.status(200).json(deletedKanban);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una lista de un tablero - ✔
kanbanRouter.delete("/boards/:kanbanId/lists/:listId", async (req, res) => {
  try {
    const deletedList = await Kanban.findByIdAndUpdate(
      req.params.kanbanId,
      { $pull: { lists: { _id: req.params.listId } } },
      { new: true }
    );
    res.status(200).json(deletedList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una tarjeta de una lista - ✔
kanbanRouter.delete("/boards/lists/:listId/cards/:cardId", async (req, res) => {
  try {
    const deletedCard = await Kanban.findOneAndUpdate(
      { "lists._id": req.params.listId },
      { $pull: { "lists.$.cards": { _id: req.params.cardId } } },
      { new: true }
    );
    res.status(200).json(deletedCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
