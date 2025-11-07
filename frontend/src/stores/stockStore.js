// projects > stores > country.js

// Importa a função para criar stores do Pinia
import { defineStore } from 'pinia'
// Importa o Axios para fazer requisições HTTP
import axios from 'axios'

// Define e exporta uma store chamada 'country'
export const useCountryStore = defineStore('country', {
  // --- STATE: dados reativos da store ---
  state: () => ({
    labels: [],        // Vetor de rótulos (ex.: nomes de países) para o gráfico
    series: [],        // Vetor com os valores (ex.: população, populações) para o gráfico
    loading: false,    // Indica se está carregando dados da API (spinner, etc.)
    error: null,       // Mensagem de erro da última operação (se houver)
    lastupdate: null   // ⏱ Texto com a data/hora da última atualização
  }),

  // --- ACTIONS: métodos assíncronos/síncronos que alteram o state ---
  actions: {
    // Busca dados no backend e atualiza o state
    async fetchData() {
      this.loading = true           // Indica que a busca começou
      this.error = null             // Limpa erro anterior (se existir)

      try {
        // 🌐 Faz GET no endpoint do backend que retorna { labels: [...], series: [...] }
        const { data } = await axios.get('http://localhost:3001/api/countries')

        // Atualiza os arrays do gráfico com a resposta da API
        this.labels = data.labels
        this.series = data.series

        // ⏱ Calcula e salva o carimbo de data/hora da atualização para exibir na UI
        const now = new Date()
        this.lastupdate = now.toLocaleString('pt-BR', {
          dateStyle: 'short',    // Formato curto de data (ex.: 30/10/2025)
          timeStyle: 'medium'    // Formato médio de hora (ex.: 10:22:33)
        })

      } catch (err) {
        // Em caso de erro, guarda a mensagem para ser exibida na UI
        this.error = err.message || 'Erro ao buscar dados'
      } finally {
        // Sempre executa: encerra o estado de carregamento
        this.loading = false
      }
    }
  },

  // --- GETTERS: computam valores derivados do state ---
  getters: {
    // Retorna true se já existem rótulos carregados (útil para condicionar a renderização)
    hasData: (state) => state.labels.length > 0
  }
})