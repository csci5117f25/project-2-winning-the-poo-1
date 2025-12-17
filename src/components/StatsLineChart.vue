<script setup>
import { onMounted, watch, ref } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  data: Array,
  label: {
    type: String,
    default: 'Minutes Watched'
  }
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
          label: props.label,
          data: props.data.map(d => d.value),
          fill: false,
          tension: 0.3,
        }
      ]
    }
  })
}

onMounted(renderChart)
watch(() => [props.data, props.label], renderChart)
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
