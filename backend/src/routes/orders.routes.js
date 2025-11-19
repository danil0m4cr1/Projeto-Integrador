import { Router } from "express";
import Order from "../models/Orders.js";
import opcuaService from "../services/opcuaService.js";

const router = Router();

// Criar novo pedido
router.post("/", async (req, res) => {
  const { userEmail, products, totalAmount } = req.body;

  try {
    const newOrder = new Order({
      userEmail,
      products,
      totalAmount,
      status: 'pendente'
    });

    await newOrder.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Pedido criado com sucesso!",
      order: newOrder 
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

// Listar todos os pedidos
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

// Buscar pedidos por email do usuário
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

// Buscar pedido por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

// Atualizar status do pedido COM INTEGRAÇÃO OPC UA
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const oldStatus = order.status;
    
    // Atualizar status no banco de dados
    order.status = status;
    await order.save();

    // INTEGRAÇÃO COM OPC UA
    try {
      // Se mudou de 'pendente' para 'fabricando', iniciar produção no MES
      if (oldStatus !== 'fabricando' && status === 'fabricando') {
        if (!opcuaService.isConnected) {
          await opcuaService.connect();
        }

        // Preparar dados de produção
        const productionData = {
          productName: order.products.map(p => `${p.name} (${p.size})`).join(', '),
          quantity: order.products.reduce((sum, p) => sum + p.quantity, 0)
        };

        // Iniciar produção no MES
        const result = await opcuaService.startProduction(id, productionData);
        console.log(`🏭 Produção iniciada no MES:`, result);

        // Monitorar status da produção
        await opcuaService.monitorProductionStatus(id, async (productionStatus) => {
          console.log(`📊 Status recebido do MES:`, productionStatus);
          
          // Se o MES indicar que terminou, atualizar para concluído
          if (productionStatus.status === 'completed' || productionStatus.status === 'finished') {
            const completedOrder = await Order.findById(id);
            if (completedOrder && completedOrder.status === 'fabricando') {
              completedOrder.status = 'concluído';
              await completedOrder.save();
              console.log(`✅ Pedido ${id} marcado como concluído automaticamente`);
            }
          }
        });
      }

      // Se mudou para 'concluído', finalizar produção no MES
      if (status === 'concluído' && oldStatus === 'fabricando') {
        if (opcuaService.isConnected) {
          const result = await opcuaService.stopProduction(id);
          console.log(`🛑 Produção finalizada no MES:`, result);
        }
      }

      // Se mudou para 'cancelado', parar produção no MES
      if (status === 'cancelado' && oldStatus === 'fabricando') {
        if (opcuaService.isConnected) {
          const result = await opcuaService.stopProduction(id);
          console.log(`❌ Produção cancelada no MES:`, result);
        }
      }
    } catch (opcuaError) {
      console.error("⚠️ Erro na integração OPC UA:", opcuaError.message);
      // Não falhar a requisição se houver erro no OPC UA
      // O pedido já foi atualizado no banco de dados
    }

    res.json({ 
      success: true, 
      order,
      message: `Status atualizado para: ${status}` 
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar status do pedido" });
  }
});

// Deletar pedido
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Se o pedido está em fabricação, parar no MES
    if (order.status === 'fabricando' && opcuaService.isConnected) {
      try {
        await opcuaService.stopProduction(id);
        console.log(`🛑 Produção parada antes de deletar pedido: ${id}`);
      } catch (opcuaError) {
        console.error("⚠️ Erro ao parar produção no MES:", opcuaError.message);
      }
    }

    await Order.findByIdAndDelete(id);

    res.json({ success: true, message: "Pedido deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro ao deletar pedido" });
  }
});

// Endpoint para obter dados de produção do MES
router.get("/:id/production-status", async (req, res) => {
  const { id } = req.params;

  try {
    if (!opcuaService.isConnected) {
      return res.status(503).json({ 
        error: "Servidor OPC UA não conectado" 
      });
    }

    const productionData = await opcuaService.getProductionData();
    
    res.json({
      success: true,
      orderId: id,
      production: productionData
    });
  } catch (error) {
    console.error("Erro ao obter status de produção:", error);
    res.status(500).json({ error: "Erro ao obter status de produção" });
  }
});

// Endpoint para forçar sincronização com MES
router.post("/:id/sync-production", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (!opcuaService.isConnected) {
      await opcuaService.connect();
    }

    if (order.status === 'fabricando') {
      const productionData = {
        productName: order.products.map(p => `${p.name} (${p.size})`).join(', '),
        quantity: order.products.reduce((sum, p) => sum + p.quantity, 0)
      };

      await opcuaService.startProduction(id, productionData);
      
      res.json({ 
        success: true, 
        message: "Produção sincronizada com MES" 
      });
    } else {
      res.json({ 
        success: false, 
        message: "Pedido não está em fabricação" 
      });
    }
  } catch (error) {
    console.error("Erro ao sincronizar produção:", error);
    res.status(500).json({ error: "Erro ao sincronizar produção" });
  }
});

export default router;