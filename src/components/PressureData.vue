<template>
    <div class="pressure-echart">
        <div class="pressure-values">
            <div class="value-item high" style="left: 32%;">
                <span class="value">{{ props.data[0] || '--' }}</span>
                <span class="unit">mmHg</span>
            </div>
            <div class="value-item low" style="left: 66%;">
                <span class="value">{{ props.data[1] || '--' }}</span>
                <span class="unit">mmHg</span>
            </div>
        </div>
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
    grid: {
        left: '15%',
        right: '15%',
        top: '5%',
        bottom: '35%'
    },
    xAxis: {
        type: 'category',
        data: ['高压', '低压'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
    },
    yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 200
    },
    series: [{
        type: 'bar',
        data: [
            {
                value: props.data[0] || 0,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#f43f5e' },
                        { offset: 1, color: '#fda4af' }
                    ]),
                    borderRadius: [12, 12, 0, 0]
                }
            },
            {
                value: props.data[1] || 0,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#0ea5e9' },
                        { offset: 1, color: '#7dd3fc' }
                    ]),
                    borderRadius: [12, 12, 0, 0]
                }
            }
        ],
        barWidth: '50%'
    }]
}));
</script>

<style scoped>
.pressure-echart {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.pressure-values {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 40%;
    display: flex;
    justify-content: center;
    gap: 50px;
    z-index: 10;
}

.value-item {
    position: absolute;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 0px;
    transform: translateX(-50%);
}

.value-item .value {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    line-height: 1;
}

.value-item .unit {
    font-size: 10px;
    color: rgba(255,255,255,0.7);
}

.value-item.high .value {
    color: #fda4af;
    text-shadow: 0 0 10px rgba(253,164,175,0.8);
}

.value-item.low .value {
    color: #7dd3fc;
    text-shadow: 0 0 10px rgba(125,211,252,0.8);
}
</style>