<template>
    <div class="sleep-echart">
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

const latestHours = computed(() => {
    if (!props.data || props.data.length === 0) return 0;
    return props.data[props.data.length - 1] / 1;
});

const option = computed(() => ({
    backgroundColor: 'transparent',
    series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '83%'],
        radius: '110%',
        min: 0,
        max: 12,
        splitNumber: 6,
        itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#22c55e' },
                { offset: 1, color: '#4ade80' }
            ])
        },
        progress: {
            show: true,
            width: 20,
            roundCap: true
        },
        pointer: {
            show: false
        },
        axisLine: {
            lineStyle: {
                width: 18,
                color: [[1, 'rgba(34,197,94,0.2)']]
            },
            roundCap: true
        },
        axisTick: {
            distance: -25,
            length: 8,
            lineStyle: {
                color: '#22c55e',
                width: 2
            }
        },
        splitLine: {
            distance: -30,
            length: 12,
            lineStyle: {
                color: '#22c55e',
                width: 3
            }
        },
        axisLabel: {
            distance: -10,
            color: 'rgba(34,197,94,0.8)',
            fontSize: 12,
            formatter: '{value}'
        },
        anchor: { show: false },
        title: { show: false },
        detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 24,
            borderRadius: 8,
            offsetCenter: [0, '10%'],
            fontSize: 24,
            fontWeight: 'bold',
            formatter: () => latestHours.value.toFixed(1) + 'h',
            color: '#4ade80'
        },
        data: [{ value: latestHours.value }]
    }]
}));
</script>

<style scoped>
.sleep-echart {
    width: 100%;
    height: 100%;
}
</style>