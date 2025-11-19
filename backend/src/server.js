import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ordersRoutes from './routes/orders.routes.js';
import opcuaService from './services/opcuaService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seu_banco', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/orders', ordersRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    opcua: opcuaService.isConnected ? 'connected' : 'disconnected'
  });
});

// Rota para conectar ao OPC UA manualmente
app.post('/api/opcua/connect', async (req, res) => {
  try {
    const connected = await opcuaService.connect();
    res.json({ 
      success: connected, 
      message: connected ? 'Conectado ao OPC UA' : 'Falha ao conectar ao OPC UA' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para desconectar do OPC UA
app.post('/api/opcua/disconnect', async (req, res) => {
  try {
    await opcuaService.disconnect();
    res.json({ success: true, message: 'Desconectado do OPC UA' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para verificar status da conexão OPC UA
app.get('/api/opcua/status', (req, res) => {
  res.json({ 
    connected: opcuaService.isConnected,
    endpoint: opcuaService.endpointUrl
  });
});

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Tentar conectar ao OPC UA na inicialização
  try {
    console.log('🔌 Tentando conectar ao servidor OPC UA...');
    const connected = await opcuaService.connect();
    if (connected) {
      console.log('✅ Conectado ao OPC UA com sucesso!');
    } else {
      console.log('⚠️ Falha ao conectar ao OPC UA. A aplicação continuará funcionando, mas sem integração MES.');
    }
  } catch (error) {
    console.error('⚠️ Erro ao conectar ao OPC UA:', error.message);
    console.log('⚠️ A aplicação continuará funcionando sem integração MES');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📛 SIGTERM recebido, encerrando gracefully...');
  
  // Desconectar OPC UA
  await opcuaService.disconnect();
  
  // Fechar servidor
  server.close(() => {
    console.log('✅ Servidor encerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexão MongoDB fechada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('📛 SIGINT recebido, encerrando gracefully...');
  
  // Desconectar OPC UA
  await opcuaService.disconnect();
  
  // Fechar servidor
  server.close(() => {
    console.log('✅ Servidor encerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexão MongoDB fechada');
      process.exit(0);
    });
  });
});

export default app;