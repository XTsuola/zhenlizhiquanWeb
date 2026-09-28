<template>
    <div class="radar" :class="{ compact }">
        <div ref="chartEl" class="chart" role="img" :aria-label="ariaLabel"></div>
        <div v-if="!compact" class="chips">
            <span
                v-for="axis in axes"
                :key="'chip-' + axis.key"
                class="chip"
                :style="{ '--tone': axis.color }"
            >
                <em>{{ axis.label }}</em>
                <b>{{ axis.display }}</b>
                <small v-if="axis.key === 'sample' && sampleCount != null">{{ sampleCount }}套</small>
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { init, type ECharts } from "echarts";
import { REVIEW_AXES, SCORE_COLORS, clampScore, scoreColor } from "@/data/heroData/review";

const props = defineProps<{
    dungeon?: number | null;
    pvp?: number | null;
    boss?: number | null;
    growth?: number | null;
    sample?: number | null;
    sampleCount?: number;
    compact?: boolean;
}>();

const chartEl = ref<HTMLElement>();
let chart: ECharts | null = null;

const values = computed(() => ({
    dungeon: props.dungeon ?? null,
    pvp: props.pvp ?? null,
    boss: props.boss ?? null,
    growth: props.growth ?? null,
    sample: props.sample ?? null
}));

const axes = computed(() =>
    REVIEW_AXES.map((axis) => {
        const raw = values.value[axis.key];
        const labeled = raw != null;
        const score = clampScore(raw || 1);
        return {
            key: axis.key,
            label: axis.label,
            short: axis.short,
            score,
            labeled,
            display: labeled ? String(score) : "未评",
            color: labeled ? SCORE_COLORS[score] : "#94a3b8"
        };
    })
);

const avgColor = computed(() => {
    const avg = axes.value.reduce((s, a) => s + a.score, 0) / axes.value.length;
    return scoreColor(avg);
});

const ariaLabel = computed(() =>
    axes.value
        .map(
            (a) =>
                `${a.label} ${a.display}${a.key === "sample" && props.sampleCount != null ? `(${props.sampleCount})` : ""}`
        )
        .join("，")
);

function buildOption() {
    const list = axes.value;
    // echarts 6 雷达轴按逆时针排列，反转后与原先顺时针五维一致
    const ordered = [list[0], ...list.slice(1).reverse()];
    const color = avgColor.value;
    const compact = !!props.compact;
    return {
        animation: false,
        tooltip: {
            trigger: "item",
            confine: true,
            backgroundColor: "#fff",
            borderColor: "#e8ebf0",
            textStyle: { color: "#1f2937", fontSize: compact ? 11 : 12 },
            formatter: () =>
                list
                    .map((a) => {
                        const extra =
                            a.key === "sample" && props.sampleCount != null ? ` · ${props.sampleCount}套` : "";
                        return `<span style="display:inline-block;margin-right:6px;width:8px;height:8px;border-radius:50%;background:${a.color}"></span>${a.label}　<b style="color:${a.color}">${a.display}</b>${extra}`;
                    })
                    .join("<br/>")
        },
        radar: {
            center: ["50%", "52%"],
            radius: compact ? "58%" : "62%",
            startAngle: 90,
            splitNumber: 5,
            axisName: {
                fontSize: compact ? 10 : 12,
                fontWeight: 700
            },
            axisNameGap: compact ? 4 : 8,
            axisLine: { lineStyle: { color: "#e2e8f0" } },
            splitLine: { lineStyle: { color: "#e2e8f0" } },
            splitArea: {
                areaStyle: {
                    color: ["rgba(248,250,252,0.96)", "rgba(241,245,249,0.96)"]
                }
            },
            indicator: ordered.map((a) => ({
                name: a.labeled ? `${a.short} ${a.score}` : `${a.short} 未评`,
                max: 5,
                color: a.color
            }))
        },
        series: [
            {
                type: "radar",
                symbol: "circle",
                symbolSize: compact ? 5 : 8,
                lineStyle: { width: compact ? 1.5 : 2, color },
                itemStyle: { color, borderColor: "#fff", borderWidth: 1 },
                areaStyle: { color, opacity: 0.22 },
                data: [{ value: ordered.map((a) => a.score), name: "评测" }]
            }
        ]
    };
}

function render() {
    if (!chart) return;
    chart.setOption(buildOption(), true);
}

function onResize() {
    chart?.resize();
}

onMounted(() => {
    if (!chartEl.value) return;
    chart = init(chartEl.value, null, { renderer: "svg" });
    render();
    window.addEventListener("resize", onResize);
});

watch(
    () => [props.dungeon, props.pvp, props.boss, props.growth, props.sample, props.sampleCount, props.compact],
    () => render()
);

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
    chart?.dispose();
    chart = null;
});
</script>

<style lang="less" scoped>
.radar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
}

.chart {
    width: 100%;
    max-width: 300px;
    height: 228px;
}

.compact .chart {
    max-width: none;
    height: 148px;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    width: 100%;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 7px;
    height: 22px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--tone) 12%, #fff);
    border: 1px solid color-mix(in srgb, var(--tone) 35%, #e8ebf0);

    em {
        font-style: normal;
        font-size: 11px;
        color: #64748b;
    }

    b {
        font-size: 12px;
        font-weight: 700;
        color: var(--tone);
        font-variant-numeric: tabular-nums;
    }

    small {
        font-size: 10px;
        color: #94a3b8;
        font-variant-numeric: tabular-nums;
    }
}
</style>
