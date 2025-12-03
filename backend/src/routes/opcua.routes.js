import { Router } from "express";
import FluxoProducao from "../services/fluxoProducao.js";

const router = Router();

// Instância global do fluxo
const fluxo = new FluxoProducao();
let maquinaRodando = false;

/* Conectar OPC UA */
router.post("/connect", async (req, res) => {
  console.log("[LOG] Tentando conectar ao OPC UA...");
  try {
    await fluxo.connect();
    console.log("[LOG] Conectado ao OPC UA com sucesso!");
    res.json({ success: true, message: "✅ Conectado ao OPC UA" });
  } catch (err) {
    console.error("[ERRO] Falha ao conectar OPC UA:", err);
    res.status(500).json({ success: false, message: "❌ Falha ao conectar ao OPC UA" });
  }
});

/* Desconectar OPC UA */
router.post("/disconnect", async (req, res) => {
  console.log("[LOG] Tentando desconectar OPC UA...");
  try {
    await fluxo.disconnect();
    console.log("[LOG] Desconectado do OPC UA");
    res.json({ success: true, message: "🛑 Desconectado do OPC UA" });
  } catch (err) {
    console.error("[ERRO] Falha ao desconectar OPC UA:", err);
    res.status(500).json({ success: false, message: "❌ Erro ao desconectar OPC UA" });
  }
});

/* Status da conexão OPC UA */
router.get("/status", (req, res) => {
  const connected = fluxo.opcua.isConnected();
  console.log("[LOG] Status da conexão:", connected);
  res.json({
    connected,
    endpoint: fluxo.opcua.endpointUrl,
  });
});

/* Criar pedido e enviar para o PLC */
router.post("/pedido", async (req, res) => {
  const { op, produto, quantidade } = req.body;

  // Verificação dos campos obrigatórios
  console.log(`[LOG] Recebido pedido: OP=${op}, Produto=${produto}, Quantidade=${quantidade}`);
  
  if (!op || !produto || !quantidade) {
    console.log("[ERRO] Campos obrigatórios faltando");
    return res.status(400).json({ error: "Campos op, produto e quantidade são obrigatórios" });
  }

  try {
    // Passando os parâmetros para o fluxo corretamente
    console.log("[LOG] Iniciando criação de pedido no fluxo...");
    await fluxo.novoPedido(op, produto, quantidade);

    // Executando o passo inicial do fluxo
    console.log("[LOG] Pedido registrado no fluxo. Executando step inicial...");
    await fluxo.step();
    console.log("[LOG] Step inicial concluído");

    // Enviar resposta de sucesso
    res.json({ success: true, message: "Pedido enviado ao OPC UA e registrado no fluxo" });
  } catch (err) {
    // Tratar erro e detalhar a falha
    console.error("[ERRO] Falha ao criar pedido:", err);
    res.status(500).json({ success: false, message: `❌ Erro ao enviar pedido: ${err.message}` });
  }
});


/* Iniciar produção */
router.post("/iniciar", async (req, res) => {
  console.log("[LOG] Solicitada inicialização da produção");
  try {
    await fluxo.iniciar();
    console.log("[LOG] Fluxo iniciou produção");
    await fluxo.step();
    console.log("[LOG] Step pós-início concluído");

    res.json({ success: true, message: "Produção iniciada" });
  } catch (err) {
    console.error("[ERRO] Falha ao iniciar produção:", err);
    res.status(500).json({ success: false, message: "❌ Erro ao iniciar produção" });
  }
});

/* Cancelar produção */
router.post("/cancelar", (req, res) => {
  console.log("[LOG] Solicitação de cancelamento de produção");
  try {
    if (fluxo.state >= 10 && fluxo.state < 30) {
      fluxo.setState(30); // Estado de falha/cancelado
      console.log("[LOG] Produção cancelada com sucesso");
      res.json({ success: true, message: "Produção cancelada" });
    } else {
      console.log("[LOG] Nenhuma produção em execução para cancelar");
      res.status(400).json({ success: false, message: "Não há produção em execução" });
    }
  } catch (err) {
    console.error("[ERRO] Falha ao cancelar produção:", err);
    res.status(500).json({ success: false, message: "❌ Erro ao cancelar produção" });
  }
});

/* Resetar PLC */
router.post("/reset", async (req, res) => {
  console.log("[LOG] Solicitado reset do PLC");
  try {
    await fluxo.opcua.resetPLC();
    fluxo.setState(0);
    console.log("[LOG] PLC resetado e estado do fluxo para 0");
    res.json({ success: true, message: "PLC resetado" });
  } catch (err) {
    console.error("[ERRO] Falha ao resetar PLC:", err);
    res.status(500).json({ success: false, message: "❌ Erro ao resetar PLC" });
  }
});

/* Iniciar Máquina de Estados (loop contínuo) */
router.post("/maquina/start", (req, res) => {
  if (maquinaRodando) {
    console.log("[LOG] Máquina de estados já está rodando");
    return res.json({ success: true, message: "Máquina já rodando" });
  }

  maquinaRodando = true;
  console.log("[LOG] Iniciando máquina de estados...");

  const maquinaLoop = async () => {
    try {
      await fluxo.step();
      console.log(`[LOG] Step executado. Estado atual: ${fluxo.state}`);
    } catch (err) {
      console.error("[ERRO] Loop da máquina de estados:", err);
    } finally {
      if (maquinaRodando) setTimeout(maquinaLoop, 1000);
    }
  };

  maquinaLoop();
  res.json({ success: true, message: "Máquina de estados iniciada" });
});

/* Parar Máquina de Estados */
router.post("/maquina/stop", (req, res) => {
  console.log("[LOG] Parando máquina de estados...");
  maquinaRodando = false;
  res.json({ success: true, message: "Máquina de estados parada" });
});

export default router;
