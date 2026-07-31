<template>
    <div class="detail">
        <div class="detail-head">
            <h3 class="name">{{ prop.detailData.name }}</h3>
            <div class="level-actions">
                <a-button size="small" :disabled="nowlevel == 0" @click="nowlevel--">上一级</a-button>
                <a-button size="small" :disabled="nowlevel >= maxLevel" @click="nowlevel++">下一级</a-button>
            </div>
        </div>
        <div class="detail-body">
            <div class="row">
                <div class="label">种族</div>
                <div class="value">{{ zhenyinList[prop.detailData.zhenyin - 1] || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">等级</div>
                <div class="value value--actions">
                    <span>{{ nowlevel + 1 }}</span>
                    <a-button size="small" @click="nowlevel = Math.min(9, maxLevel)">跳转至10级</a-button>
                </div>
            </div>
            <div class="row">
                <div class="label">消耗</div>
                <div class="value">{{ prop.detailData.cost }}</div>
            </div>
            <div class="row">
                <div class="label">图片</div>
                <div class="value">
                    <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                </div>
            </div>
            <div class="row">
                <div class="label">攻击</div>
                <div class="value">
                    <span v-if="isSpell">/</span>
                    <span v-else>{{ currentData?.attack ?? "-" }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">生命</div>
                <div class="value">
                    <span v-if="isSpell">/</span>
                    <span v-else>{{ currentData?.life ?? "-" }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">效果描述</div>
                <div class="value effect">{{ currentData?.effect || "-" }}</div>
            </div>
            <div v-if="relatedSkins.length" class="row">
                <div class="label">皮肤效果</div>
                <div class="value effect">
                    <div v-for="(value, i) in relatedSkins" :key="value.name + i" class="skin-item">
                        【{{ value.name }}】：{{ value.effect?.at?.(-1) ?? value.effect }}
                        <hr v-if="i < relatedSkins.length - 1" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">卡牌品质</div>
                <div class="value">
                    <a-tag :color="getQualityColor(prop.detailData.quality)">
                        {{ getQualityName(prop.detailData.quality) }}
                    </a-tag>
                </div>
            </div>
            <div class="row" :class="{ 'row--last': showLine <= 1 }">
                <div class="label">卡牌评级</div>
                <div class="value value--actions">
                    <div v-if="getGradeName(prop.detailData.grade) == 'SSS真神'" class="tagBg">
                        {{ getGradeName(prop.detailData.grade) }}
                    </div>
                    <a-tag v-else :color="getGradeColor(prop.detailData.grade)">
                        {{ getGradeName(prop.detailData.grade) }}
                    </a-tag>
                    <a-button v-if="showLine > 0" size="small" @click="showisHero">
                        {{ showLine > 1 ? "关闭" : "打开" }}提升曲线
                    </a-button>
                </div>
            </div>
            <div v-if="showLine > 1" class="row row--last">
                <div class="label">成长曲线</div>
                <div class="value chart-wrap">
                    <div ref="myEcharts" class="chart"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { init } from "echarts";
import { zhenyinList } from "@/utils/func";
import skinData from "@/data/skinData/skinData";

const prop = defineProps<{
    detailData: any;
    level?: number;
}>();
const nowlevel = ref(23);
if (prop.level) nowlevel.value = prop.level - 1;
const maxLevel = computed(() => Math.max((prop.detailData?.data?.length || 1) - 1, 0));
const isSpell = computed(() => prop.detailData.type == 2 || prop.detailData.type == 3);
const currentData = computed(() => {
    const list = prop.detailData?.data;
    if (!list?.length) return null;
    return list[Math.min(nowlevel.value, list.length - 1)];
});
const relatedSkins = computed(() =>
    (skinData as any[]).filter((e) => e.cardId == prop.detailData.id)
);
const gradeList = [
    { label: "SSS真神", value: 6, color: "#000000" },
    { label: "SS神话", value: 5, color: "#000000" },
    { label: "S顶级", value: 4, color: "#ff0000" },
    { label: "A高级", value: 3, color: "#ff6633" },
    { label: "B能带", value: 2, color: "#8e488e" },
    { label: "C普通", value: 1, color: "#2db7f5" },
    { label: "D垃圾", value: 0, color: "#87d068" }
];
const qualityColorList = [
    { label: "橙卡", value: 4, color: "orange" },
    { label: "紫卡", value: 3, color: "purple" },
    { label: "蓝卡", value: 2, color: "blue" },
    { label: "白卡", value: 1, color: "lightgray" }
];
const showLine = ref(prop.detailData.type == 1 ? 1 : 0);
let myCharts: any = null;
const myEcharts = ref();

function parseGrade(grade: string) {
    if (!grade) return null;
    try {
        const nowGrade = JSON.parse(grade);
        return gradeList.find((e) => e.value == nowGrade[0]) || null;
    } catch {
        return null;
    }
}

function getGradeName(grade: string) {
    return parseGrade(grade)?.label || "暂无";
}

function getGradeColor(grade: string) {
    return parseGrade(grade)?.color || "#cccccc";
}

function getQualityName(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.label || "-";
}

function getQualityColor(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.color || "#cccccc";
}

function drawLine() {
    const option = {
        legend: { data: ["攻击", "生命"] },
        xAxis: {
            type: "category",
            data: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
        },
        yAxis: { type: "value" },
        series: [
            {
                name: "攻击",
                data: prop.detailData.data.slice(9, 24).map((e: any) => e.attack),
                type: "line",
                showSymbol: false
            },
            {
                name: "生命",
                data: prop.detailData.data.slice(9, 24).map((e: any) => e.life),
                type: "line",
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
        nextTick(() => drawLine());
    } else {
        showLine.value = 1;
    }
}

function resizeChart() {
    if (myCharts) myCharts.resize();
}

onMounted(() => {
    window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart);
    myCharts?.dispose?.();
});
</script>

<style lang="less" scoped>
.detail {
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #f7f8fa;
    border-bottom: 1px solid #e8ebf0;
}

.name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.level-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.row {
    display: grid;
    grid-template-columns: 88px 1fr;
    border-bottom: 1px solid #eef1f5;

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: #fafbfc;
    border-right: 1px solid #eef1f5;
    color: #6b7280;
    font-size: 13px;
    display: flex;
    align-items: center;
}

.value {
    padding: 10px 12px;
    color: #1f2937;
    font-size: 13px;
    display: flex;
    align-items: center;
    min-width: 0;
    word-break: break-word;

    &--actions {
        justify-content: space-between;
        gap: 8px;
    }
}

.effect {
    line-height: 1.55;
    white-space: pre-wrap;
    display: block;
}

.skin-item {
    width: 100%;
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #e8ebf0;
    display: block;
}

.chart-wrap {
    display: block;
}

.chart {
    height: 300px;
    width: 100%;
}

.tagBg {
    margin: 0;
    width: 60px;
    min-height: 22px;
    color: #ffffff;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    border-radius: 4px;
    background: linear-gradient(45deg, #111, #aa8b3b, #ffd700, #ff6b35, #e6b325, #c8a951, #111);
    background-size: 600% 600%;
    animation: colorGold 10s ease infinite;
}

@keyframes colorGold {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}
</style>
