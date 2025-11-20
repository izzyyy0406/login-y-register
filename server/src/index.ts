import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import User from "./User.js";

// --- Configuración para Rutas y Archivos (ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuración Inicial ---
const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "secret_temporal_dev";

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// ⚠️ MAGIA AQUÍ: Servir la carpeta 'public' (tu React compilado)
// Express buscará en la carpeta 'public' que está al nivel de 'src'
app.use(express.static(path.join(__dirname, "../public"))); // <--- CORREGIDO

// --- RUTAS DE API ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "¡Usuario registrado exitosamente!" });
  } catch (error) {
    console.error("Error en /register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }
    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token: token,
      userName: user.name,
    });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// --- REDIRECCIÓN AL FRONTEND (Para que React Router funcione) ---
// Si la ruta no es /api, enviamos el index.html de React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html")); // <--- CORREGIDO
});

// --- INICIO DEL SERVIDOR ---
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Fallo al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
