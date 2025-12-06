const NS = process.env.OPCUA_NAMESPACE_INDEX || 3

function node(...path) {
  const tag = path.map(p => `"${p}"`).join(".")
  return `ns=${NS};s=${tag}`
}

export default {
  status: {
    geral: node("status", "geral"),
    falhaAtiva: node("status", "falhaAtiva"),
    falhaAtivaCod: node("status", "falhaAtivaCod"),
    accSinc: node("status", "accSinc"),
    opAtual: node("status", "opAtual"),
    estoqueProd: node("status", "estoqueProd"),
    mesProd: node("status", "mesProd"),
    mesFalt: node("status", "mesFalt"),
    mesPcsBoas: node("status", "mesPcsBoas"),
    mesPcsRuins: node("status", "mesPcsRuins"),
    mesTempInicioYear: node("status", "mesTempInicio", "YEAR"),
    mesTempInicioMonth: node("status", "mesTempInicio", "MONTH"),
    mesTempInicioDay: node("status", "mesTempInicio", "DAY"),
    mesTempInicioHour: node("status", "mesTempInicio", "HOUR"),
    mesTempInicioMinute: node("status", "mesTempInicio", "MINUTE"),
    mesTempInicioSecond: node("status", "mesTempInicio", "SECOND"),
    mesTempFimYear: node("status", "mesTempFim", "YEAR"),
    mesTempFimMonth: node("status", "mesTempFim", "MONTH"),
    mesTempFimDay: node("status", "mesTempFim", "DAY"),
    mesTempFimHour: node("status", "mesTempFim", "HOUR"),
    mesTempFimMinute: node("status", "mesTempFim", "MINUTE"),
    mesTempFimSecond: node("status", "mesTempFim", "SECOND")
  },
  pedido: {
    op: node("pedido", "op"),
    produto: node("pedido", "produto"),
    quant: node("pedido", "quant")
  },
  cmd: {
    novoPed: node("cmd", "novoPed"),
    inicio: node("cmd", "inicio"),
    abortar: node("cmd", "abortar"),
    reset: node("cmd", "reset")
  },
  ack: {
    pedidoACK: node("ack", "pedidoACK"),
    aplicaACK: node("ack", "aplicaACK"),
    inicioACK: node("ack", "inicioACK"),
    execACK: node("ack", "execACK"),
    fimACK: node("ack", "fimACK"),
    falhaACK: node("ack", "falhaACK")
  },
  ihm: {
    contaPc: node("ihm", "contaPc")
  }
}