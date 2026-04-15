<template>
    <div class="heart-echart">
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
        backgroundColor: 'rgba(255,107,107,0.95)',
        borderColor: '#ff6b6b',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: '{c} bpm'
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
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8 }
    },
    yAxis: {
        type: 'value',
        min: 40,
        max: 120,
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
    },
    series: [{
        type: 'line',
        data: props.data,
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: {
            color: '#ff6b6b',
            width: 4,
            shadowBlur: 15,
            shadowColor: 'rgba(255,107,107,0.7)'
        },
        itemStyle: {
            color: '#ff6b6b',
            borderWidth: 3,
            borderColor: '#fff'
        },
        label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#ff6b6b',
            fontSize: 10,
            fontWeight: 'bold'
        },
        areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,107,107,0.4)' },
                { offset: 1, color: 'rgba(255,107,107,0.05)' }
            ])
        }
    }]
}));
</script>

<style scoped>
.heart-echart {
    width: 100%;
    height: 100%;
}
</style>