<template>
    <div class="page">
        <header class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">金主赛 · 英雄含金量</h1>
                <p class="subtitle">
                    按选手当前最高名次给 4 个顺位英雄加分，不累加前面轮次 · 32强 +1 · 16强 +1.5 · 8强 +2 · 4强 +3 · 亚军 +5 · 冠军 +10
                </p>
            </div>
            <div class="toolbar-actions">
                <a-button size="small" @click="goBack">返回晋级图</a-button>
            </div>
        </header>

        <div class="table-wrap">
            <table class="gold-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>英雄</th>
                        <th>含金量(g)</th>
                        <th>贡献人数</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(item, idx) in rows"
                        :key="item.id"
                        :class="{ unused: item.score === 0, clickable: item.score > 0 }"
                        @click="openHero(item)"
                    >
                        <td class="num">{{ item.score === 0 ? "—" : idx + 1 }}</td>
                        <td class="name">
                            <span class="hero-cell">
                                <HeroIcon :hid="item.id" />
                                <span class="hero-name">{{ item.name }}</span>
                            </span>
                        </td>
                        <td class="num score">{{ formatGold(item.score) }}</td>
                        <td class="num">{{ item.players }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <a-modal
            :open="detailOpen"
            :footer="null"
            destroyOnClose
            @update:open="detailOpen = $event"
        >
            <template #title>
                <span class="modal-title">
                    <HeroIcon v-if="detailHero" :hid="detailHero.id" />
                    {{ detailHero ? detailHero.name + " · 含金量贡献" : "含金量贡献" }}
                </span>
            </template>
            <div v-if="detailHero" class="gold-detail">
                <p class="meta">
                    含金量 {{ formatGold(detailHero.score) }} · {{ detailHero.players }} 人贡献
                </p>
                <div v-if="contributors.length" class="contrib-list">
                    <div v-for="c in contributors" :key="c.playerId" class="contrib-row">
                        <span class="who">{{ c.playerName }}</span>
                        <span class="stand">{{ c.standing }}</span>
                        <span class="slots">
                            <span v-for="slot in c.slots" :key="slot" class="slot-tag">{{ slot }}号顺位</span>
                        </span>
                        <span class="add">+{{ formatGold(c.score) }}</span>
                    </div>
                </div>
                <p v-else class="empty">暂无贡献</p>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import router from "@/router";
import { calcHeroGoldTable, getHeroGoldContributors, type HeroGoldRow } from "./players";
import HeroIcon from "./HeroIcon.vue";

const rows = computed(() => calcHeroGoldTable());
const detailOpen = ref(false);
const detailHero = ref<HeroGoldRow | null>(null);
const contributors = computed(() =>
    detailHero.value ? getHeroGoldContributors(detailHero.value.id) : []
);

function formatGold(n: number) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function openHero(item: HeroGoldRow) {
    if (item.score === 0) return;
    detailHero.value = item;
    detailOpen.value = true;
}

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

.gold-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.gold-table th,
.gold-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
    white-space: nowrap;
}

.gold-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
}

.gold-table .num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
}

.gold-table .name {
    font-weight: 800;
    color: #111827;
}

.gold-table .score {
    font-weight: 800;
    color: #b45309;
}

.hero-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.gold-table tr.clickable {
    cursor: pointer;
}

.gold-table tr.clickable:hover {
    background: #fffbeb;
}

.gold-table tr.unused td {
    color: #9ca3af;
}

.gold-table tr.unused .name,
.gold-table tr.unused .score {
    color: #9ca3af;
    font-weight: 700;
}

.modal-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.gold-detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.meta {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
}

.contrib-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(60vh, 520px);
    overflow: auto;
}

.contrib-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
}

.who {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
}

.stand {
    font-size: 12px;
    font-weight: 800;
    color: #b45309;
}

.slots {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.slot-tag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
    font-size: 12px;
    font-weight: 800;
}

.add {
    margin-left: auto;
    font-size: 14px;
    font-weight: 800;
    color: #b45309;
    font-variant-numeric: tabular-nums;
}

.empty {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
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

    .gold-table {
        font-size: 14px;
    }
}

@media (max-width: 767px) {
    .hero-name {
        display: none;
    }
}
</style>
