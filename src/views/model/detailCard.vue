<template>
    <div style="border: 1px solid #ccc;">
        <div>
            <div
                style="background: #efefef;padding: 10px 0 10px 15px;border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;">
                <div style="font-weight: bold">{{ prop.detailData.name }}</div>
                <div style="margin-right: 10px;">
                    <a-button size="small" style="margin-right: 8px;" :disabled="nowlevel == 0"
                        @click="nowlevel--">上一级</a-button>
                    <a-button size="small" :disabled="nowlevel == 21" @click="nowlevel++">下一级</a-button>
                </div>
            </div>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    种族
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ zhenyinList[prop.detailData.zhenyin - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    等级
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ nowlevel + 1 }}
                    <a-button size="small" style="margin-left:auto;" @click="nowlevel = 9">跳转至10级</a-button>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    消耗
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.cost }}
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    图片
                </a-col>
                <a-col class="aCol" :span="18">
                    <img style="width: 70px;height: 70px;" :src="prop.detailData.img" />
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    攻击
                </a-col>
                <a-col class="aCol" :span="18">
                    <span v-if="prop.detailData.type == 2 || prop.detailData.type == 3">/</span>
                    <span v-else>{{ prop.detailData.data[nowlevel].attack }}</span>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    生命
                </a-col>
                <a-col class="aCol" :span="18">
                    <span v-if="prop.detailData.type == 2 || prop.detailData.type == 3">/</span>
                    <span v-else>{{ prop.detailData.data[nowlevel].life }}</span>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    效果描述
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.data[nowlevel].effect }}
                </a-col>
            </a-row>
            <a-row v-if="skinData.findIndex((e: any) => e.cardId == prop.detailData.id) != -1" type="flex"
                class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    皮肤效果
                </a-col>
                <a-col class="aCol" :span="18">
                    <div style="display: flex;justify-content: flex-start;flex-wrap: wrap;">
                        <div v-for="(value, i) in skinData.filter((e: any) => e.cardId == prop.detailData.id)">
                            【{{ value.name }}】：{{ value.effect.at(-1) }}
                            <hr v-if="i < skinData.filter((e: any) => e.cardId == prop.detailData.id).length - 1" />
                        </div>
                    </div>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    卡牌品质
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ qualityList[prop.detailData.quality - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" :class="showLine > 1 ? 'border_bottom' : ''">
                <a-col class="aCol border_right" :span="6">
                    卡牌评级
                </a-col>
                <a-col class="aCol" :span="18">
                    <a-tag :color="getGradeColor(prop.detailData.grade)">{{ getGradeName(prop.detailData.grade)
                    }}</a-tag>
                    <a-button v-if="showLine > 0" size="small" style="margin-left:auto;" @click="showisHero">{{
                        showLine > 1
                            ?
                            "关闭" : "打开"
                    }}提升曲线</a-button>
                </a-col>
            </a-row>
            <a-row type="flex" v-if="showLine > 1">
                <a-col class="aCol border_right" :span="6">
                    成长曲线
                </a-col>
                <a-col class="aCol" :span="18">
                    <div ref="myEcharts" style="height: 300px;width: 100%;"></div>
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { init } from "echarts";
import { qualityList, zhenyinList } from "@/utils/func";
import skinData from "@/data/skinData/skinData";

console.log(skinData, "ppp")

declare var window: any;
const prop = defineProps<{
    detailData: any
    level?: number
}>();

const nowlevel = ref(21);
if (prop.level) nowlevel.value = prop.level - 1;
const gradeList = [{
    label: "SS真神",
    value: 6,
    color: "#000000"
}, {
    label: "S顶级",
    value: 5,
    color: "#ff0000"
}, {
    label: "A+超级",
    value: 4,
    color: "#ff6633"
}, {
    label: "A高级",
    value: 3,
    color: "#ff6633"
}, {
    label: "B能带",
    value: 2,
    color: "#8e488e"
}, {
    label: "C普通",
    value: 1,
    color: "#2db7f5"
}, {
    label: "D垃圾",
    value: 0,
    color: "#87d068"
}];
const showLine = ref(0);
if (prop.detailData.type == 1) showLine.value = 1;
let myCharts: any = null;
const myEcharts = ref();

function getGradeName(grade: string) {
    if (grade != "") return gradeList.find(e => e.value == JSON.parse(grade)[0])?.label;
    return "暂无";
}

function getGradeColor(grade: string) {
    if (grade != "") return gradeList.find(e => e.value == JSON.parse(grade)[0])?.color;
    return "#cccccc";
}

function drawLine() {
    const option = {
        legend: {
            data: ['攻击', '生命']
        },
        xAxis: {
            type: 'category',
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: "攻击",
                data: prop.detailData.data.map((e: any) => e.attack),
                type: 'line',
                showSymbol: false
            },
            {
                name: "生命",
                data: prop.detailData.data.map((e: any) => e.life),
                type: 'line',
                showSymbol: false
            }
        ]
    };
    if (myEcharts.value) {
        myCharts = init(myEcharts.value);
        myCharts.setOption(option);
    }
}

function showisHero() {
    if (showLine.value == 1) {
        showLine.value = 2;
        nextTick(() => {
            drawLine();
        })
    } else {
        showLine.value = 1;
    }
}

function resizeChart() {
    if (myCharts) myCharts.resize();
}

onMounted(() => {
    window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
});

</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}

.border_right {
    border-right: 1px solid #ccc;
}

.border_bottom {
    border-bottom: 1px solid #ccc;
}
</style>