// src/services/opcuaService.js
import { OPCUAClient } from "node-opcua";

export async function connectOPC() {
  const endpointUrl = "opc.tcp://localhost:4840"; // altere conforme seu servidor

  const client = OPCUAClient.create({
    endpointMustExist: false,
  });

  try {
    console.log("Conectando ao servidor OPC UA...");
    await client.connect(endpointUrl);
    console.log("Conectado com sucesso ao servidor:", endpointUrl);

    const session = await client.createSession();
    console.log("Sessão OPC UA criada!");

    // Retorna a sessão para que outras partes do código possam usá-la
    return { client, session };
  } catch (err) {
    console.error("Erro na conexão OPC UA:", err);
  }
}