<script setup>
import { onMounted, watch, ref } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  data: Array
})

const canvasRef = ref(null)
let chart

function renderChart() {
  if (chart) chart.destroy()

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels: props.data.map(d => d.label),
      datasets: [
        {
          label: 'Minutes Watched',
          data: props.data.map(d => d.value),
          fill: false,
          tension: 0.3,
        }
      ]
    }
  })
}

onMounted(renderChart)
watch(() => props.data, renderChart)
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
