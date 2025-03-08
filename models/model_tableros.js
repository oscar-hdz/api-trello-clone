import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

const listaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  cards: [cardSchema],
});

const tableroSchema = new mongoose.Schema(
  {
    idUsuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    listas: {
      type: [listaSchema],
    },
  },
  {
    timestamps: true,
  }
);

export const Tablero = mongoose.model("Tablero", tableroSchema);
