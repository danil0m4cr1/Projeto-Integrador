import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// Verifica usuário
router.post("/check-user", async (req, res) => {
  const { email, pass } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ exists: false });
    }

    if (pass === user.pass) {
      return res.json({ exists: true, name: user.name });
    } else {
      return res.json({ exists: false });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao verificar usuário");
  }
});

export default router;