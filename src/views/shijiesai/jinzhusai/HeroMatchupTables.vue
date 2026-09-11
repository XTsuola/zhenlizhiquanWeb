<template>
    <div class="matchup">
        <div class="matchup-col">
            <div class="matchup-head win">战胜 <b>{{ winTotal }}</b><span class="hint">除去内战</span></div>
            <table v-if="win.length" class="matchup-table">
                <thead>
                    <tr>
                        <th>英雄</th>
                        <th>场次</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in win" :key="'w-' + (r.id ?? 'unk')">
                        <td class="hero">
                            <HeroIcon v-if="r.id" :hid="r.id" />
                            <span class="hero-name">{{ r.name }}</span>
                        </td>
                        <td class="num win">{{ r.count }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="empty">暂无战胜记录</p>
        </div>
        <div class="matchup-col">
            <div class="matchup-head lose">败给 <b>{{ loseTotal }}</b><span class="hint">除去内战</span></div>
            <table v-if="lose.length" class="matchup-table">
                <thead>
                    <tr>
                        <th>英雄</th>
                        <th>场次</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in lose" :key="'l-' + (r.id ?? 'unk')">
                        <td class="hero">
                            <HeroIcon v-if="r.id" :hid="r.id" />
                            <span class="hero-name">{{ r.name }}</span>
                        </td>
                        <td class="num lose">{{ r.count }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="empty">暂无败给记录</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { HeroMatchupRow } from "./players";
import HeroIcon from "./HeroIcon.vue";

const props = defineProps<{
    win: HeroMatchupRow[];
    lose: HeroMatchupRow[];
}>();

const winTotal = computed(() => props.win.reduce((n, r) => n + r.count, 0));
const loseTotal = computed(() => props.lose.reduce((n, r) => n + r.count, 0));
</script>

<style lang="less" scoped>
.matchup {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.matchup-col {
    min-width: 0;
    max-height: 240px;
    overflow: auto;
    padding: 8px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #fff;
}

.matchup-head {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;

    b {
        font-variant-numeric: tabular-nums;
    }

    .hint {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
    }
}

.matchup-head.win {
    color: #15803d;
}

.matchup-head.lose {
    color: #b91c1c;
}

.matchup-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.matchup-table th,
.matchup-table td {
    padding: 5px 4px;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
}

.matchup-table th {
    font-weight: 800;
    color: #64748b;
}

.matchup-table .hero {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
    min-width: 0;
}

.matchup-table .hero-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.matchup-table .num {
    width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 800;
}

.matchup-table .num.win {
    color: #15803d;
}

.matchup-table .num.lose {
    color: #b91c1c;
}

.empty {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
}

@media (max-width: 767px) {
    .matchup {
        grid-template-columns: 1fr;
    }
}
</style>
