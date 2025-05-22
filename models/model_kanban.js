import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cards: [cardSchema],
});

const kanbanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    lists: [listSchema],
  },
  {
    timestamps: true,
  }
);

export const Kanban = mongoose.model("Kanban", kanbanSchema);
