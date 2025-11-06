// Importa a biblioteca axios, que serve para "conversar" com a API (buscar ou enviar dados)
import axios from "axios";

// Cria uma versão configurada do axios chamada "api"
// Assim, sempre que a gente usar essa "api", ela já sabe para onde enviar os pedidos
const api = axios.create({
  // baseURL: endereço principal da API
  // Primeiro tenta pegar o endereço de uma configuração (VITE_API_URL).
  // Se não encontrar, usa por padrão o "http://localhost:3000/api"
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  // headers: aqui dizemos que vamos trocar informações no formato JSON
  headers: { "Content-Type": "application/json" }
});

// Exporta a "api" para poder usar em outras partes do sistema
// Assim podemos fazer: api.get(...), api.post(...), etc.
export default api;