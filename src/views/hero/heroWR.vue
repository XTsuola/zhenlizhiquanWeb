<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">英雄淘汰赛数据</h1>
                <p class="subtitle">{{ modeHint }}</p>
            </div>
            <div class="toolbar-actions">
                <a-segmented v-model:value="viewMode" size="small" :options="modeOptions" />
                <a-segmented v-model:value="displayMode" size="small" :options="displayOptions" />
                <a-button v-if="displayMode === 'detail'" :type="showCharts ? 'primary' : 'default'"
                    @click="toggleCharts">
                    {{ showCharts ? "收起曲线" : "胜率曲线" }}
                </a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <template v-if="displayMode === 'rate'">
            <div class="filter-bar">
                <a-input v-model:value="filterName" allow-clear placeholder="英雄名称" class="filter-field"
                    @pressEnter="searchRate" />
                <a-button type="primary" @click="searchRate">查询</a-button>
                <a-button @click="resetRate">清空</a-button>
                <span class="filter-tip">※ 出场次数 &lt; 20 不参与胜率排序</span>
            </div>
            <div class="table-wrap">
                <MyTabel :columnsData="rateColumns" :dataSource="rateTableData" :rowClass="true"
                    :scroll-x="rateScrollX" />
            </div>
        </template>
        <div v-else class="list">
            <div v-for="(item, index) in displayList" :key="item.id" class="card" :class="{ 'card--top': index < 3 }">
                <div class="card-head">
                    <span class="idx" :class="{ 'idx--top': index < 3 }">{{ index + 1 }}</span>
                    <img class="avatar" :src="item.img" :alt="item.name" />
                    <span class="name">{{ item.name }}</span>
                </div>
                <div class="summary">
                    <span class="pill"><em>出场</em>{{ item.total }}</span>
                    <span class="pill pill--win"><em>胜</em>{{ item.viewWin }}</span>
                    <span class="pill pill--lose"><em>负</em>{{ item.viewLose }}</span>
                    <span class="pill" :class="viewMode === 'top8' ? 'pill--rate' : 'pill--rate4'">
                        <em>胜率</em>{{ formatRate(item.viewWin, item.viewLose) }}
                    </span>
                </div>
                <div v-if="showCharts" class="chart-box">
                    <div :ref="(el) => setChartEl(item.id, el)" class="chart"></div>
                </div>
                <div class="ed-grid">
                    <div class="ed-head">
                        <span>届</span>
                        <span>出场</span>
                        <span>胜</span>
                        <span>负</span>
                        <span>胜率</span>
                    </div>
                    <div v-for="ed in editionsAsc" :key="ed" class="ed-row">
                        <span class="ed-label">{{ ed }}</span>
                        <span class="ed-count">{{ item.byEdition[ed]?.count || 0 }}</span>
                        <span class="ed-win">{{ edWin(item, ed) }}</span>
                        <span class="ed-lose">{{ edLose(item, ed) }}</span>
                        <span :class="viewMode === 'top8' ? 'ed-rate' : 'ed-rate4'">
                            {{ formatRate(edWin(item, ed), edLose(item, ed)) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { init } from "echarts";
import router from "@/router";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiData } from "@/data/shijiesaiData/all";
import MyTabel from "@/components/table.vue";

type ViewMode = "top8" | "top4";
type DisplayMode = "detail" | "rate";
type EditionStat = {
    count: number;
    win: number;
    lose: number;
    win4: number;
    lose4: number;
};

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";

const viewMode = ref<ViewMode>("top8");
const displayMode = ref<DisplayMode>("detail");
const filterName = ref("");
const rateKeyword = ref("");
const isNarrow = ref(window.innerWidth < 768);
const showCharts = ref(false);
const chartEls = new Map<number, HTMLElement>();
const chartInstances = new Map<number, any>();
const modeOptions = [
    { label: "8强", value: "top8" },
    { label: "4强", value: "top4" }
];
const displayOptions = [
    { label: "详细", value: "detail" },
    { label: "仅胜率", value: "rate" }
];

const modeHint = computed(() =>
    viewMode.value === "top8"
        ? "出场按 8 强英雄池 · 胜率统计（8强到决赛）"
        : "出场按 8 强英雄池 · 胜率统计（4强到决赛）"
);

/** 8强赛：no 后两位 01-04（用于出场） */
function isTop8Match(no: number) {
    const round = no % 100;
    return round >= 1 && round <= 4;
}

/** 淘汰赛：01-08（8强到决赛） */
function isPlayoffMatch(no: number) {
    const round = no % 100;
    return round >= 1 && round <= 8;
}

/** 4强到决赛：05-08 */
function isFinalFourMatch(no: number) {
    const round = no % 100;
    return round >= 5 && round <= 8;
}

function getEdition(no: number) {
    return Math.floor(no / 10000);
}

/** 1/3 A胜，2/4 B胜，0 弃权不计 */
function isAWin(n: number) {
    return n === 1 || n === 3;
}

function isBWin(n: number) {
    return n === 2 || n === 4;
}

function formatRate(win: number, lose: number) {
    const total = win + lose;
    if (!total) return "-";
    return `${((win / total) * 100).toFixed(1)}%`;
}

function emptyStat(): EditionStat {
    return { count: 0, win: 0, lose: 0, win4: 0, lose4: 0 };
}

const editionsAsc = (() => {
    const set = new Set<number>();
    for (const match of shijiesaiData) {
        if (!isPlayoffMatch(match.no)) continue;
        set.add(getEdition(match.no));
    }
    return [...set].sort((a, b) => a - b);
})();

/** 仅胜率表格：新届在前 */
const editionsDesc = [...editionsAsc].sort((a, b) => b - a);

const statsByHero = (() => {
    const playersByEdition = new Map<number, Map<string, number[]>>();
    const map = new Map<number, Record<number, EditionStat>>();

    const ensure = (heroId: number, ed: number) => {
        let row = map.get(heroId);
        if (!row) {
            row = {};
            map.set(heroId, row);
        }
        if (!row[ed]) row[ed] = emptyStat();
        return row[ed];
    };

    const takePlayer = (edition: number, name: string, heroes: number[]) => {
        if (!name || !heroes?.length) return;
        let players = playersByEdition.get(edition);
        if (!players) {
            players = new Map();
            playersByEdition.set(edition, players);
        }
        if (!players.has(name)) {
            players.set(name, heroes);
        }
    };

    const applyResult = (aId: number, bId: number, ed: number, n: number, finalFour: boolean) => {
        if (isAWin(n)) {
            ensure(aId, ed).win++;
            ensure(bId, ed).lose++;
            if (finalFour) {
                ensure(aId, ed).win4++;
                ensure(bId, ed).lose4++;
            }
        } else if (isBWin(n)) {
            ensure(aId, ed).lose++;
            ensure(bId, ed).win++;
            if (finalFour) {
                ensure(aId, ed).lose4++;
                ensure(bId, ed).win4++;
            }
        }
    };

    for (const match of shijiesaiData) {
        const ed = getEdition(match.no);

        if (isTop8Match(match.no)) {
            takePlayer(ed, match.AInfo?.name, match.AInfo?.hero || []);
            takePlayer(ed, match.BInfo?.name, match.BInfo?.hero || []);
        }

        if (!isPlayoffMatch(match.no)) continue;

        const finalFour = isFinalFourMatch(match.no);
        const aHeroes = match.AInfo?.hero || [];
        const bHeroes = match.BInfo?.hero || [];
        const list = match.shengfuList || [];
        for (let j = 0; j < list.length; j++) {
            const n = list[j];
            if (n === 0) continue;
            const slot = j % 4;
            const aId = aHeroes[slot];
            const bId = bHeroes[slot];
            if (aId == null || bId == null) continue;
            applyResult(aId, bId, ed, n, finalFour);
        }
    }

    for (const [ed, players] of playersByEdition) {
        for (const heroes of players.values()) {
            for (const heroId of heroes) {
                ensure(heroId, ed).count++;
            }
        }
    }

    return map;
})();

const heroList = computed(() =>
    heroTable.map((item) => {
        const byEdition = statsByHero.get(item.id) || {};
        let total = 0;
        let totalWin = 0;
        let totalLose = 0;
        let totalWin4 = 0;
        let totalLose4 = 0;
        for (const ed of editionsAsc) {
            const s = byEdition[ed];
            if (!s) continue;
            total += s.count;
            totalWin += s.win;
            totalLose += s.lose;
            totalWin4 += s.win4;
            totalLose4 += s.lose4;
        }
        return {
            id: item.id,
            name: item.name,
            img: IMG_PREFIX + item.img,
            byEdition,
            total,
            totalWin,
            totalLose,
            totalWin4,
            totalLose4
        };
    })
);

const displayList = computed(() => {
    const isTop8 = viewMode.value === "top8";
    return heroList.value
        .map((item) => {
            const viewWin = isTop8 ? item.totalWin : item.totalWin4;
            const viewLose = isTop8 ? item.totalLose : item.totalLose4;
            const games = viewWin + viewLose;
            const rate = games ? viewWin / games : -1;
            return { ...item, viewWin, viewLose, rate };
        })
        .sort((a, b) => b.total - a.total || b.rate - a.rate || a.id - b.id);
});

const rateColumns = computed(() => {
    /** 手机端不用 fixed，避免挡住横向滑动 */
    const fix = isNarrow.value ? undefined : ("left" as const);
    const cols: any[] = [
        {
            title: "头像",
            dataIndex: "headImg",
            key: "headImg",
            width: isNarrow.value ? 52 : 64,
            fixed: fix
        },
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: isNarrow.value ? 176 : 180,
            fixed: fix
        },
        {
            title: "出场",
            dataIndex: "total",
            key: "total",
            width: 72,
            align: "center",
            sorter: (a: any, b: any) => a.total - b.total,
            customRender: ({ text, record }: any) =>
                record.total < 20 ? `${text}※` : text
        },
        {
            title: "总胜率",
            dataIndex: "rateText",
            key: "rateText",
            width: 84,
            align: "center",
            sorter: (a: any, b: any) => rateSortValue(a) - rateSortValue(b)
        }
    ];
    for (const ed of editionsDesc) {
        cols.push({
            title: `第${ed}届`,
            dataIndex: `ed${ed}`,
            key: `ed${ed}`,
            width: 76,
            align: "center",
            sorter: (a: any, b: any) => {
                const av = a.total >= 20 ? (a[`ed${ed}Rate`] ?? -1) : -2;
                const bv = b.total >= 20 ? (b[`ed${ed}Rate`] ?? -1) : -2;
                return av - bv;
            }
        });
    }
    return cols;
});

const rateScrollX = computed(() =>
    rateColumns.value.reduce((sum: number, col: any) => sum + (Number(col.width) || 80), 0)
);

/** 出场 < 20 不参与胜率排序，排到末尾 */
function rateSortValue(row: { total: number; rate: number }) {
    return row.total >= 20 ? row.rate : -2;
}

const rateTableData = computed(() => {
    const isTop8 = viewMode.value === "top8";
    const kw = rateKeyword.value.trim();
    return heroList.value
        .map((item) => {
            const viewWin = isTop8 ? item.totalWin : item.totalWin4;
            const viewLose = isTop8 ? item.totalLose : item.totalLose4;
            const games = viewWin + viewLose;
            const rate = games ? viewWin / games : -1;
            const row: Record<string, any> = {
                id: item.id,
                name: item.name,
                img: item.img,
                total: item.total,
                rate,
                rateText: formatRate(viewWin, viewLose)
            };
            for (const ed of editionsAsc) {
                const s = item.byEdition[ed];
                const w = isTop8 ? s?.win || 0 : s?.win4 || 0;
                const l = isTop8 ? s?.lose || 0 : s?.lose4 || 0;
                const g = w + l;
                row[`ed${ed}`] = formatRate(w, l);
                row[`ed${ed}Rate`] = g ? w / g : -1;
            }
            return row;
        })
        .filter((row) => !kw || row.name.includes(kw))
        .sort(
            (a: any, b: any) =>
                rateSortValue(b) - rateSortValue(a) ||
                b.total - a.total ||
                a.id - b.id
        );
});

function searchRate() {
    rateKeyword.value = filterName.value.trim();
}

function resetRate() {
    filterName.value = "";
    rateKeyword.value = "";
}

function edWin(item: { byEdition: Record<number, EditionStat> }, ed: number) {
    const s = item.byEdition[ed];
    if (!s) return 0;
    return viewMode.value === "top8" ? s.win : s.win4;
}

function edLose(item: { byEdition: Record<number, EditionStat> }, ed: number) {
    const s = item.byEdition[ed];
    if (!s) return 0;
    return viewMode.value === "top8" ? s.lose : s.lose4;
}

function edRateValue(item: { byEdition: Record<number, EditionStat> }, ed: number) {
    const w = edWin(item, ed);
    const l = edLose(item, ed);
    const total = w + l;
    return total ? Number(((w / total) * 100).toFixed(1)) : 0;
}

function setChartEl(id: number, el: unknown) {
    if (el instanceof HTMLElement) {
        chartEls.set(id, el);
    } else {
        chartEls.delete(id);
        const chart = chartInstances.get(id);
        chart?.dispose();
        chartInstances.delete(id);
    }
}

function disposeAllCharts() {
    for (const chart of chartInstances.values()) {
        chart?.dispose();
    }
    chartInstances.clear();
}

function drawRateChart(item: {
    id: number;
    name: string;
    byEdition: Record<number, EditionStat>;
}) {
    const el = chartEls.get(item.id);
    if (!el) return;
    chartInstances.get(item.id)?.dispose();
    const chart = init(el);
    chartInstances.set(item.id, chart);
    const rates = editionsAsc.map((ed) => edRateValue(item, ed));
    chart.setOption({
        color: [viewMode.value === "top8" ? "#1d4ed8" : "#6d28d9"],
        grid: { left: 42, right: 16, top: 28, bottom: 28 },
        tooltip: {
            trigger: "axis",
            valueFormatter: (v: unknown) => `${v ?? 0}%`
        },
        xAxis: {
            type: "category",
            data: editionsAsc.map((ed) => `第${ed}届`),
            axisLabel: { fontSize: 11 }
        },
        yAxis: {
            type: "value",
            min: 0,
            max: 100,
            axisLabel: { fontSize: 10, formatter: "{value}%" }
        },
        series: [
            {
                name: "胜率",
                type: "line",
                data: rates,
                connectNulls: false,
                showSymbol: true,
                symbolSize: 8,
                lineStyle: { width: 2 },
                areaStyle: { opacity: 0.08 }
            }
        ]
    });
}

function renderAllCharts() {
    nextTick(() => {
        for (const item of displayList.value) {
            drawRateChart(item);
        }
    });
}

function toggleCharts() {
    showCharts.value = !showCharts.value;
    if (showCharts.value) {
        renderAllCharts();
    } else {
        disposeAllCharts();
    }
}

watch(viewMode, () => {
    if (showCharts.value) renderAllCharts();
});

watch(displayMode, (mode) => {
    if (mode !== "detail" && showCharts.value) {
        showCharts.value = false;
        disposeAllCharts();
    }
});

function goBack() {
    router.go(-1);
}

function onResize() {
    isNarrow.value = window.innerWidth < 768;
    for (const chart of chartInstances.values()) {
        chart?.resize();
    }
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
    disposeAllCharts();
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    min-width: 0;
}

.toolbar-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.4;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filter-field {
    flex: 1;
    min-width: 140px;
    max-width: 240px;
}

.filter-tip {
    flex: 1 1 100%;
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.4;
}

@media (min-width: 768px) {
    .filter-tip {
        flex: 1 1 auto;
        text-align: right;
    }
}

.table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

    :deep(.myTable) {
        max-width: 100%;
        min-width: 0;
    }

    :deep(.table-scroll) {
        border: none;
        border-radius: 10px;
        box-shadow: none;
    }

    :deep(.ant-table-content),
    :deep(.ant-table-body) {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x pan-y;
    }

    :deep(.ant-table-cell) {
        white-space: nowrap;
    }

    :deep(.ant-table-cell-ellipsis) {
        white-space: nowrap;
    }
}

.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

    &--top {
        border-color: #e2e8f0;
        background: linear-gradient(180deg, #fafbfc 0%, #fff 40%);
    }
}

.card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    min-width: 0;
}

.idx {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #eef2f7;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--top {
        background: #1f2937;
        color: #fff;
    }
}

.avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    background: #eef2f7;
}

.name {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
}

.chart-box {
    margin-bottom: 10px;
    border: 1px solid #eef2f7;
    border-radius: 8px;
    background: #fafbfc;
    overflow: hidden;
}

.chart {
    width: 100%;
    height: 220px;
}

.pill {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    background: #f1f5f9;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    em {
        font-style: normal;
        font-size: 11px;
        font-weight: 500;
        color: #94a3b8;
    }

    &--win {
        background: #ecfdf5;
        color: #047857;

        em {
            color: #6ee7b7;
        }
    }

    &--lose {
        background: #fef2f2;
        color: #b91c1c;

        em {
            color: #fca5a5;
        }
    }

    &--rate {
        background: #eef6ff;
        color: #1d4ed8;

        em {
            color: #93c5fd;
        }
    }

    &--rate4 {
        background: #f5f3ff;
        color: #6d28d9;

        em {
            color: #c4b5fd;
        }
    }
}

.ed-grid {
    display: grid;
    grid-template-columns: 40px repeat(3, minmax(0, 1fr)) 1.2fr;
    gap: 0;
    border: 1px solid #eef2f7;
    border-radius: 8px;
    overflow: hidden;
    background: #fafbfc;
}

.ed-head,
.ed-row {
    display: contents;
}

.ed-head>span,
.ed-row>span {
    padding: 6px 4px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    border-bottom: 1px solid #eef2f7;
}

.ed-head>span {
    background: #f1f5f9;
    color: #94a3b8;
    font-weight: 600;
    font-size: 11px;
}

.ed-row:last-child>span {
    border-bottom: none;
}

.ed-label {
    color: #64748b;
    font-weight: 600;
}

.ed-count {
    color: #334155;
    font-weight: 600;
}

.ed-win {
    color: #047857;
    font-weight: 600;
}

.ed-lose {
    color: #b91c1c;
    font-weight: 600;
}

.ed-rate {
    color: #1d4ed8;
    font-weight: 600;
}

.ed-rate4 {
    color: #6d28d9;
    font-weight: 600;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .toolbar {
        align-items: center;
    }

    .toolbar-actions {
        flex-direction: row;
        align-items: center;
    }

    .title {
        font-size: 1.1rem;
    }

    .ed-grid {
        grid-template-columns: 56px repeat(3, 1fr) 1.2fr;
    }

    .ed-head>span,
    .ed-row>span {
        padding: 6px 8px;
    }

    .ed-head>span:first-child,
    .ed-row>span:first-child {
        text-align: left;
        padding-left: 12px;
    }
}
</style>
