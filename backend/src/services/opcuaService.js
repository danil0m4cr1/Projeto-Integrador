import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  ClientSubscription,
  TimestampsToReturn,
  DataType
} from "node-opcua";

class OPCUAService {
  constructor() {
    this.client = null;
    this.session = null;
    this.subscription = null;
    this.endpointUrl = process.env.OPCUA_ENDPOINT || "opc.tcp://localhost:4840";
    this.isConnected = false;
    this.monitoredItems = new Map();
  }

  async connect() {
    try {
      this.client = OPCUAClient.create({
        applicationName: "MiniMESClient",
        connectionStrategy: {
          initialDelay: 1000,
          maxRetry: 3
        },
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None,
        endpointMustExist: false
      });

      await this.client.connect(this.endpointUrl);
      console.log("✅ Conectado ao servidor OPC UA:", this.endpointUrl);

      this.session = await this.client.createSession();
      console.log("✅ Sessão OPC UA criada com sucesso");

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("❌ Erro ao conectar ao OPC UA:", error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.subscription) {
        await this.subscription.terminate();
        this.subscription = null;
      }

      if (this.session) {
        await this.session.close();
        this.session = null;
      }

      if (this.client) {
        await this.client.disconnect();
        this.client = null;
      }

      this.isConnected = false;
      this.monitoredItems.clear();
      console.log("✅ Desconectado do OPC UA");
    } catch (error) {
      console.error("❌ Erro ao desconectar:", error.message);
    }
  }

  async startProduction(orderId, productionData) {
    if (!this.isConnected || !this.session) {
      throw new Error("Cliente OPC UA não está conectado");
    }

    try {
      console.log(`\n🏭 Iniciando produção no MES para pedido: ${orderId}`);
      
      // 1. Escrever ordem de produção (OP)
      await this.writeValue("ns=2;s=pedido.op", DataType.Int32, parseInt(orderId.slice(-4), 16) % 1000);
      
      // 2. Definir produto (0=Limão 1=Morango 2=Laranja)
      const productMap = {
        'limao': 0,
        'limão': 0,
        'morango': 1,
        'laranja': 2
      };
      
      let productCode = 0;
      for (const [key, value] of Object.entries(productMap)) {
        if (productionData.productName.toLowerCase().includes(key)) {
          productCode = value;
          break;
        }
      }
      
      await this.writeValue("ns=2;s=pedido.produto", DataType.Int32, productCode);
      console.log(`   Produto definido: ${productCode} (${productionData.productName})`);
      
      // 3. Definir quantidade
      const quantity = Math.min(productionData.quantity, 65000);
      await this.writeValue("ns=2;s=pedido.quant", DataType.Int32, quantity);
      console.log(`   Quantidade: ${quantity}`);
      
      // 4. Avisar que novo pedido foi escrito
      await this.writeValue("ns=2;s=cmd.novoPed", DataType.Boolean, true);
      console.log(`   ✅ Novo pedido notificado ao MES`);
      
      // Aguardar um pouco para o PLC processar
      await this.sleep(500);
      
      // 5. Autorizar início da produção
      await this.writeValue("ns=2;s=cmd.inicio", DataType.Boolean, true);
      console.log(`   ✅ Início de produção autorizado`);
      
      // Resetar flags após 1 segundo
      setTimeout(async () => {
        try {
          await this.writeValue("ns=2;s=cmd.novoPed", DataType.Boolean, false);
          await this.writeValue("ns=2;s=cmd.inicio", DataType.Boolean, false);
        } catch (error) {
          console.error("⚠️ Erro ao resetar flags:", error.message);
        }
      }, 1000);

      console.log(`\n✅ Produção iniciada no MES!`);
      return { success: true, message: "Produção iniciada com sucesso" };
    } catch (error) {
      console.error("❌ Erro ao iniciar produção:", error.message);
      throw error;
    }
  }

  async stopProduction(orderId) {
    if (!this.isConnected || !this.session) {
      throw new Error("Cliente OPC UA não está conectado");
    }

    try {
      console.log(`\n🛑 Finalizando/cancelando produção no MES`);
      
      // Solicitar abortar ordem de produção
      await this.writeValue("ns=2;s=cmd.abortar", DataType.Boolean, true);
      console.log(`   ✅ Comando de cancelamento enviado`);
      
      // Resetar flag após 1 segundo
      setTimeout(async () => {
        try {
          await this.writeValue("ns=2;s=cmd.abortar", DataType.Boolean, false);
        } catch (error) {
          console.error("⚠️ Erro ao resetar flag:", error.message);
        }
      }, 1000);

      return { success: true, message: "Produção finalizada/cancelada" };
    } catch (error) {
      console.error("❌ Erro ao finalizar produção:", error.message);
      throw error;
    }
  }

  async monitorProductionStatus(orderId, onStatusChange) {
    if (!this.isConnected || !this.session) {
      throw new Error("Cliente OPC UA não está conectado");
    }

    try {
      // Criar subscription se não existir
      if (!this.subscription) {
        this.subscription = await this.session.createSubscription2({
          requestedPublishingInterval: 1000,
          requestedLifetimeCount: 100,
          requestedMaxKeepAliveCount: 10,
          maxNotificationsPerPublish: 100,
          publishingEnabled: true,
          priority: 10
        });

        console.log("✅ Subscription criada para monitoramento");
      }

      // Monitorar variável de estado geral
      const statusNode = "ns=2;s=status.geral";
      const monitoredItem = await this.subscription.monitor(
        { nodeId: statusNode, attributeId: AttributeIds.Value },
        { samplingInterval: 1000, discardOldest: true, queueSize: 10 },
        TimestampsToReturn.Both
      );

      monitoredItem.on("changed", async (dataValue) => {
        const status = dataValue.value.value;
        console.log(`📊 Status MES mudou: ${status}`);
        
        // Mapear estados do PLC
        // 0=disponível 1=produzindoEstoque 2=produzindoOp 3=finalizadoOp 4=reprovado 5=falha
        let mappedStatus = 'running';
        let shouldComplete = false;

        switch (status) {
          case 0:
            mappedStatus = 'idle';
            break;
          case 1:
          case 2:
            mappedStatus = 'running';
            break;
          case 3:
            mappedStatus = 'completed';
            shouldComplete = true;
            break;
          case 4:
            mappedStatus = 'rejected';
            shouldComplete = true;
            break;
          case 5:
            mappedStatus = 'error';
            break;
        }
        
        if (onStatusChange) {
          // Ler dados adicionais
          const productionData = await this.getProductionData();
          
          onStatusChange({
            orderId,
            status: mappedStatus,
            statusCode: status,
            timestamp: dataValue.serverTimestamp,
            ...productionData,
            shouldComplete
          });
        }
      });

      this.monitoredItems.set(orderId, monitoredItem);
      return monitoredItem;
    } catch (error) {
      console.error("❌ Erro ao monitorar produção:", error.message);
      throw error;
    }
  }

  async getProductionData() {
    if (!this.isConnected || !this.session) {
      throw new Error("Cliente OPC UA não está conectado");
    }

    try {
      const nodesToRead = [
        { nodeId: "ns=2;s=status.geral", name: "geral" },
        { nodeId: "ns=2;s=status.opAtual", name: "opAtual" },
        { nodeId: "ns=2;s=status.mesProd", name: "quantidadeProduzida" },
        { nodeId: "ns=2;s=status.mesPcsBoas", name: "pecasBoas" },
        { nodeId: "ns=2;s=status.mesPcsRuins", name: "pecasRuins" }
      ];

      const dataValues = await this.session.read(
        nodesToRead.map(node => ({ 
          nodeId: node.nodeId, 
          attributeId: AttributeIds.Value 
        }))
      );

      const result = {};
      nodesToRead.forEach((node, index) => {
        result[node.name] = dataValues[index].value.value;
      });

      // Calcular progresso aproximado
      const opAtual = result.opAtual;
      if (opAtual && opAtual > 0) {
        // Estimar progresso baseado nas peças produzidas
        const total = result.quantidadeProduzida || 0;
        // Assumir que uma produção típica leva ~30 segundos
        // e cada peça representa um percentual
        result.progress = Math.min(Math.round((total / 3) * 100), 100);
      } else {
        result.progress = 0;
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao obter dados de produção:", error.message);
      return {
        geral: 0,
        opAtual: 0,
        quantidadeProduzida: 0,
        pecasBoas: 0,
        pecasRuins: 0,
        progress: 0
      };
    }
  }

  async readProductionProgress(orderId) {
    const data = await this.getProductionData();
    
    // Mapear status
    const statusMap = {
      0: 'idle',
      1: 'producing_stock',
      2: 'producing_order',
      3: 'completed',
      4: 'rejected',
      5: 'error'
    };

    return {
      status: statusMap[data.geral] || 'unknown',
      progress: data.progress,
      quantityProduced: data.quantidadeProduzida,
      goodParts: data.pecasBoas,
      badParts: data.pecasRuins,
      currentOp: data.opAtual
    };
  }

  async resetProduction() {
    if (!this.isConnected || !this.session) {
      throw new Error("Cliente OPC UA não está conectado");
    }

    try {
      await this.writeValue("ns=2;s=cmd.reset", DataType.Boolean, true);
      console.log("🔄 Reset de produção enviado");
      
      setTimeout(async () => {
        try {
          await this.writeValue("ns=2;s=cmd.reset", DataType.Boolean, false);
        } catch (error) {
          console.error("⚠️ Erro ao resetar flag:", error.message);
        }
      }, 1000);

      return { success: true, message: "Reset enviado" };
    } catch (error) {
      console.error("❌ Erro ao resetar produção:", error.message);
      throw error;
    }
  }

  async checkAcknowledgments() {
    if (!this.isConnected || !this.session) {
      return null;
    }

    try {
      const ackNodes = [
        { nodeId: "ns=2;s=ack.pedidoAck", name: "pedidoAck" },
        { nodeId: "ns=2;s=ack.aplicaAck", name: "aplicaAck" },
        { nodeId: "ns=2;s=ack.inicioAck", name: "inicioAck" },
        { nodeId: "ns=2;s=ack.execAck", name: "execAck" },
        { nodeId: "ns=2;s=ack.fimAck", name: "fimAck" },
        { nodeId: "ns=2;s=ack.falhaAck", name: "falhaAck" }
      ];

      const dataValues = await this.session.read(
        ackNodes.map(node => ({ 
          nodeId: node.nodeId, 
          attributeId: AttributeIds.Value 
        }))
      );

      const acks = {};
      ackNodes.forEach((node, index) => {
        acks[node.name] = dataValues[index].value.value;
      });

      return acks;
    } catch (error) {
      console.error("⚠️ Erro ao verificar acknowledgments:", error.message);
      return null;
    }
  }

  // Método auxiliar para escrever valores
  async writeValue(nodeId, dataType, value) {
    if (!this.session) {
      throw new Error("Sessão OPC UA não está ativa");
    }

    const nodesToWrite = [{
      nodeId,
      attributeId: AttributeIds.Value,
      value: {
        value: {
          dataType,
          value
        }
      }
    }];

    const statusCodes = await this.session.write(nodesToWrite);
    
    if (!statusCodes[0].isGood()) {
      throw new Error(`Falha ao escrever em ${nodeId}: ${statusCodes[0].toString()}`);
    }
  }

  // Método auxiliar para ler valor único
  async readValue(nodeId) {
    if (!this.session) {
      throw new Error("Sessão OPC UA não está ativa");
    }

    const dataValue = await this.session.read({
      nodeId,
      attributeId: AttributeIds.Value
    });

    return dataValue.value.value;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const opcuaService = new OPCUAService();

export default opcuaService;