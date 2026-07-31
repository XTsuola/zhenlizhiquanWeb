<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">查询统计</h1>
            <div class="actions">
                <a-date-picker v-model:value="nowDate" :disabled-date="disabledDate" placeholder="选择日期"
                    @change="drawAll" />
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <a-spin :spinning="loading">
            <div class="stat">今日总查询数：{{ total }}</div>
            <div class="charts">
                <div class="chart-card">
                    <div class="chart" ref="myEcharts1"></div>
                </div>
                <div class="chart-card">
                    <div class="chart" ref="myEcharts2"></div>
                </div>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { init, type ECharts } from "echarts";
import { logList } from "@/api/log";
import type { Dayjs } from "dayjs";
import router from "@/router";

const HOURS = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];
const total = ref(0);
const loading = ref(false);
const nowDate = ref<Dayjs>();
const originData = ref<any[]>([]);
const startTime = ref<Date>();
const endTime = ref<Date>();
const myEcharts1 = ref<HTMLElement>();
const myEcharts2 = ref<HTMLElement>();
let myCharts1: ECharts | null = null;
let myCharts2: ECharts | null = null;

function disabledDate(current: Dayjs) {
    if (!startTime.value || !endTime.value) return false;
    const now = new Date(current.valueOf());
    const start = new Date(startTime.value.getFullYear(), startTime.value.getMonth(), startTime.value.getDate());
    const end = new Date(endTime.value.getFullYear(), endTime.value.getMonth(), endTime.value.getDate() + 1);
    return now < start || now > end;
}

async function getNowData() {
    loading.value = true;
    try {
        const res = await logList();
        if (res.data.code == 200 && res.data.data?.length) {
            originData.value = res.data.data;
            startTime.value = new Date(res.data.data.at(-1).time);
            endTime.value = new Date(res.data.data[0].time);
            drawAll();
        }
    } finally {
        loading.value = false;
    }
}

function drawAll() {
    let now = new Date();
    if (nowDate.value != undefined) {
        now = new Date(nowDate.value.valueOf());
    }
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const data = originData.value.filter((e: any) => new Date(e.time) > todayMidnight && new Date(e.time) < tomorrowMidnight);
    total.value = data.length;
    const data1: { name: string; value: number }[] = [];
    const data2Y = new Array(24).fill(0);
    for (let i = 0; i < data.length; i++) {
        const index = data1.findIndex((e) => e.name == data[i].name);
        if (index == -1) {
            data1.push({ name: data[i].name, value: 1 });
        } else {
            data1[index].value++;
        }
        data2Y[new Date(data[i].time).getHours()]++;
    }
    data1.sort((a, b) => a.value - b.value);
    drawPie(data1);
    drawLine(data2Y);
}

function ensureChart(el: HTMLElement | undefined, existing: ECharts | null) {
    if (!el) return null;
    if (existing) return existing;
    return init(el);
}

function drawPie(data: { name: string; value: number }[]) {
    myCharts1 = ensureChart(myEcharts1.value, myCharts1);
    if (!myCharts1) return;
    myCharts1.setOption({
        title: {
            text: "当日查询类型分布",
            left: "center",
            textStyle: { fontSize: 14, fontWeight: 600, color: "#1f2937" }
        },
        tooltip: { trigger: "item" },
        color: ["#4f9bc4", "#45a8b0", "#5a8fc0", "#6a9bb0", "#7bb3c9", "#3d8aad"],
        series: [
            {
                type: "pie",
                radius: ["28%", "52%"],
                center: ["50%", "55%"],
                data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 8,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.25)"
                    }
                },
                label: { fontSize: 11 }
            }
        ]
    });
}

function drawLine(data: number[]) {
    let nowHour = 23;
    if (!(nowDate.value && new Date(nowDate.value.valueOf()) < new Date())) {
        nowHour = new Date().getHours();
    }
    myCharts2 = ensureChart(myEcharts2.value, myCharts2);
    if (!myCharts2) return;
    myCharts2.setOption({
        title: {
            text: "当日查询时间分布",
            left: "center",
            textStyle: { fontSize: 14, fontWeight: 600, color: "#1f2937" }
        },
        tooltip: { trigger: "axis" },
        grid: { left: 40, right: 16, top: 48, bottom: 28 },
        xAxis: {
            type: "category",
            data: HOURS.slice(0, nowHour + 1),
            axisLabel: { fontSize: 10 }
        },
        yAxis: {
            type: "value",
            minInterval: 1,
            splitLine: { lineStyle: { color: "#eef1f5" } }
        },
        series: [
            {
                data: data.slice(0, nowHour + 1),
                type: "line",
                smooth: true,
                showSymbol: false,
                lineStyle: { color: "#4f9bc4", width: 2 },
                areaStyle: { color: "rgba(79, 155, 196, 0.15)" }
            }
        ]
    });
}

function resizeChart() {
    myCharts1?.resize();
    myCharts2?.resize();
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getNowData();
    window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart);
    myCharts1?.dispose();
    myCharts2?.dispose();
    myCharts1 = null;
    myCharts2 = null;
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    overflow-x: hidden;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.stat {
    text-align: center;
    margin-bottom: 12px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2937;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.charts {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.chart-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.chart {
    height: 280px;
    width: 100%;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .chart {
        height: 320px;
    }
}
</style>
