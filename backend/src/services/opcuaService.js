import { OPCUAClient, AttributeIds, DataType } from "node-opcua";

export const endpointUrl = "opc.tcp://192.168.0.1:4840";

const client = OPCUAClient.create({
  connectionStrategy: { initialDelay: 1000, maxRetry: 5 },
});

let session = null;
let connected = false;

export async function connect() {
  try {
    if (connected && session) {
      console.log("OPC UA já está conectado!");
      return true;
    }

    console.log("Conectando ao PLC OPC UA...");
    await client.connect(endpointUrl);
    session = await client.createSession();
    connected = true;
    console.log("Conectado ao OPC UA!");
    return true;
  } catch (err) {
    connected = false;
    console.error("Erro ao conectar OPC UA:", err.message);
    return false;
  }
}

export async function disconnect() {
  try {
    if (session) {
      await session.close();
      session = null;
    }
    if (connected) {
      await client.disconnect();
    }
    connected = false;
    console.log("Desconectado do OPC UA");
  } catch (err) {
    console.error("Erro ao desconectar OPC UA:", err.message);
  }
}

export function isConnected() {
  return connected && session !== null;
}

export async function writeTag(nodeId, dataType, value) {
  if (!session) {
    console.error("Sessão OPC UA não aberta!");
    return false;
  }
  try {
    await session.write({
      nodeId,
      attributeId: AttributeIds.Value,
      value: { value: { dataType, value } },
    });
    console.log(`TAG escrita: ${nodeId} = ${value}`);
    return true;
  } catch (err) {
    console.error(`Erro ao escrever TAG ${nodeId}:`, err.message);
    return false;
  }
}

export async function enviarPedido(op) {
  const opNum = parseInt(op.op, 10);
  const prodNum = parseInt(op.produto, 10);
  const quantNum = parseInt(op.quant, 10);

  console.log("[enviarPedido] Valores após conversão:");
  console.log("   - opNum:", opNum);
  console.log("   - prodNum:", prodNum);
  console.log("   - quantNum:", quantNum);

  if (isNaN(opNum) || isNaN(prodNum) || isNaN(quantNum)) {
    console.error("[enviarPedido] Erro: Valores inválidos!");
    return false;
  }

  console.log("[enviarPedido] Validação OK, escrevendo TAGs...");

  await writeTag('ns=3;s="pedido"."op"', DataType.Int32, opNum);  
  await writeTag('ns=3;s="pedido"."produto"', DataType.Int16, prodNum);
  await writeTag('ns=3;s="pedido"."quant"', DataType.Int16, quantNum);
  await writeTag('ns=3;s="cmd"."novoPed"', DataType.Boolean, true);
  await new Promise(r => setTimeout(r, 300));
  await writeTag('ns=3;s="cmd"."novoPed"', DataType.Boolean, false);
  console.log("[enviarPedido] Pedido enviado com sucesso!");
  return true;
}

export async function iniciarProducao() {
  await writeTag('ns=3;s="cmd"."inicio"', DataType.Boolean, true);
  await new Promise(r => setTimeout(r, 300));
  await writeTag('ns=3;s="cmd"."inicio"', DataType.Boolean, false);
  console.log("Produção iniciada!");
}

export async function cancelarProducao() {
  await writeTag('ns=3;s="cmd"."abortar"', DataType.Boolean, true);
  await new Promise(r => setTimeout(r, 300));
  await writeTag('ns=3;s="cmd"."abortar"', DataType.Boolean, false);
  console.log("Produção cancelada!");
}

export async function resetPLC() {
  await writeTag('ns=3;s="cmd"."reset"', DataType.Boolean, true);
  await new Promise(r => setTimeout(r, 300));
  await writeTag('ns=3;s="cmd"."reset"', DataType.Boolean, false);
  console.log("PLC resetado!");
}

export async function readNode(nodeId) {
  if (!session) {
    console.error("Sessão OPC UA não aberta!");
    return null;
  }

  try {
    const data = await session.read({
      nodeId,
      attributeId: AttributeIds.Value,
    });

    return data.value.value;
  } catch (err) {
    console.error(`Erro ao ler o node ${nodeId}:`, err.message);
    return null;
  }
}

export default {
  connect,
  disconnect,
  isConnected,
  enviarPedido,
  iniciarProducao,
  cancelarProducao,
  resetPLC,
  readNode,
  endpointUrl,
  writeTag,
};