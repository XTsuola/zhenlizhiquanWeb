<template>
    <div class="page">
        <header class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">金主赛 · 英雄胜率</h1>
                <p class="subtitle">
                    第 N 局对应英雄顺位第 N 位 · 只计胜/负，胜无效、负无效、弃权不统计
                    <template v-if="excludeMirror"> · 已剔除双方同英雄对局</template>
                </p>
            </div>
            <div class="toolbar-actions">
                <a-button size="small" :type="excludeMirror ? 'primary' : 'default'" @click="excludeMirror = !excludeMirror">
                    {{ excludeMirror ? "已剔除相同英雄对战" : "剔除相同英雄对战" }}
                </a-button>
                <a-button size="small" @click="goBack">返回晋级图</a-button>
            </div>
        </header>

        <div class="table-wrap">
            <table class="rate-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>英雄</th>
                        <th>胜</th>
                        <th>负</th>
                        <th>有效场次</th>
                        <th>胜率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(item, idx) in rows"
                        :key="item.id"
                        :class="{ unused: item.rate == null, clickable: item.rate != null }"
                        @click="openHero(item)"
                    >
                        <td class="num">{{ item.rate == null ? "—" : idx + 1 }}</td>
                        <td class="name">
                            <span class="hero-cell">
                                <HeroIcon :hid="item.id" />
                                <span class="hero-name">{{ item.name }}</span>
                            </span>
                        </td>
                        <td class="num win">{{ item.win }}</td>
                        <td class="num lose">{{ item.lose }}</td>
                        <td class="num">{{ item.total }}</td>
                        <td class="num rate">{{ formatRate(item) }}</td>
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
                    {{ detailHero ? detailHero.name + " · 历史对局" : "历史对局" }}
                </span>
            </template>
            <div v-if="detailHeroLive" class="match-detail">
                <p class="match-meta">
                    有效 {{ detailHeroLive.total }} 场 · 胜 {{ detailHeroLive.win }} · 负 {{ detailHeroLive.lose }} · 胜率 {{ formatRate(detailHeroLive) }}
                    <template v-if="excludeMirror"> · 已剔除镜像</template>
                </p>
                <HeroMatchupTables :win="detailMatchup.win" :lose="detailMatchup.lose" />
                <div v-if="detailLogs.length" class="match-list">
                    <div v-for="(log, i) in detailLogs" :key="i" class="match-row">
                        <div class="match-head">
                            <span class="round-tag">{{ BRACKET_ROUND_LABELS[log.round] }} · 第{{ log.game }}局</span>
                            <span class="result-chip" :class="'result-' + log.result">{{ RESULT_LABELS[log.result] }}</span>
                        </div>
                        <div class="match-body">
                            <span class="who">{{ log.playerName }}</span>
                            <span class="vs">VS</span>
                            <span class="who">{{ log.opponentName }}</span>
                        </div>
                        <div class="match-heroes">
                            对手英雄
                            <HeroIcon v-if="log.opponentHeroId" :hid="log.opponentHeroId" />
                            {{ log.opponentHeroName }}
                        </div>
                    </div>
                </div>
                <p v-else class="empty">暂无有效对局</p>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import router from "@/router";
import { BRACKET_ROUND_LABELS, RESULT_LABELS } from "./data";
import { calcHeroWinRates, getHeroMatchLogs, getHeroMatchupSummary, type HeroWinStat } from "./players";
import HeroIcon from "./HeroIcon.vue";
import HeroMatchupTables from "./HeroMatchupTables.vue";

const excludeMirror = ref(false);
const rateOpts = computed(() => ({ excludeMirror: excludeMirror.value }));
const rows = computed(() => calcHeroWinRates(rateOpts.value));
const detailOpen = ref(false);
const detailHero = ref<HeroWinStat | null>(null);
const detailHeroLive = computed(() => {
    if (!detailHero.value) return null;
    return rows.value.find((r) => r.id === detailHero.value!.id) ?? detailHero.value;
});
const detailLogs = computed(() =>
    detailHero.value ? getHeroMatchLogs(detailHero.value.id, rateOpts.value) : []
);
const detailMatchup = computed(() =>
    detailHero.value
        ? getHeroMatchupSummary(detailHero.value.id, rateOpts.value)
        : { win: [], lose: [] }
);

function formatRate(item: HeroWinStat) {
    if (item.rate == null) return "未上场";
    return `${(item.rate * 100).toFixed(1)}%`;
}

function openHero(item: HeroWinStat) {
    if (item.rate == null) return;
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

.rate-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.rate-table th,
.rate-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
    white-space: nowrap;
}

.rate-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
}

.rate-table .num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
}

.rate-table .name {
    font-weight: 800;
    color: #111827;
}

.hero-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.modal-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.rate-table .win {
    color: #15803d;
}

.rate-table .lose {
    color: #b91c1c;
}

.rate-table .rate {
    font-weight: 800;
    color: #0c4a6e;
}

.rate-table tr.clickable {
    cursor: pointer;
}

.rate-table tr.clickable:hover {
    background: #f0f9ff;
}

.rate-table tr.unused td {
    color: #9ca3af;
}

.rate-table tr.unused .name,
.rate-table tr.unused .rate {
    color: #9ca3af;
    font-weight: 700;
}

.match-detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.match-meta {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
}

.match-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(60vh, 520px);
    overflow: auto;
}

.match-row {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
}

.match-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
}

.round-tag {
    font-size: 12px;
    font-weight: 800;
    color: #0369a1;
}

.result-chip {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
}

.result-chip.result-1 {
    background: #dcfce7;
    color: #15803d;
}

.result-chip.result-2 {
    background: #fee2e2;
    color: #b91c1c;
}

.match-body {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
}

.vs {
    font-size: 11px;
    font-weight: 800;
    color: #94a3b8;
}

.match-heroes {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
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

    .rate-table {
        font-size: 14px;
    }
}

@media (max-width: 767px) {
    .hero-name {
        display: none;
    }
}
</style>
