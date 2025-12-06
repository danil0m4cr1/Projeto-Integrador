import { defineStore } from 'pinia'
import axios from 'axios'

export const useCountryStore = defineStore('country', {
  state: () => ({
    labels: [],
    series: [],
    loading: false,
    error: null,
    lastupdate: null
  }),

  actions: {
    async fetchData() {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get('http://localhost:3001/api/countries')

        this.labels = data.labels
        this.series = data.series

        const now = new Date()
        this.lastupdate = now.toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'medium'
        })

      } catch (err) {
        this.error = err.message || 'Erro ao buscar dados'
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    hasData: (state) => state.labels.length > 0
  }
})