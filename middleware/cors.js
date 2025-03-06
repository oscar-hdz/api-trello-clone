import cors from "cors";

export const corsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      const acceptedOrigins = [
        "http://localhost:5500",
        "http://127.0.0.1:5500/api/index.html",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://localhost:5173/register",
      ];

      if (acceptedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!origin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
