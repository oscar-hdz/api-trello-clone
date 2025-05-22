import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(403).json({ error: "No Autorizado" });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });

    req.user = user;
    next();
  });
};
