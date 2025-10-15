import mongoose from "mongoose";
import { config } from "dotenv";

config();

export async function connectDB() { // Função para conectar-se ao BD
  const uri = process.env.MONGODB_URI; // Puxa a string do BD no .env
  if (!uri) { // Se não existir, não se conecta
    console.error("MONGODB_URI não definida no .env");
    process.exit(1);
  }
  try { // Se existir, se conecta
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { dbName: "users" });
    console.log("Conectado ao MongoDB:", uri);
  } catch (err) {
    console.error("Erro ao conectar no MongoDB:", err.message);
    process.exit(1);
  }
}