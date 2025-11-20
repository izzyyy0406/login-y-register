import mongoose from "mongoose";
import dotenv from "dotenv";

// Carga variables si estás en local
dotenv.config();

// Render inyectará esta variable automáticamente
const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.error("❌ ERROR CRÍTICO: Falta la variable de entorno MONGODB_URI");
      process.exit(1);
    }
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Atlas conectado exitosamente 🚀");
  } catch (error) {
    console.error("Error conectando a MongoDB Atlas:", error);
    process.exit(1);
  }
};