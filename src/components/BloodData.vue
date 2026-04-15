<template>
    <div class="blood-echart">
        <v-chart :option="option" autoresize />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    data: {
        type: Array,
        required: true
    }
});

const option = computed(() => ({
    backgroundColor: 'transparent',
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(139,92,246,0.95)',
        borderColor: '#8B5CF6',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: '{c} mmol/L'
    },
    grid: {
        left: '12%',
        right: '12%',
        top: '15%',
        bottom: '20%'
    },
    xAxis: {
        type: 'category',
        data: props.data.map((_, i) => `第${i + 1}次`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8 }
    },
    yAxis: {
        type: 'value',
        min: 0,
        max: 15,
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
    },
    series: [{
        type: 'bar',
        data: props.data,
        barWidth: '50%',
        itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#c084fc' },
                { offset: 1, color: '#8B5CF6' }
            ]),
            borderRadius: [6, 6, 0, 0]
        },
        label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#c084fc',
            fontSize: 10,
            fontWeight: 'bold'
        }
    }]
}));
</script>

<style scoped>
.blood-echart {
    width: 100%;
    height: 100%;
}
</style>