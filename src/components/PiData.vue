<template>
    <div class="pi-echart">
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
        backgroundColor: 'rgba(255,183,77,0.95)',
        borderColor: '#FFB74D',
        textStyle: { color: '#1a1a2e', fontSize: 11 },
        formatter: 'PI: {c}'
    },
    grid: {
        left: '12%',
        right: '12%',
        top: '15%',
        bottom: '20%'
    },
    xAxis: {
        type: 'category',
        data: props.data.map((_, i) => `${i + 1}`),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
    },
    yAxis: {
        type: 'value',
        min: 0,
        max: 10,
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
        symbolSize: 10,
        lineStyle: {
            color: '#FFB74D',
            width: 3,
            shadowBlur: 12,
            shadowColor: 'rgba(255,183,77,0.6)'
        },
        itemStyle: {
            color: '#FFD54F',
            borderWidth: 3,
            borderColor: '#fff'
        },
        areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,183,77,0.4)' },
                { offset: 1, color: 'rgba(255,183,77,0.05)' }
            ])
        },
        label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#FFD54F',
            fontSize: 10,
            fontWeight: 'bold'
        }
    }]
}));
</script>

<style scoped>
.pi-echart {
    width: 100%;
    height: 100%;
}
</style>