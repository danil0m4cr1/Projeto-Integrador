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

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { pass: 0 });
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ success: true, message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;