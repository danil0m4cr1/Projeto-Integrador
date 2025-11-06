import { Router } from "express";
import User from "../models/User.js";

const router = Router();

router.post("/check-user", async (req, res) => {
  const { email, pass } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ exists: false });
    }

    if (pass === user.pass) {
      return res.json({ 
        exists: true, 
        email: user.email,
        role: user.role
      }); 
    } else {
      return res.json({ exists: false });
    }

  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    res.status(500).json({ error: "Erro ao verificar usuário" });
  }
});

export default router;