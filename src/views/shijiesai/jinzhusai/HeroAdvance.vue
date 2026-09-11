<template>
    <div class="page">
        <header class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">金主赛 · 英雄晋级</h1>
                <p class="subtitle">统计仍在该轮的选手英雄顺位数量 · 括号为相对上一轮减少</p>
            </div>
            <div class="toolbar-actions">
                <a-button size="small" @click="goBack">返回晋级图</a-button>
            </div>
        </header>

        <div class="table-wrap">
            <table class="adv-table">
                <thead>
                    <tr>
                        <th class="sticky-col rank">#</th>
                        <th class="sticky-col name-col">英雄</th>
                        <th v-for="(round, ri) in rounds" :key="round">
                            <div class="col-head">{{ BRACKET_ROUND_LABELS[round] }}</div>
                            <div class="col-sub">{{ playerTotals[ri] }}人</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in rows" :key="row.id" :class="{ unused: row.unused }">
                        <td class="sticky-col rank num">{{ row.unused ? "—" : idx + 1 }}</td>
                        <td class="sticky-col name-col">
                            <span class="hero-cell">
                                <HeroIcon :hid="row.id" />
                                <span class="hero-name">{{ row.name }}</span>
                            </span>
                        </td>
                        <td
                            v-for="(count, ci) in row.counts"
                            :key="row.id + '-' + ci"
                            class="num cell"
                            :class="{
                                zero: !row.unused && count === 0 && playerTotals[ci] > 0,
                                muted: playerTotals[ci] === 0
                            }"
                        >
                            <span class="count">{{ count }}</span>
                            <span v-if="row.drops[ci] > 0 && playerTotals[ci] > 0" class="drop">-{{ row.drops[ci] }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { BRACKET_ROUND_LABELS, BRACKET_ROUNDS } from "./data";
import { calcHeroAdvanceTable } from "./players";
import HeroIcon from "./HeroIcon.vue";

const rounds = [...BRACKET_ROUNDS];
const { playerTotals, rows } = calcHeroAdvanceTable();

function goBack() {
    router.push({ name: "jinzhusai" });
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100dvh;
    min-height: 100svh;
    padding: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    background: #f3f4f6;
    color: #1f2937;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
}

.toolbar-text {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111827;
    line-height: 1.3;
}

.subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
}

.toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    -webkit-overflow-scrolling: touch;
}

.adv-table {
    width: 100%;
    min-width: 860px;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
}

.adv-table th,
.adv-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
    white-space: nowrap;
    background: #fff;
}

.adv-table th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
    text-align: center;
}

.adv-table th.rank,
.adv-table th.name-col {
    text-align: left;
}

.col-head {
    font-weight: 800;
}

.col-sub {
    margin-top: 2px;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
}

.sticky-col {
    position: sticky;
    z-index: 1;
}

.rank {
    left: 0;
    width: 40px;
    min-width: 40px;
}

.name-col {
    left: 40px;
    min-width: 148px;
    box-shadow: 1px 0 0 #eef2f6;
}

.adv-table thead .sticky-col {
    z-index: 3;
}

.hero-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    color: #111827;
}

.num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
}

.cell {
    text-align: center;
}

.count {
    font-weight: 800;
    color: #0f172a;
}

.drop {
    margin-left: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #dc2626;
}

.cell.zero .count {
    color: #b91c1c;
}

.cell.muted .count {
    color: #cbd5e1;
}

.adv-table tr.unused td {
    color: #9ca3af;
}

.adv-table tr.unused .hero-cell,
.adv-table tr.unused .count {
    color: #9ca3af;
    font-weight: 700;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        gap: 10px;
    }

    .toolbar {
        padding: 12px 14px;
    }

    .title {
        font-size: 1.25rem;
    }

    .adv-table {
        font-size: 14px;
    }
}

@media (max-width: 1023px) {
    .hero-name {
        display: none;
    }

    .name-col {
        min-width: 52px;
        left: 36px;
    }

    .rank {
        width: 36px;
        min-width: 36px;
    }
}
</style>
