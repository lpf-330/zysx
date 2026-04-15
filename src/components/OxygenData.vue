<template>
    <div class="oxygen-echart">
        <v-chart :option="option" autoresize />
        <div class="oxygen-value">{{ displayValue }}<span class="percent">%</span></div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    data: {
        type: Number,
        default: 0
    }
});

const displayValue = computed(() => {
    if (!props.data || props.data === 0) return '--';
    return (props.data * 100).toFixed(1);
});

const option = computed(() => ({
    backgroundColor: 'transparent',
    series: [{
        type: 'liquidFill',
        radius: '90%',
        center: ['50%', '50%'],
        label: { show: false },
        color: [{
            type: 'linear',
            x: 0, y: 1, x2: 0, y2: 0,
            colorStops: [
                { offset: 0, color: '#00D4FF' },
                { offset: 0.3, color: '#0EA5E9' },
                { offset: 0.7, color: '#6366f1' },
                { offset: 1, color: '#8b5cf6' }
            ]
        }],
        waveAnimation: true,
        animationDuration: 3000,
        animationDurationUpdate: 1000,
        frequency: 3,
        phases: 0,
        amplitude: 20,
        waveLength: '50%',
        period: 'auto',
        direction: 'right',
        shape: 'circle',
        waveOffset: 0,
        waveCount: 3,
        data: [{
            value: ((displayValue.value || 0) / 100).toFixed(3)
        }],
        backgroundStyle: {
            color: 'rgba(99,102,241,0.08)',
            borderWidth: 0
        },
        outline: {
            show: true,
            borderDistance: 0,
            itemStyle: {
                color: 'none',
                borderColor: 'rgba(0,212,255,0.8)',
                borderWidth: 4,
                shadowBlur: 30,
                shadowColor: 'rgba(0,212,255,0.8)'
            }
        },
        itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(99,102,241,0.8)'
        }
    }]
}));
</script>

<style scoped>
.oxygen-echart {
    width: 100%;
    height: 100%;
    position: relative;
}

.oxygen-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 20px rgba(0,212,255,1), 0 0 40px rgba(0,212,255,0.6);
    z-index: 10;
}

.oxygen-value .percent {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    margin-left: 1px;
}
</style>