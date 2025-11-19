import {
  OPCUAServer,
  Variant,
  DataType,
  StatusCodes
} from "node-opcua";

async function main() {
  const server = new OPCUAServer({
    port: 4840,
    resourcePath: "/UA/MiniMES",
    buildInfo: {
      productName: "Mini MES PLC Simulator",
      buildNumber: "1.0.0",
      buildDate: new Date()
    }
  });

  await server.initialize();
  console.log("✅ Servidor OPC UA inicializado");

  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();

  // ============ ESTADO DA PRODUÇÃO ============
  let estadoGeral = 0; // 0=disponível 1=produzindoEstoque 2=produzindoOp 3=finalizadoOp 4=reprovado 5=falha
  let falhaAtiva = false;
  let codigoFalha = 0;
  let contadorBilhoes = 0;
  let opAtual = 0;
  let estoqueProdutos = [0, 0, 0]; // [Limão, Morango, Laranja]
  let quantidadeProduzida = 0;
  let pecasBoas = 0;
  let pecasRuins = 0;
  let tempoInicioMs = 0;
  let tempoFimMs = 0;

  // Dados do pedido atual
  let pedidoOp = 0;
  let pedidoProduto = 0;
  let pedidoQuantidade = 0;

  // Flags de comando
  let comandoNovoPedido = false;
  let comandoInicio = false;
  let comandoAbortar = false;
  let comandoReset = false;

  // ACKs
  let ackPedido = false;
  let ackAplica = false;
  let ackInicio = false;
  let ackExec = false;
  let ackFim = false;
  let ackFalha = false;

  let productionInterval = null;
  let isProducing = false;

  // ============ CRIAR PASTAS ============
  const statusFolder = namespace.addFolder("ObjectsFolder", { browseName: "status" });
  const pedidoFolder = namespace.addFolder("ObjectsFolder", { browseName: "pedido" });
  const cmdFolder = namespace.addFolder("ObjectsFolder", { browseName: "cmd" });
  const ackFolder = namespace.addFolder("ObjectsFolder", { browseName: "ack" });

  // ============ VARIÁVEIS DE STATUS ============
  const createStatusVar = (folder, name, dataType, getValue, setValue) => {
    const variable = namespace.addVariable({
      componentOf: folder,
      browseName: name,
      dataType,
      value: {
        get: () => new Variant({ dataType, value: getValue() }),
        set: setValue ? (variant) => {
          setValue(variant.value);
          return StatusCodes.Good;
        } : undefined
      }
    });
    variable.accessLevel = 3;
    variable.userAccessLevel = 3;
    return variable;
  };

  // Status
  createStatusVar(statusFolder, "geral", DataType.Int32, () => estadoGeral);
  createStatusVar(statusFolder, "falhaAtiva", DataType.Boolean, () => falhaAtiva);
  createStatusVar(statusFolder, "falhaAtivaCod", DataType.Int32, () => codigoFalha);
  createStatusVar(statusFolder, "accSinc", DataType.UInt32, () => contadorBilhoes);
  createStatusVar(statusFolder, "opAtual", DataType.Int32, () => opAtual);
  
  const estoqueProdVar = namespace.addVariable({
    componentOf: statusFolder,
    browseName: "estoqueProd",
    dataType: "Int32",
    arrayDimensions: [3],
    value: {
      get: () => new Variant({ 
        dataType: DataType.Int32, 
        arrayType: 1,
        value: estoqueProdutos 
      })
    }
  });
  estoqueProdVar.accessLevel = 3;
  estoqueProdVar.userAccessLevel = 3;

  createStatusVar(statusFolder, "mesProd", DataType.Int32, () => quantidadeProduzida);
  createStatusVar(statusFolder, "mesFalt", DataType.Int32, () => Math.max(0, pedidoQuantidade - quantidadeProduzida));
  createStatusVar(statusFolder, "mesTempoInicio", DataType.String, () => {
    if (tempoInicioMs === 0) return "";
    const d = new Date(tempoInicioMs);
    return `${d.getFullYear()},${d.getMonth()+1},${d.getDate()},${d.getHours()},${d.getMinutes()},${d.getSeconds()}`;
  });
  createStatusVar(statusFolder, "mesTempoFim", DataType.String, () => {
    if (tempoFimMs === 0) return "";
    const d = new Date(tempoFimMs);
    return `${d.getFullYear()},${d.getMonth()+1},${d.getDate()},${d.getHours()},${d.getMinutes()},${d.getSeconds()}`;
  });
  createStatusVar(statusFolder, "mesPcsBoas", DataType.Int32, () => pecasBoas);
  createStatusVar(statusFolder, "mesPcsRuins", DataType.Int32, () => pecasRuins);

  // Pedido
  createStatusVar(pedidoFolder, "op", DataType.Int32, () => pedidoOp, (v) => { pedidoOp = v; });
  createStatusVar(pedidoFolder, "produto", DataType.Int32, () => pedidoProduto, (v) => { pedidoProduto = v; });
  createStatusVar(pedidoFolder, "quant", DataType.Int32, () => pedidoQuantidade, (v) => { pedidoQuantidade = v; });

  // Comandos
  const novoPedVar = createStatusVar(cmdFolder, "novoPed", DataType.Boolean, () => comandoNovoPedido, (v) => { comandoNovoPedido = v; });
  const inicioVar = createStatusVar(cmdFolder, "inicio", DataType.Boolean, () => comandoInicio, (v) => { comandoInicio = v; });
  const abortarVar = createStatusVar(cmdFolder, "abortar", DataType.Boolean, () => comandoAbortar, (v) => { comandoAbortar = v; });
  const resetVar = createStatusVar(cmdFolder, "reset", DataType.Boolean, () => comandoReset, (v) => { comandoReset = v; });

  // ACKs
  createStatusVar(ackFolder, "pedidoAck", DataType.Boolean, () => ackPedido);
  createStatusVar(ackFolder, "aplicaAck", DataType.Boolean, () => ackAplica);
  createStatusVar(ackFolder, "inicioAck", DataType.Boolean, () => ackInicio);
  createStatusVar(ackFolder, "execAck", DataType.Boolean, () => ackExec);
  createStatusVar(ackFolder, "fimAck", DataType.Boolean, () => ackFim);
  createStatusVar(ackFolder, "falhaAck", DataType.Boolean, () => ackFalha);

  // ============ LÓGICA DE PRODUÇÃO ============
  
  function startProduction() {
    if (isProducing) {
      console.log("⚠️ Produção já em andamento");
      return;
    }

    console.log(`\n🏭 INICIANDO PRODUÇÃO`);
    console.log(`   OP: ${pedidoOp}`);
    console.log(`   Produto: ${pedidoProduto} (0=Limão, 1=Morango, 2=Laranja)`);
    console.log(`   Quantidade: ${pedidoQuantidade}`);

    isProducing = true;
    opAtual = pedidoOp;
    estadoGeral = 2; // produzindoOp
    quantidadeProduzida = 0;
    pecasBoas = 0;
    pecasRuins = 0;
    tempoInicioMs = Date.now();
    tempoFimMs = 0;

    ackPedido = true;
    ackAplica = true;
    ackInicio = true;

    const productNames = ['Limão', 'Morango', 'Laranja'];
    console.log(`   Produzindo: ${productNames[pedidoProduto]}\n`);

    // Simular produção (cada peça leva ~3 segundos)
    productionInterval = setInterval(() => {
      if (!isProducing || comandoAbortar) {
        stopProduction(comandoAbortar);
        return;
      }

      // Incrementar contador global
      contadorBilhoes = (contadorBilhoes + 1) % 4000000000;

      // Produzir peça
      quantidadeProduzida++;
      
      // 90% de chance de peça boa
      if (Math.random() > 0.1) {
        pecasBoas++;
      } else {
        pecasRuins++;
      }

      const progress = Math.round((quantidadeProduzida / pedidoQuantidade) * 100);
      console.log(`📊 Produzindo... ${quantidadeProduzida}/${pedidoQuantidade} (${progress}%) - Boas: ${pecasBoas} | Ruins: ${pecasRuins}`);

      ackExec = true;

      // Verificar se concluiu
      if (quantidadeProduzida >= pedidoQuantidade) {
        completeProduction();
      }
    }, 3000); // 3 segundos por peça
  }

  function completeProduction() {
    console.log(`\n✅ PRODUÇÃO CONCLUÍDA!`);
    console.log(`   OP: ${opAtual}`);
    console.log(`   Total produzido: ${quantidadeProduzida}`);
    console.log(`   Peças boas: ${pecasBoas}`);
    console.log(`   Peças ruins: ${pecasRuins}`);
    
    isProducing = false;
    estadoGeral = 3; // finalizadoOp
    tempoFimMs = Date.now();
    
    // Adicionar ao estoque
    estoqueProdutos[pedidoProduto] += pecasBoas;
    
    ackFim = true;
    
    clearInterval(productionInterval);
    productionInterval = null;

    // Resetar ACKs após 2 segundos
    setTimeout(() => {
      resetAcks();
      estadoGeral = 0; // disponível
      opAtual = 0;
    }, 2000);
  }

  function stopProduction(aborted = false) {
    if (!isProducing) {
      console.log("⚠️ Nenhuma produção em andamento");
      return;
    }

    console.log(`\n🛑 PRODUÇÃO ${aborted ? 'ABORTADA' : 'PARADA'}`);
    console.log(`   OP: ${opAtual}`);
    console.log(`   Produzido até o momento: ${quantidadeProduzida}/${pedidoQuantidade}`);
    
    isProducing = false;
    estadoGeral = aborted ? 4 : 0; // reprovado ou disponível
    tempoFimMs = Date.now();
    
    if (aborted && pecasBoas > 0) {
      estoqueProdutos[pedidoProduto] += pecasBoas;
    }
    
    clearInterval(productionInterval);
    productionInterval = null;

    setTimeout(() => {
      resetAcks();
      estadoGeral = 0;
      opAtual = 0;
    }, 2000);
  }

  function resetAcks() {
    ackPedido = false;
    ackAplica = false;
    ackInicio = false;
    ackExec = false;
    ackFim = false;
    ackFalha = false;
  }

  // ============ MONITORAR COMANDOS ============
  
  novoPedVar.on("value_changed", (dataValue) => {
    if (dataValue.value.value === true && !comandoNovoPedido) {
      console.log(`\n📝 NOVO PEDIDO RECEBIDO`);
      console.log(`   OP: ${pedidoOp}`);
      console.log(`   Produto: ${pedidoProduto}`);
      console.log(`   Quantidade: ${pedidoQuantidade}`);
      ackPedido = true;
    }
    comandoNovoPedido = dataValue.value.value;
  });

  inicioVar.on("value_changed", (dataValue) => {
    if (dataValue.value.value === true && !comandoInicio) {
      if (pedidoOp > 0 && pedidoQuantidade > 0) {
        startProduction();
      } else {
        console.log("⚠️ Dados do pedido incompletos, não é possível iniciar");
      }
    }
    comandoInicio = dataValue.value.value;
  });

  abortarVar.on("value_changed", (dataValue) => {
    if (dataValue.value.value === true && !comandoAbortar) {
      if (isProducing) {
        stopProduction(true);
      }
    }
    comandoAbortar = dataValue.value.value;
  });

  resetVar.on("value_changed", (dataValue) => {
    if (dataValue.value.value === true && !comandoReset) {
      console.log("\n🔄 RESET DO SISTEMA");
      
      if (isProducing) {
        stopProduction(false);
      }
      
      estadoGeral = 0;
      falhaAtiva = false;
      codigoFalha = 0;
      opAtual = 0;
      quantidadeProduzida = 0;
      pecasBoas = 0;
      pecasRuins = 0;
      tempoInicioMs = 0;
      tempoFimMs = 0;
      resetAcks();
      
      console.log("✅ Sistema resetado");
    }
    comandoReset = dataValue.value.value;
  });

  // ============ INICIAR SERVIDOR ============
  
  await server.start();

  const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
  console.log("\n" + "=".repeat(70));
  console.log("🎯 SERVIDOR OPC UA PLC SIMULATOR INICIADO!");
  console.log("=".repeat(70));
  console.log(`\n📡 Endpoint: ${endpointUrl}`);
  console.log(`\n📋 Estrutura de variáveis (conforme especificação do PLC):`);
  console.log(`\n   STATUS (ns=2;s=status.*):`);
  console.log(`      geral, falhaAtiva, falhaAtivaCod, accSinc, opAtual`);
  console.log(`      estoqueProd[3], mesProd, mesFalt, mesTempoInicio, mesTempoFim`);
  console.log(`      mesPcsBoas, mesPcsRuins`);
  console.log(`\n   PEDIDO (ns=2;s=pedido.*):`);
  console.log(`      op, produto, quant`);
  console.log(`\n   COMANDOS (ns=2;s=cmd.*):`);
  console.log(`      novoPed, inicio, abortar, reset`);
  console.log(`\n   ACKs (ns=2;s=ack.*):`);
  console.log(`      pedidoAck, aplicaAck, inicioAck, execAck, fimAck, falhaAck`);
  console.log("\n" + "=".repeat(70));
  console.log("✅ Sistema disponível - Estado: 0 (disponível)");
  console.log(`📦 Estoque: Limão=${estoqueProdutos[0]} | Morango=${estoqueProdutos[1]} | Laranja=${estoqueProdutos[2]}\n`);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\n📛 Encerrando servidor...");
    if (productionInterval) {
      clearInterval(productionInterval);
    }
    await server.shutdown();
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
}

main().catch(err => {
  console.error("❌ Erro ao iniciar servidor:", err);
  process.exit(1);
});