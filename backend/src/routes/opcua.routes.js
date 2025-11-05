import { Router } from "express";
import { connectOPC } from "../services/opcuaService.js";

const router = Router();

router.get("/connect-opc", async (req, res) => {
  try {
    await connectOPC();
    res.json({ message: "✅ Conectado ao servidor OPC UA com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;