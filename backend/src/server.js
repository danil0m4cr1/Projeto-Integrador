import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import opcuaRoutes from "./routes/opcua.routes.js";
import opcuaService from "./services/opcuaService.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB"))
.catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// Rotas
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/opcua", opcuaRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    opcua: opcuaService.isConnected() ? "connected" : "disconnected",
  });
});

// --- Conectar automaticamente ao OPC UA na inicialização ---
async function startServer() {
  try {
    console.log("🔌 Tentando conectar ao OPC UA...");
    const connected = await opcuaService.connect();
    if (connected) {
      console.log("✅ Conectado ao OPC UA na inicialização!");
    } else {
      console.log("⚠️ Não foi possível conectar ao OPC UA na inicialização.");
    }
  } catch (err) {
    console.error("❌ Erro ao conectar OPC UA:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

startServer();
