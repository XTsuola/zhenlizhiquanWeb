<template>
    <a-modal
        :open="open"
        :title="player ? player.name : '选手详情'"
        :footer="null"
        destroyOnClose
        @update:open="open = $event"
    >
        <div v-if="player" class="player-detail">
            <div class="detail-meta">
                <span>签位 {{ player.id }}</span>
                <span>{{ halfOf(player.id) }}</span>
                <span>{{ zoneOf(player.id) }}</span>
                <span>战力 {{ formatZhanli(player.zhanli) }}</span>
                <span>{{ getStandingLabel(rosterRow) }}</span>
            </div>
            <div v-if="raceTags.length" class="detail-tags">
                <span
                    v-for="tag in raceTags"
                    :key="String(tag.id)"
                    class="player-tag"
                    :class="{ 'tag-rainbow': tag.id === 'tianlong' }"
                    :style="tag.id === 'tianlong' ? undefined : { color: '#fff', background: tag.color, borderColor: tag.color }"
                >{{ tag.label }}</span>
            </div>
            <h3 class="detail-heading">英雄顺位</h3>
            <ol v-if="player.heroList.length" class="detail-heroes">
                <li v-for="(hid, hi) in player.heroList" :key="'d-' + hi">
                    <HeroIcon :hid="hid" />
                    {{ getHeroName(hid) }}
                </li>
            </ol>
            <p v-else class="detail-empty">暂未填写英雄顺位</p>
            <template v-if="playedRounds.length">
                <template v-for="round in playedRounds" :key="round">
                    <h3 class="detail-heading">{{ BRACKET_ROUND_LABELS[round] }}赛果</h3>
                    <div class="detail-results">
                        <span
                            v-for="(code, ri) in getRoundResults(rosterRow, round)"
                            :key="round + '-' + ri"
                            class="result-chip"
                            :class="'result-' + code"
                        >
                            第{{ ri + 1 }}局
                            <HeroIcon v-if="gameHeroId(ri)" :hid="gameHeroId(ri)!" />
                            {{ RESULT_LABELS[code] || code }}
                        </span>
                    </div>
                </template>
            </template>
            <p v-else class="detail-empty">暂无赛果</p>
        </div>
    </a-modal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { getHeroIdByGame, getHeroName, getHeroRaceTags, getPlayer } from "./players";
import HeroIcon from "./HeroIcon.vue";
import { BRACKET_ROUND_LABELS, getPlayedRounds, getRosterPlayer, getRoundResults, getStandingLabel, RESULT_LABELS } from "./data";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
    playerId: number | null;
}>();

const player = computed(() => (props.playerId != null ? getPlayer(props.playerId) ?? null : null));
const rosterRow = computed(() => (props.playerId != null ? getRosterPlayer(props.playerId) : undefined));
const playedRounds = computed(() => getPlayedRounds(rosterRow.value));
const raceTags = computed(() => getHeroRaceTags(player.value?.heroList ?? []));

function gameHeroId(ri: number) {
    return getHeroIdByGame(player.value?.heroList ?? [], ri);
}

function zoneOf(id: number) {
    if (id <= 16) return "一区";
    if (id <= 32) return "二区";
    if (id <= 48) return "三区";
    if (id <= 64) return "四区";
    if (id <= 80) return "五区";
    if (id <= 96) return "六区";
    if (id <= 112) return "七区";
    return "八区";
}

function halfOf(id: number) {
    return id <= 64 ? "左半区" : "右半区";
}

function formatZhanli(v: number) {
    return Number(v || 0).toFixed(2);
}
</script>

<style lang="less" scoped>
.player-detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.player-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
}

.tag-rainbow {
    position: relative;
    overflow: hidden;
    color: #5c3d0a;
    border: 1px solid #e0b84a;
    background: linear-gradient(135deg, #fff4c8 0%, #f0d078 45%, #e8b84a 100%);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        0 1px 3px rgba(180, 130, 30, 0.25);

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
        animation: shineSweep 2.4s ease-in-out infinite;
    }
}

@keyframes shineSweep {
    0% {
        left: -40%;
    }
    60%,
    100% {
        left: 120%;
    }
}

.detail-heading {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
}

.detail-heroes {
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;

    li {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}

.detail-empty {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
}

.detail-results {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.result-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: #e2e8f0;
    color: #475569;
}

.result-chip.result-1 {
    background: #dcfce7;
    color: #15803d;
}

.result-chip.result-2 {
    background: #fee2e2;
    color: #b91c1c;
}

.result-chip.result-3 {
    background: #ecfccb;
    color: #4d7c0f;
}

.result-chip.result-4 {
    background: #ffedd5;
    color: #c2410c;
}

.result-chip.result-5 {
    background: #e2e8f0;
    color: #64748b;
}
</style>
