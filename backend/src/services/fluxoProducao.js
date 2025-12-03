import OpcuaService from "./opcuaService.js";
import { DataType } from "node-opcua";

class FluxoProducao {
  constructor() {
    this.state = 0;
    this.pedido = null;
    this.opcua = OpcuaService;
    this.retryCount = 0;
    this.maxRetries = 10; // Máximo de tentativas
  }

  /* =========================================================
     CONEXÃO
  ========================================================= */
  async connect() {
    console.log("[FLUXO] Conectando ao OPC UA...");
    const connected = await this.opcua.connect();
    if (connected) {
      console.log("[FLUXO] Conexão bem-sucedida!");
    } else {
      console.error("[FLUXO] Erro ao conectar ao OPC UA.");
    }
  }

  async disconnect() {
    await this.opcua.disconnect();
    console.log("[FLUXO] Desconectado do OPC UA.");
  }

  /* =========================================================
     LEITURA DE NODES COM RETRY
  ========================================================= */
  async readNode(nodeId, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const value = await this.opcua.readNode(nodeId);
        
        // Log detalhado do valor recebido
        console.log(`[FLUXO] 📖 Leitura ${nodeId}:`, {
          value: value,
          type: typeof value,
          isNull: value === null,
          isUndefined: value === undefined
        });
        
        return value;
      } catch (err) {
        console.error(`[FLUXO] ❌ Tentativa ${i + 1}/${retries} falhou para ${nodeId}:`, err.message);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 500)); // Aguarda 500ms entre tentativas
        }
      }
    }
    console.error(`[FLUXO] ❌ Todas as tentativas falharam para ${nodeId}`);
    return null;
  }

  /* =========================================================
     VERIFICAÇÃO DE BOOLEAN COM VALIDAÇÃO
  ========================================================= */
  isTrueBool(value) {
    // Verifica se o valor é verdadeiro de forma segura
    return value === true || value === 1 || value === "true" || value === "1";
  }

  /* =========================================================
     GERENCIAMENTO DE PEDIDOS
  ========================================================= */
  async novoPedido(op, produto, quant) {
    console.log("[FLUXO] novoPedido chamado:", { op, produto, quant });
    try {
      this.pedido = { op, produto, quant };
      this.retryCount = 0; // Reseta contador de tentativas
      console.log("[FLUXO] Pedido criado:", this.pedido);

      // Envia o pedido para o CLP
      console.log("[FLUXO] Enviando pedido ao PLC...");
      await this.opcua.enviarPedido(this.pedido);
      console.log("[FLUXO] Pedido enviado com sucesso!");

      this.setState(1);
    } catch (err) {
      console.error("[FLUXO] Erro em novoPedido:", err);
      throw err;
    }
  }

  async iniciar() {
    if (this.state === 2) {
      console.log("🚀 Iniciando produção...");
      await this.opcua.iniciarProducao();
      this.setState(10);
    } else {
      console.log("⚠️ Não está pronto para iniciar. Estado atual:", this.state);
    }
  }

  /* =========================================================
     MÁQUINA DE ESTADOS
  ========================================================= */
  async step() {
    try {
      switch (this.state) {
        case 0:
          // Aguardando pedido - não faz nada
          break;

        case 1:
          console.log(`[FLUXO] Estado 1: Aplicando pedido... (tentativa ${this.retryCount + 1}/${this.maxRetries})`);
          
          // Lê as variáveis do CLP com retry
          const pedidoACK = await this.readNode('ns=3;s="ack"."pedidoACK"');
          const aplicaACK = await this.readNode('ns=3;s="ack"."aplicaACK"');
          
          console.log("[FLUXO] 🔍 Valores recebidos:");
          console.log("   - pedidoACK:", pedidoACK, "(tipo:", typeof pedidoACK, ")");
          console.log("   - aplicaACK:", aplicaACK, "(tipo:", typeof aplicaACK, ")");
          
          // Verifica se ambos são verdadeiros
          const pedidoOK = this.isTrueBool(pedidoACK);
          const aplicaOK = this.isTrueBool(aplicaACK);
          
          console.log("[FLUXO] 🔍 Validação:");
          console.log("   - pedidoOK:", pedidoOK);
          console.log("   - aplicaOK:", aplicaOK);
          
          if (pedidoOK && aplicaOK) {
            console.log("[FLUXO] ✅ Pedido aplicado com sucesso!");
            this.retryCount = 0; // Reseta contador
            this.setState(2);
          } else {
            this.retryCount++;
            
            if (this.retryCount >= this.maxRetries) {
              console.error("[FLUXO] ❌ Timeout esperando ACKs do CLP. Abortando...");
              this.setState(30); // Estado de falha
              this.retryCount = 0;
            } else {
              console.log(`[FLUXO] ⏳ Aguardando ACKs... (${this.retryCount}/${this.maxRetries})`);
              // Permanece no estado 1 para tentar novamente
            }
          }
          break;

        case 2:
          console.log("[FLUXO] Estado 2: Pronto para iniciar");
          
          // Envia comando de início
          await this.opcua.writeTag('ns=3;s="ack"."inicioACK"', DataType.Boolean, true);
          console.log("[FLUXO] ✅ Comando de início enviado ao CLP");
          
          // Aguarda confirmação
          await new Promise(r => setTimeout(r, 500));
          
          const inicioACK = await this.readNode('ns=3;s="ack"."inicioACK"');
          console.log("[FLUXO] 🔍 inicioACK recebido:", inicioACK);
          
          if (this.isTrueBool(inicioACK)) {
            console.log("[FLUXO] ✅ Início confirmado pelo CLP!");
            this.setState(10);
          } else {
            console.log("[FLUXO] ⏳ Aguardando confirmação de início...");
          }
          break;

        case 10:
          console.log("[FLUXO] Estado 10: Produzindo...");

          // Marca início da execução
          await this.opcua.writeTag('ns=3;s="ack"."execACK"', DataType.Boolean, true);
          await this.opcua.writeTag('ns=3;s="ack"."fimACK"', DataType.Boolean, false);

          // Loop de produção
          while (true) {
            // Lê variáveis do CLP
            const pecasFalt = await this.readNode('ns=3;s="status"."mesFalt"');
            const estoqueProd = await this.readNode('ns=3;s="status"."estoqueProd"');

            console.log(`📦 pecasFalt: ${pecasFalt} | estoqueProd: ${estoqueProd}`);

            // Verifica falha
            const falhaACK = await this.readNode('ns=3;s="ack"."falhaACK"');
            if (this.isTrueBool(falhaACK)) {
              console.log("❌ Falha detectada durante execução");
              this.setState(30);
              return;
            }

            // Verifica se valores são válidos
            if (pecasFalt === null || estoqueProd === null) {
              console.error("❌ Erro ao ler variáveis do CLP. Abortando produção.");
              this.setState(30);
              return;
            }

            // Controla produção
            if (pecasFalt > 0 && estoqueProd > 0) {
              const novoEstoque = estoqueProd - 1;
              const novaFalta = pecasFalt - 1;

              console.log(`🧮 Atualizando -> Estoque: ${novoEstoque}, Faltam: ${novaFalta}`);

              await this.opcua.writeTag('ns=3;s="status"."estoqueProd"', DataType.Int16, novoEstoque);
              await this.opcua.writeTag('ns=3;s="status"."mesFalt"', DataType.Int16, novaFalta);
            }

            // Verifica se terminou
            if (pecasFalt <= 0) {
              console.log("🎉 Produção concluída! pecasFalt chegou a 0");
              await this.opcua.writeTag('ns=3;s="ack"."fimACK"', DataType.Boolean, true);
              this.setState(11);
              return;
            }

            // Pausa para não travar
            await new Promise(r => setTimeout(r, 500));
          }
          break;

        case 11:
          console.log("[FLUXO] Estado 11: ✅ OP finalizada com sucesso");

          // Marca finalização no CLP
          await this.opcua.writeTag('ns=3;s="status"."opFinalizada"', DataType.Boolean, true);
          
          const message = `OP ${this.pedido.op} finalizada com sucesso!`;
          await this.opcua.writeTag('ns=3;s="status"."mensagemFinalizacao"', DataType.String, message);
          
          console.log(`📝 Mensagem enviada ao CLP: ${message}`);

          // Aguarda processamento
          await new Promise(r => setTimeout(r, 500));

          // Reseta o CLP
          await this.opcua.resetPLC();
          console.log("🔄 CLP resetado");

          // Volta ao estado inicial
          this.setState(0);
          console.log("➡️ Pronto para novo pedido");
          break;

        case 20:
          console.log("[FLUXO] Estado 20: Aguardando reabastecimento...");
          const estoque = await this.readNode('ns=3;s="status"."estoqueProd"');
          
          if (estoque !== null && estoque >= this.pedido.quant) {
            console.log("📦 Estoque suficiente, retomando execução");
            this.setState(21);
          }
          break;

        case 21:
          console.log("[FLUXO] Estado 21: Retornando para execução");
          this.setState(10);
          break;

        case 30:
          console.log("[FLUXO] Estado 30: ❌ Estado de falha — aguardando reset");
          // Não faz nada até receber comando de reset
          break;

        default:
          // Estado desconhecido, apenas loga
          if (this.state !== 0) {
            console.log(`[FLUXO] Estado atual: ${this.state}`);
          }
      }
    } catch (err) {
      console.error("[FLUXO] ❌ Erro no step:", err);
      // Não lança o erro para não quebrar o loop
    }
  }

  /* =========================================================
     UTILITÁRIOS
  ========================================================= */
  setState(novo) {
    console.log(`[FLUXO] ➡️ Estado: ${this.state} → ${novo}`);
    this.state = novo;
  }
}

// Export default para permitir import padrão
export default FluxoProducao;