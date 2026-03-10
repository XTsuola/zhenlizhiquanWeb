<template>
    <div class="search">
        <a-button @click="goBack">返回</a-button>
        <a-date-picker v-model:value="nowDate" :disabled-date="disabledDate" @change="drawAll" />
    </div>
    <div class="content">
        <div class="content_box">
            <div class="content_box_chart" ref="myEcharts1"></div>
        </div>
        <div class="content_box">
            <div class="content_box_chart" ref="myEcharts2"></div>
        </div>
    </div>
    <div class="footer">
        今日总查询数：{{ total }}
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { init } from "echarts";
import { logList } from "@/api/log";
import type { Dayjs } from 'dayjs';
import router from "@/router";

declare var window: any;

const total = ref<number>(0);
const nowDate = ref<Dayjs>();
const originData = ref<any>([]);
const startTime = ref<any>();
const endTime = ref<any>();
let myCharts1: any = null;
const myEcharts1 = ref();
let myCharts2: any = null;
const myEcharts2 = ref();
const data2X = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];


function disabledDate(current: Dayjs) {
    const now = new Date(current.valueOf());
    const start = new Date(startTime.value.getFullYear(), startTime.value.getMonth(), startTime.value.getDate());
    const end = new Date(endTime.value.getFullYear(), endTime.value.getMonth(), endTime.value.getDate() + 1);
    return current && (now < start || now > end);
};

async function getNowData() {
    const res = await logList();
    if (res.data.code == 200) {
        originData.value = res.data.data;
        startTime.value = new Date(res.data.data.at(-1).time);
        endTime.value = new Date(res.data.data[0].time);
        drawAll();
    }
}

function drawAll() {
    let now = new Date();
    if (nowDate.value != undefined) {
        now = new Date(nowDate.value.valueOf())
    }
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const data = originData.value.filter((e: any) => new Date(e.time) > todayMidnight && new Date(e.time) < tomorrowMidnight);
    total.value = data.length;
    const data1: any = [];
    const data2Y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < data.length; i++) {
        const index = data1.findIndex((e: any) => e.name == data[i].name);
        if (index == -1) {
            data1.push({
                name: data[i].name,
                value: 1
            });
        } else {
            data1[index].value++;
        }
        const hour = new Date(data[i].time).getHours();
        data2Y[hour]++;
    }
    data1.sort((a: any, b: any) => a.value - b.value);
    drawPie(data1);
    drawLine(data2Y);
}

function drawPie(data: any) {
    const option = {
        title: {
            text: '当日查询类型分布图',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                type: 'pie',
                radius: '40%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    if (myEcharts1.value) {
        myCharts1 = init(myEcharts1.value);
        myCharts1.setOption(option);
    }
}

function drawLine(data: any) {
    let nowHour = 23
    if (!(nowDate.value && new Date(nowDate.value.valueOf()) < new Date())) nowHour = new Date().getHours();
    const option = {
        title: {
            text: '当日查询时间分布图',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: data2X.slice(0, nowHour + 1)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: data.slice(0, nowHour + 1),
                type: 'line',
                smooth: true,
                showSymbol: false
            }
        ]
    };
    if (myEcharts2.value) {
        myCharts2 = init(myEcharts2.value);
        myCharts2.setOption(option);
    }
}

function resizeChart() {
    if (myCharts1) myCharts1.resize();
    if (myCharts2) myCharts2.resize();
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getNowData();
    window.addEventListener('resize', resizeChart); // 添加窗口大小变化监听器
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart); // 移除监听器以避免内存泄漏
});

</script>
<style lang="less" scoped>
.search {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    padding: 5px 10px;
    margin-bottom: 5px;
}

.content {
    padding: 15px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .content_box {
        height: 280px;
        width: 100vw;

        .content_box_chart {
            height: 100%;
            width: 100%;
        }
    }


}

.footer {
    text-align: center;
    font-weight: bold;
    font-size: 18px;
}
</style>