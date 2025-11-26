// backend/clp/fluxoProducao.js
import opcuaService from "./opcuaService.js";
import nodes from "../config/opcuaNodes.js";

class FluxoProducao {
  constructor() {
    this.state = 0;
    this.pedido = null;
    this.opcua = opcuaService;
  }

  /* Conectar / desconectar OPC UA */
  async connect() {
    await this.opcua.connect();
  }

  async disconnect() {
    await this.opcua.disconnect();
  }

  /* Função para ler TAGs OPC UA (simulando método ler do PLC) */
  async ler(nodeId) {
    // Aqui você deve implementar a leitura real
    // Se não tiver, podemos simular com um valor booleano aleatório
    // ou usar o OPCUAClient diretamente
    console.log(`🔍 Lendo TAG: ${nodeId}`);
    return true; // simulando sempre ACK positivo
  }

  /* Função para enviar o pedido ao PLC */
  async escreverPedido(pedido) {
    // escreve os valores no PLC via opcuaService
    await this.opcua.enviarPedido(pedido.op, pedido.produto, pedido.quant);
  }

  /* Criar novo pedido */
  async novoPedido(op, produto, quant) {
    this.pedido = { op, produto, quant };
    console.log("📝 Pedido criado:", this.pedido);
    await this.escreverPedido(this.pedido);
    this.setState(1);
  }

  /* Iniciar produção */
  async iniciar() {
    if (this.state === 2) {
      console.log("🚀 Iniciando produção...");
      await this.opcua.iniciarProducao();
      this.setState(10);
    } else {
      console.log("⚠️ Não está pronto para iniciar.");
    }
  }

  /* Passo da máquina de estados */
  async step() {
    switch (this.state) {
      case 1:
        console.log("📥 Aplicando pedido...");
        const pedidoACK = await this.ler(nodes.ack.pedidoACK);
        const aplicaACK = await this.ler(nodes.ack.aplicaACK);
        if (pedidoACK && aplicaACK) this.setState(2);
        break;

      case 2:
        console.log("✅ Pedido aplicado, pronto para iniciar");
        const inicioACK = await this.ler(nodes.ack.inicioACK);
        if (inicioACK) this.setState(10);
        break;

      case 10:
        console.log("⚙️ Produzindo...");
        const execACK = await this.ler(nodes.ack.execACK);
        const fimACK = await this.ler(nodes.ack.fimACK);
        const falhaACK = await this.ler(nodes.ack.falhaACK);

        if (falhaACK) {
          console.log("❌ Falha detectada durante execução");
          this.setState(30);
        } else if (fimACK) {
          this.setState(11);
        } else if (execACK) {
          console.log("📡 Execução em andamento...");
        }
        break;

      case 11:
        console.log("✅ OP finalizada com sucesso");
        await this.opcua.resetPLC();
        this.setState(0);
        break;

      case 20:
        console.log("📦 Aguardando reabastecimento...");
        const estoque = await this.ler(nodes.status.estoqueProd);
        if (estoque[this.pedido.produto] >= this.pedido.quant) {
          console.log("📦 Estoque suficiente, retomando execução");
          this.setState(21);
        }
        break;

      case 21:
        console.log("➡️ Retornando para execução");
        this.setState(10);
        break;

      case 30:
        console.log("❌ Estado de falha — aguardando reset");
        break;

      default:
        const geral = await this.ler(nodes.status.geral);
        console.log("📡 Estado atual:", this.state, " | CLP status.geral:", geral);
    }
  }

  /* Alterar estado da máquina */
  setState(novo) {
    console.log(`➡️ Estado mudou para: ${novo}`);
    this.state = novo;
  }
}

// Executar apenas se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default FluxoProducao;
