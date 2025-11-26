import { Router } from "express";
import Order from "../models/Orders.js";
import opcuaService from "../services/opcuaService.js";

const router = Router();

/* ---------------------------------------------------------
   Criar novo pedido
-----------------------------------------------------------*/
router.post("/", async (req, res) => {
  const { userEmail, products, totalAmount } = req.body;

  try {
    const newOrder = new Order({
      userEmail,
      products,
      totalAmount,
      status: "pendente",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

/* ---------------------------------------------------------
   Finalizar compra → inicia produção OPC UA
-----------------------------------------------------------*/
router.post("/:id/finalizar", async (req, res) => {
  const { id } = req.params;
  console.log(`[LOG] Iniciando finalização do pedido ${id}`);

  try {
    const order = await Order.findById(id);
    if (!order) {
      console.log(`[LOG] Pedido ${id} não encontrado`);
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.status !== "pendente") {
      console.log(`[LOG] Pedido ${id} já está em produção ou concluído (status=${order.status})`);
      return res.status(400).json({ error: "Pedido já finalizado ou em produção" });
    }

    // Atualiza status para "fabricando"
    order.status = "fabricando";
    await order.save();
    console.log(`[LOG] Pedido ${id} atualizado para status "fabricando"`);

    // --- Integração OPC UA ---
    try {
      console.log(`[LOG] Verificando conexão OPC UA`);
      if (!opcuaService.isConnected()) {
        console.log(`[LOG] Não conectado, conectando...`);
        await opcuaService.connect();
        console.log(`[LOG] Conexão OPC UA estabelecida`);
      } else {
        console.log(`[LOG] Já conectado ao OPC UA`);
      }

      const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0);
      console.log(`[LOG] Total de produtos a enviar: ${totalQuantity}`);

      // Enviar pedido
      console.log(`[LOG] Enviando pedido OPC UA para pedido ${id}`);
      await opcuaService.enviarPedido(parseInt(id, 10), 1, totalQuantity);
      console.log(`[LOG] Pedido OPC UA enviado com sucesso`);

      // Iniciar produção
      console.log(`[LOG] Iniciando produção OPC UA para pedido ${id}`);
      await opcuaService.iniciarProducao();
      console.log(`[LOG] Produção iniciada com sucesso`);

    } catch (opcuaError) {
      console.error(`[LOG][ERRO] Falha na integração OPC UA:`, opcuaError.message);
      return res.status(500).json({ error: "Falha na integração OPC UA" });
    }

    res.json({
      success: true,
      order,
      message: "Compra finalizada e produção iniciada!"
    });

  } catch (error) {
    console.error(`[LOG][ERRO] Erro ao finalizar pedido ${id}:`, error.message);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});


/* ---------------------------------------------------------
   Listar pedidos, buscar por email ou ID
-----------------------------------------------------------*/
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

router.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos do usuário" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

/* ---------------------------------------------------------
   Atualizar status do pedido (opcional)
-----------------------------------------------------------*/
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Integração OPC UA
    try {
      if (!opcuaService.isConnected()) {
        await opcuaService.connect();
      }

      const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0);

      if (oldStatus !== "fabricando" && status === "fabricando") {
        await opcuaService.enviarPedido(parseInt(id, 10), 1, totalQuantity);
        await opcuaService.iniciarProducao();
      }

      if (oldStatus === "fabricando" && status === "concluído") {
        await opcuaService.resetPLC();
      }

      if (oldStatus === "fabricando" && status === "cancelado") {
        await opcuaService.cancelarProducao();
      }
    } catch (opcuaError) {
      console.error("⚠️ Erro na integração OPC UA:", opcuaError.message);
    }

    res.json({
      success: true,
      order,
      message: `Status atualizado para: ${status}`,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar status do pedido" });
  }
});

/* ---------------------------------------------------------
   Deletar pedido
-----------------------------------------------------------*/
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    if (order.status === "fabricando" && opcuaService.isConnected()) {
      await opcuaService.cancelarProducao();
    }

    await Order.findByIdAndDelete(id);
    res.json({ success: true, message: "Pedido deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro ao deletar pedido" });
  }
});

export default router;
