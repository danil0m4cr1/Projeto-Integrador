import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import opcuaRoutes from "./routes/opcua.routes.js";
import opcuaService from "../src/services/opcuaService.js";
import FluxoProducao from "../src/services/fluxoProducao.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const fluxo = new FluxoProducao();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Conectado ao MongoDB"))
.catch(err => console.error("Erro ao conectar ao MongoDB:", err));

app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/opcua", opcuaRoutes);

app.post('/api/orders/create-and-send', async (req, res) => {
  try {
    const { userEmail, products, totalAmount } = req.body;

    if (!userEmail || !products || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados incompletos' 
      });
    }

    console.log('\n═══════════════════════════════════════');
    console.log('   NOVO PEDIDO RECEBIDO');
    console.log('═══════════════════════════════════════');
    console.log('   Email:', userEmail);
    console.log('   Produtos:', products.length);
    console.log('   Total: R$', totalAmount);
    console.log('═══════════════════════════════════════\n');

    if (!fluxo.opcua.isConnected()) {
      console.log('CLP desconectado. Tentando reconectar...');
      await fluxo.connect();
      
      if (!fluxo.opcua.isConnected()) {
        return res.status(503).json({ 
          success: false, 
          message: 'CLP não disponível. Pedido salvo mas não enviado para produção.' 
        });
      }
    }

    const opNumber = Date.now() % 1000000;
    
    const productCode = mapProductToCode(products[0].name);
    
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    console.log('Dados para o CLP:');
    console.log('   - OP:', opNumber);
    console.log('   - Produto:', products[0].name);
    console.log('   - Código Produto:', productCode);
    console.log('   - Quantidade:', totalQuantity);
    console.log('');

    try {
      await fluxo.novoPedido(opNumber, productCode, totalQuantity);
      console.log('Pedido enviado ao CLP com sucesso!');
      console.log('Máquina de estados iniciada para processar pedido\n');
    } catch (pedidoError) {
      if (pedidoError.message.includes('Estoque do produto insuficiente')) {
        const match = pedidoError.message.match(/Disponível: (\d+), Necessário: (\d+)/);
        const disponivel = match ? parseInt(match[1]) : 0;
        const necessario = match ? parseInt(match[2]) : totalQuantity;
        
        return res.status(400).json({
          success: false,
          message: 'Estoque do produto insuficiente',
          details: {
            product: products[0].name,
            productCode: productCode,
            available: disponivel,
            requested: necessario,
            shortage: necessario - disponivel
          },
          error: pedidoError.message
        });
      }
      
      if (pedidoError.message.includes('Quantidade máxima')) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade excede o máximo permitido',
          details: {
            product: products[0].name,
            maxAllowed: 3,
            requested: totalQuantity
          },
          error: pedidoError.message
        });
      }
      
      if (pedidoError.message.includes('CLP')) {
        return res.status(503).json({
          success: false,
          message: 'Erro ao comunicar com o CLP',
          error: pedidoError.message
        });
      }
      
      throw pedidoError;
    }

    return res.status(201).json({
      success: true,
      message: 'Pedido criado e enviado para produção no CLP',
      data: {
        orderId: opNumber,
        userEmail,
        products,
        totalAmount,
        productCode,
        productName: products[0].name,
        quantity: totalQuantity,
        timestamp: new Date().toISOString(),
        status: 'Enviado para produção'
      }
    });

  } catch (error) {
    console.error('\n═══════════════════════════════════════');
    console.error('   ERRO AO PROCESSAR PEDIDO');
    console.error('═══════════════════════════════════════');
    console.error(error);
    console.error('═══════════════════════════════════════\n');
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar pedido',
      error: error.message 
    });
  }
});

app.post('/api/production/start', async (req, res) => {
  try {
    if (!fluxo.opcua.isConnected()) {
      return res.status(503).json({ 
        success: false, 
        message: 'CLP não conectado' 
      });
    }

    await fluxo.iniciar();
    res.json({ 
      success: true, 
      message: 'Comando de início enviado ao CLP',
      currentState: fluxo.state
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/production/cancel', async (req, res) => {
  try {
    if (!fluxo.opcua.isConnected()) {
      return res.status(503).json({ 
        success: false, 
        message: 'CLP não conectado' 
      });
    }

    await fluxo.opcua.cancelarProducao();
    fluxo.setState(30);
    
    res.json({ 
      success: true, 
      message: 'Produção cancelada',
      currentState: fluxo.state
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/production/reset', async (req, res) => {
  try {
    if (!fluxo.opcua.isConnected()) {
      return res.status(503).json({ 
        success: false, 
        message: 'CLP não conectado' 
      });
    }

    await fluxo.opcua.resetPLC();
    fluxo.setState(0);
    
    res.json({ 
      success: true, 
      message: 'CLP resetado',
      currentState: fluxo.state
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/production/status', async (req, res) => {
  try {
    const connected = fluxo.opcua.isConnected();
    
    let productionStatus = null;
    let estoqueProd = null;
    
    if (connected) {
      estoqueProd = await fluxo.consultarEstoqueProd();
      
      if (fluxo.pedido) {
        productionStatus = {
          currentState: fluxo.state,
          stateDescription: getStateDescription(fluxo.state),
          currentOrder: fluxo.pedido,
          isProducing: fluxo.state === 10,
          isWaitingStock: fluxo.state === 20
        };
      }
    }

    res.json({ 
      success: true, 
      connected,
      estoqueProd: estoqueProd,
      maxEstoque: 3,
      production: productionStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/stock', async (req, res) => {
  try {
    if (!fluxo.opcua.isConnected()) {
      return res.status(503).json({ 
        success: false, 
        message: 'CLP não conectado' 
      });
    }

    const estoqueProd = await fluxo.consultarEstoqueProd();

    const estoquesProdutos = await fluxo.consultarTodosEstoquesProdutos();

    if (estoqueProd === null || !estoquesProdutos) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao consultar estoques no CLP'
      });
    }

    res.json({
      success: true,
      production: {
        stock: estoqueProd,
        max: 3,
        description: 'Estoque de matéria-prima (reabastecido pelo CLP)'
      },
      products: [
        {
          id: 2,
          name: 'Suco de Laranja',
          stock: estoquesProdutos.laranja,
          status: estoquesProdutos.laranja > 0 ? 'Disponível' : 'Esgotado'
        },
        {
          id: 1,
          name: 'Suco de Morango',
          stock: estoquesProdutos.morango,
          status: estoquesProdutos.morango > 0 ? 'Disponível' : 'Esgotado'
        },
        {
          id: 0,
          name: 'Suco de Limão',
          stock: estoquesProdutos.limao,
          status: estoquesProdutos.limao > 0 ? 'Disponível' : 'Esgotado'
        }
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/stock/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    if (!fluxo.opcua.isConnected()) {
      return res.status(503).json({ 
        success: false, 
        message: 'CLP não conectado' 
      });
    }

    if (![0, 1, 2].includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de produto inválido. Use 0 (Limão), 1 (Morango) ou 2 (Laranja)'
      });
    }

    const estoqueProduto = await fluxo.consultarEstoqueProduto(productId);

    if (estoqueProduto === null) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao consultar estoque do produto no CLP'
      });
    }

    const productNames = {
      0: 'Suco de Limão',
      1: 'Suco de Morango',
      2: 'Suco de Laranja'
    };

    res.json({
      success: true,
      product: {
        id: productId,
        name: productNames[productId],
        stock: estoqueProduto,
        status: estoqueProduto > 0 ? 'Disponível' : 'Esgotado'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get("/health", async (req, res) => {
  let estoqueProd = null;
  let estoquesProdutos = null;
  
  if (opcuaService.isConnected() && fluxo.opcua.isConnected()) {
    try {
      estoqueProd = await fluxo.consultarEstoqueProd();
      estoquesProdutos = await fluxo.consultarTodosEstoquesProdutos();
    } catch (err) {
      console.error("Erro ao consultar estoques no health check:", err);
    }
  }
  
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    opcua: opcuaService.isConnected() ? "connected" : "disconnected",
    fluxoProducao: {
      connected: fluxo.opcua.isConnected(),
      state: fluxo.state,
      stateDescription: getStateDescription(fluxo.state),
      production: {
        stock: estoqueProd,
        max: 3
      },
      products: estoquesProdutos ? {
        laranja: estoquesProdutos.laranja,
        morango: estoquesProdutos.morango,
        limao: estoquesProdutos.limao
      } : null
    }
  });
});

function mapProductToCode(productName) {
  const productMap = {
    'Suco de Laranja': 0,
    'Suco de Morango': 1,
    'Suco de Limão': 2
  };

  const code = productMap[productName];
  
  if (code === undefined) {
    console.warn(`Produto não mapeado: ${productName}. Usando código padrão 0.`);
    return 0;
  }
  
  console.log(`Produto "${productName}" mapeado para código ${code}`);
  return code;
}

function getStateDescription(state) {
  const states = {
    0: 'Aguardando pedido',
    1: 'Aplicando pedido no CLP',
    2: 'Pedido aplicado - Pronto para iniciar',
    10: 'Produzindo',
    11: 'Produção finalizada com sucesso',
    20: 'Aguardando reabastecimento',
    21: 'Retomando produção',
    30: 'Estado de falha - Aguardando reset'
  };
  
  return states[state] || 'Estado desconhecido';
}

async function startServer() {
  try {
    console.log("Tentando conectar ao OPC UA (opcuaService)...");
    const connected = await opcuaService.connect();
    if (connected) {
      console.log("OpcuaService conectado ao OPC UA!");
    } else {
      console.log("OpcuaService não conectou ao OPC UA.");
    }

    console.log("Inicializando FluxoProducao...");
    await fluxo.connect();
    if (fluxo.opcua.isConnected()) {
      console.log("FluxoProducao conectado ao CLP via OPC UA!");
      
      setInterval(async () => {
        try {
          await fluxo.step();
        } catch (err) {
          console.error('Erro no step do fluxo:', err);
        }
      }, 1000);
      
      console.log("Loop da máquina de estados iniciado (1s)");
    } else {
      console.log("FluxoProducao não conectou ao CLP.");
    }

  } catch (err) {
    console.error("Erro ao conectar OPC UA:", err.message);
  }

  app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════');
    console.log(`   SERVIDOR RODANDO`);
    console.log(`   http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════\n');
  });
}

process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  await fluxo.disconnect();
  await opcuaService.disconnect();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nEncerrando servidor...');
  await fluxo.disconnect();
  await opcuaService.disconnect();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();