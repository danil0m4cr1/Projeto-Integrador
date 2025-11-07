<template>
  <div class="w-[100%] max-w-[800px] h-[400px] mx-auto my-0 p-[20px]">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
import Chart from 'chart.js/auto'
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  labels: Array,
  series: Array
})

const canvasEl = ref(null)
let chart = null

function renderChart() {
  if (chart) chart.destroy()

  chart = new Chart(canvasEl.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'População (habitantes)',
        data: props.series,
        backgroundColor: 'rgba(19, 81, 180, 0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // ou false para controle total
      aspectRatio: 2, // largura/altura (2 = duas vezes mais largo que alto)
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'População' }
        },
        x: {
          title: { display: true, text: 'Países' }
        }
      }
    }
  })
}

onMounted(renderChart)
watch(() => [props.labels, props.series], renderChart)
</script>