import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/model_user.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/cookie.js";

export const router = express.Router();

//Ruta para obtener todos los usuarios
router.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, contrasenia } = req.body;

    // Buscar usuario en la base de datos
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Comparar la contraseña
    const isValid = await bcrypt.compare(contrasenia, user.contrasenia);
    if (!isValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    // console.log("secret key:", process.env.SECRET_KEY);
    // console.log("id:", user._id);

    // Generar el token JWT
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("Token generado:", token);

    // Configurar la cookie con el token
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en producción
      sameSite: "strict",
      maxAge: 3600000, // 1 hora
    });

    // Responder con éxito
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear un nuevo usuario (Registro)
router.post("/user", async (req, res) => {
  try {
    //console.log("Datos recibidos:", req.body);
    const usuario = new User(req.body);
    usuario.contrasenia = await bcrypt.hash(req.body.contrasenia, 10);
    usuario.confirmarContrasenia = await bcrypt.hash(req.body.contrasenia, 10);
    await usuario.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    // console.error("Error en POST /user:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

//Ruta para verificar el token

// router.get("/dashboard", authenticateToken, (req, res) => {
//   res.send({ message: "Acceso concedido", user: req.user });
// });

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    // Buscar al usuario en la base de datos con el ID del token
    const user = await User.findById(req.user.id).select("-contrasenia"); // Excluye la contraseña

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.send({ message: "Cierre de sesión exitoso" });
});
