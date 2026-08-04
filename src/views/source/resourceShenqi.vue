<template>
    <div class="resourceShenqi">
        <div class="toolbar">
            <h1 class="title">神器资源参考</h1>
            <div class="actions">
                <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
                    <a-radio-button value="now">本级</a-radio-button>
                    <a-radio-button value="sum">累计</a-radio-button>
                </a-radio-group>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="legend-hint">
            {{
                viewMode === "sum"
                    ? "累计 = 升到该星总共需要"
                    : "本级 = 升到该星新增消耗"
            }}
        </div>
        <div v-for="q in qualityTables" :key="q.key" class="section" :style="{ '--q': q.color }">
            <h2 class="section-title">
                <span class="dot" />
                {{ q.label }} · {{ viewMode === "sum" ? "累计" : "本级" }}资源
            </h2>
            <div class="table-wrap">
                <table class="cost-table">
                    <thead>
                        <tr>
                            <th>星级</th>
                            <th>紫精华</th>
                            <th>红精华</th>
                            <th>蓝碎片</th>
                            <th>紫碎片</th>
                            <th>橙碎片</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in q.rows" :key="row.level">
                            <td class="level">{{ row.level }}</td>
                            <td>{{ formatNum(pick(row, "zi")) }}</td>
                            <td>{{ formatNum(pick(row, "hong")) }}</td>
                            <td>{{ formatNum(pick(row, "lan")) }}</td>
                            <td>{{ formatNum(pick(row, "ziSui")) }}</td>
                            <td>{{ formatNum(pick(row, "cheng")) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { blue, purple, gold } from "@/data/shenqiData/ziyuan";
import router from "@/router";

type ViewMode = "now" | "sum";
type CostRow = {
    level: number;
    ziNow: number;
    ziSum: number;
    hongNow: number;
    hongSum: number;
    lanNow: number;
    lanSum: number;
    ziSuiNow: number;
    ziSuiSum: number;
    chengNow: number;
    chengSum: number;
};

const viewMode = ref<ViewMode>("now");
const QUALITIES = [
    { key: "blue", label: "蓝神器", color: "#4f9bc4", list: blue },
    { key: "purple", label: "紫神器", color: "#8e488e", list: purple },
    { key: "gold", label: "橙神器", color: "#e67e22", list: gold }
] as const;

/** ziyuan 为升到 2~15 星的本级消耗；1 星无消耗，累计 = 前缀和 */
function toRows(list: number[][]): CostRow[] {
    const full = [[0, 0, 0, 0, 0], ...list];
    let ziSum = 0;
    let hongSum = 0;
    let lanSum = 0;
    let ziSuiSum = 0;
    let chengSum = 0;
    return full.map((item, i) => {
        const [zi, hong, lan, ziSui, cheng] = item;
        ziSum += zi;
        hongSum += hong;
        lanSum += lan;
        ziSuiSum += ziSui;
        chengSum += cheng;
        return {
            level: i + 1,
            ziNow: zi,
            ziSum,
            hongNow: hong,
            hongSum,
            lanNow: lan,
            lanSum,
            ziSuiNow: ziSui,
            ziSuiSum,
            chengNow: cheng,
            chengSum
        };
    });
}

const qualityTables = computed(() =>
    QUALITIES.map((q) => ({
        key: q.key,
        label: q.label,
        color: q.color,
        rows: toRows(q.list)
    }))
);

function pick(row: CostRow, key: "zi" | "hong" | "lan" | "ziSui" | "cheng") {
    const suffix = viewMode.value === "sum" ? "Sum" : "Now";
    return row[`${key}${suffix}` as keyof CostRow] as number;
}

function formatNum(n: number) {
    if (n >= 10000) {
        return `${(n / 10000).toFixed(2)}w`;
    }
    return n.toLocaleString("zh-CN");
}

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.resourceShenqi {
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
    gap: 8px;
    flex-shrink: 0;
    align-items: center;
}

.legend-hint {
    margin: -4px 0 12px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
}

.section {
    --q: #4f9bc4;
    margin-bottom: 14px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-left: 4px solid var(--q);
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.section-title {
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--q);
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--q);
    flex-shrink: 0;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.cost-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 12px;

    th,
    td {
        padding: 8px 4px;
        text-align: right;
        border-bottom: 1px solid #f1f5f9;
        white-space: nowrap;
        vertical-align: middle;
    }

    th {
        color: #6b7280;
        font-weight: 600;
        background: color-mix(in srgb, var(--q) 8%, #fff);
    }

    th:first-child,
    td:first-child {
        width: 12%;
        text-align: center;
    }

    .level {
        font-weight: 700;
        color: var(--q);
    }

    td {
        color: #1f2937;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    tbody tr:hover {
        background: color-mix(in srgb, var(--q) 6%, #fff);
    }
}

@media (min-width: 768px) {
    .resourceShenqi {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .cost-table {
        font-size: 13px;

        th,
        td {
            padding: 8px 6px;
        }
    }
}
</style>
