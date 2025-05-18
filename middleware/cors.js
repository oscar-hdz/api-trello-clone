import cors from "cors";

export const corsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      const acceptedOrigins = ["http://localhost:5173"];

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
