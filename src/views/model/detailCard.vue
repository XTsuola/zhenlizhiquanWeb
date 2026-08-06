<template>
    <div class="detail" :class="qualityToneClass">
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
                    <span class="strong">{{ nowlevel + 1 }}</span>
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
                    <div class="avatar-wrap">
                        <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">攻击</div>
                <div class="value">
                    <span v-if="isSpell">/</span>
                    <span v-else class="strong strong--atk">{{ currentData?.attack ?? "-" }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">生命</div>
                <div class="value">
                    <span v-if="isSpell">/</span>
                    <span v-else class="strong strong--hp">{{ currentData?.life ?? "-" }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">效果描述</div>
                <div class="value">
                    <div class="effect">{{ currentData?.effect || "-" }}</div>
                </div>
            </div>
            <div v-if="relatedSkins.length" class="row">
                <div class="label">皮肤效果</div>
                <div class="value">
                    <div class="skin-list">
                        <div v-for="(value, i) in relatedSkins" :key="value.name + i" class="skin-item">
                            <span class="skin-name">【{{ value.name }}】</span>
                            <span class="skin-effect">{{ value.effect?.at?.(-1) ?? value.effect }}</span>
                        </div>
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
import { skinData } from "@/data/skinData/skinData";

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
const qualityToneClass = computed(() => {
    const q = Number(prop.detailData.quality);
    if (q === 4) return "tone-orange";
    if (q === 3) return "tone-purple";
    if (q === 2) return "tone-blue";
    if (q === 1) return "tone-white";
    return "";
});
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
        legend: { data: ["攻击", "生命"], top: 0, textStyle: { fontSize: 11 } },
        grid: { left: 40, right: 12, top: 36, bottom: 28 },
        xAxis: {
            type: "category",
            data: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            axisLabel: { fontSize: 10 }
        },
        yAxis: { type: "value", axisLabel: { fontSize: 10 } },
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
    --accent: #5a8fc0;
    --line: color-mix(in srgb, var(--accent) 18%, #e8ebf0);
    --line-soft: color-mix(in srgb, var(--accent) 10%, #eef1f5);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent),
        0 2px 10px rgba(15, 23, 42, 0.04);
    border-left: 3px solid var(--accent);

    &.tone-white {
        --accent: #9ca3af;
    }

    &.tone-blue {
        --accent: #4f9bc4;
    }

    &.tone-purple {
        --accent: #8e488e;
    }

    &.tone-orange {
        --accent: #e67e22;
    }
}

.detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 14px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, #f8fafc), #f3f6f9 55%, #eef2f6);
    border-bottom: 1px solid var(--line);
}

.name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    word-break: break-all;
    min-width: 0;
    letter-spacing: 0.01em;
}

.level-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.row {
    display: grid;
    grid-template-columns: 84px 1fr;
    border-bottom: 1px solid var(--line-soft);
    min-height: 44px;
    transition: background 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--accent) 4%, #fff);
    }

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: color-mix(in srgb, var(--accent) 6%, #fafbfc);
    border-right: 1px solid var(--line-soft);
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
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
        flex-wrap: wrap;
    }
}

.strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 15px;
    color: #1f2937;

    &--atk {
        color: #4f9bc4;
    }

    &--hp {
        color: #45a8b0;
    }
}

.effect {
    width: 100%;
    line-height: 1.6;
    white-space: pre-wrap;
    padding: 8px 10px;
    border-radius: 8px;
    background: linear-gradient(180deg, #f8fafc, #f3f6f9);
    border: 1px solid var(--line-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    color: #374151;
}

.skin-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skin-item {
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    background: linear-gradient(180deg, #f8fafc, #f3f6f9);
    border: 1px solid var(--line-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.skin-name {
    display: block;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 2px;
}

.skin-effect {
    display: block;
    line-height: 1.55;
    white-space: pre-wrap;
    color: #4b5563;
}

.avatar-wrap {
    padding: 2px;
    border-radius: 10px;
    background: linear-gradient(145deg,
            color-mix(in srgb, var(--accent) 70%, #fff),
            #fff 42%,
            color-mix(in srgb, var(--accent) 45%, #dbe3ea));
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent),
        0 2px 8px color-mix(in srgb, var(--accent) 18%, transparent);
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: none;
    display: block;
    background: #fff;
}

.chart-wrap {
    display: block;
    width: 100%;
    padding: 6px;
    border-radius: 8px;
    background: linear-gradient(180deg, #f8fafc, #f3f6f9);
    border: 1px solid var(--line-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.chart {
    height: 280px;
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
    box-shadow: 0 1px 4px rgba(170, 139, 59, 0.35);
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

@media (max-width: 420px) {
    .detail-head {
        flex-wrap: wrap;
    }

    .row {
        grid-template-columns: 72px 1fr;
    }

    .label,
    .value {
        padding: 9px 10px;
        font-size: 12px;
    }
}
</style>
