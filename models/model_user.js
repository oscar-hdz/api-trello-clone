import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contrasenia: {
    type: String,
    required: true,
  },
  confirmarContrasenia: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model("User", userSchema);
