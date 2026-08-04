<template>
    <div class="resourceGuzhi">
        <div class="toolbar">
            <h1 class="title">资源估值表</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="legend-hint">估值单位为人民币口径，仅作兑换 / 性价比参考</div>

        <div class="sections">
            <div
                v-for="sec in guzhiSections"
                :key="sec.key"
                class="section"
                :style="{ '--q': sec.color }"
            >
                <h2 class="section-title">
                    <span class="dot" />
                    {{ sec.label }}
                </h2>
                <div class="table-wrap">
                    <table class="cost-table">
                        <thead>
                            <tr>
                                <th class="name-col">资源</th>
                                <th>估值</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in sec.list" :key="row.name">
                                <td class="name-col">{{ row.name }}</td>
                                <td class="value">{{ formatValue(row.value) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { guzhiSections } from "@/data/z_otherData/guzhi";
import router from "@/router";

function formatValue(n: number) {
    if (Number.isInteger(n)) return String(n);
    const text = String(n);
    if (text.includes("e") || text.includes("E")) return n.toFixed(6).replace(/\.?0+$/, "");
    return text;
}

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.resourceGuzhi {
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

.sections {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section {
    --q: #4f9bc4;
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
    border-collapse: collapse;
    font-size: 12px;

    th,
    td {
        padding: 8px 10px;
        border-bottom: 1px solid #f1f5f9;
        white-space: nowrap;
        vertical-align: middle;
    }

    th {
        color: #6b7280;
        font-weight: 600;
        background: color-mix(in srgb, var(--q) 8%, #fff);
        text-align: left;
    }

    th:last-child,
    td:last-child {
        text-align: right;
    }

    .name-col {
        text-align: left;
        color: #374151;
        font-weight: 600;
    }

    .value {
        color: #1f2937;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }

    tbody tr:hover {
        background: color-mix(in srgb, var(--q) 6%, #fff);
    }
}

@media (min-width: 768px) {
    .resourceGuzhi {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .sections {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        align-items: start;
    }

    .cost-table {
        font-size: 13px;
    }
}
</style>
