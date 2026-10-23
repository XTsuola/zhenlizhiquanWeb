<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ title }}届—各族剩余</h1>
            <a-button size="small" @click="goBack">返回</a-button>
        </div>
        <a-spin :spinning="tableLoading" class="spin-wrap">
            <p class="hint">统计各阶段出场英雄的主、副种族（各计 1 次），点开可看英雄明细</p>
            <div class="list-head">
                <div class="col-name">种族</div>
                <div class="col-n">8强</div>
                <div class="col-d"></div>
                <div class="col-n">4强</div>
                <div class="col-d"></div>
                <div class="col-n">2强</div>
            </div>
            <div class="race-list">
                <section
                    v-for="(race, index) in data"
                    :key="race.id"
                    class="race-card"
                    :class="{ 'race-card--open': expandedId === race.id }"
                    :style="{ '--i': index }"
                >
                    <div class="race-summary" @click="toggleExpand(race.id)">
                        <div class="col-name">
                            <span class="expand-icon">{{ expandedId === race.id ? "▾" : "▸" }}</span>
                            <span class="dot" :style="{ background: race.color }"></span>
                            {{ race.name }}
                        </div>
                        <div class="col-n">{{ race.count8 }}</div>
                        <div class="col-d" :class="diffClass(race.diff84)">{{ formatDiff(race.diff84) }}</div>
                        <div class="col-n">{{ race.count4 }}</div>
                        <div class="col-d" :class="diffClass(race.diff42)">{{ formatDiff(race.diff42) }}</div>
                        <div class="col-n">{{ race.count2 }}</div>
                    </div>
                    <Transition name="detail">
                        <div v-if="expandedId === race.id" class="race-detail">
                            <div class="detail-block">
                                <div class="detail-title">8强→4强 减少最多</div>
                                <div v-if="race.top84.length" class="hero-rows">
                                    <div v-for="hero in race.top84" :key="'84-' + hero.id" class="hero-row">
                                        <img class="hero-img" :src="hero.img" :alt="hero.name" />
                                        <span class="hero-name">{{ hero.name }}</span>
                                        <span class="hero-stat">{{ hero.count8 }}</span>
                                        <span class="hero-diff" :class="diffClass(hero.diff84)">{{ formatDiff(hero.diff84) }}</span>
                                        <span class="hero-stat">{{ hero.count4 }}</span>
                                    </div>
                                </div>
                                <div v-else class="detail-empty">暂无减少</div>
                            </div>
                            <div class="detail-block">
                                <div class="detail-title">4强→2强 减少最多</div>
                                <div v-if="race.top42.length" class="hero-rows">
                                    <div v-for="hero in race.top42" :key="'42-' + hero.id" class="hero-row">
                                        <img class="hero-img" :src="hero.img" :alt="hero.name" />
                                        <span class="hero-name">{{ hero.name }}</span>
                                        <span class="hero-stat">{{ hero.count4 }}</span>
                                        <span class="hero-diff" :class="diffClass(hero.diff42)">{{ formatDiff(hero.diff42) }}</span>
                                        <span class="hero-stat">{{ hero.count2 }}</span>
                                    </div>
                                </div>
                                <div v-else class="detail-empty">暂无减少</div>
                            </div>
                        </div>
                    </Transition>
                </section>
            </div>
            <div class="list-foot">
                <div class="col-name">合计</div>
                <div class="col-n">{{ total8 }}</div>
                <div class="col-d"></div>
                <div class="col-n">{{ total4 }}</div>
                <div class="col-d"></div>
                <div class="col-n">{{ total2 }}</div>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiData } from "@/data/shijiesaiData/all";
import router from "@/router";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const title = ref(gameType);
const data = ref<any[]>([]);
const expandedId = ref<number | null>(null);

const RACES = [
    { id: 1, name: "帝国", color: "#e69500" },
    { id: 2, name: "隐秘", color: "#8a2be2" },
    { id: 3, name: "禅意", color: "#2e8b57" },
    { id: 4, name: "海港", color: "#1a6fa5" },
    { id: 5, name: "炼狱", color: "#c01b10" },
    { id: 6, name: "蛮石", color: "#8b5a2b" },
    { id: 7, name: "冬神", color: "#0290b5" }
];

const total8 = computed(() => data.value.reduce((s, e) => s + e.count8, 0));
const total4 = computed(() => data.value.reduce((s, e) => s + e.count4, 0));
const total2 = computed(() => data.value.reduce((s, e) => s + e.count2, 0));

function shortHeroName(name: string) {
    const i = name.indexOf("·");
    return i >= 0 ? name.slice(i + 1) : name;
}

function formatDiff(diff: number) {
    if (diff > 0) return `+${diff}`;
    return String(diff);
}

function diffClass(diff: number) {
    if (diff < 0) return "diff--down";
    if (diff > 0) return "diff--up";
    return "diff--flat";
}

function toggleExpand(id: number) {
    expandedId.value = expandedId.value === id ? null : id;
}

function emptyRace() {
    return RACES.map((r) => ({
        ...r,
        count8: 0,
        count4: 0,
        count2: 0,
        heroMap: {} as Record<number, { count8: number; count4: number; count2: number }>
    }));
}

function bumpHero(race: any, heroId: number, key: "count8" | "count4" | "count2") {
    if (!race.heroMap[heroId]) {
        race.heroMap[heroId] = { count8: 0, count4: 0, count2: 0 };
    }
    race.heroMap[heroId][key]++;
}

function addHero(counts: any[], heroId: number, key: "count8" | "count4" | "count2") {
    const hero: any = heroTable.find((h: any) => h.id == heroId);
    if (!hero) return;
    if (counts[hero.zhu - 1]) {
        counts[hero.zhu - 1][key]++;
        bumpHero(counts[hero.zhu - 1], hero.id, key);
    }
    if (counts[hero.fu - 1]) {
        counts[hero.fu - 1][key]++;
        bumpHero(counts[hero.fu - 1], hero.id, key);
    }
}

function addMatch(counts: any[], match: any, key: "count8" | "count4" | "count2") {
    for (let j = 0; j < 4; j++) {
        addHero(counts, match.AInfo.hero[j], key);
        addHero(counts, match.BInfo.hero[j], key);
    }
}

function toHeroList(heroMap: Record<number, { count8: number; count4: number; count2: number }>) {
    return Object.entries(heroMap).map(([id, cnt]) => {
        const hero: any = heroTable.find((h: any) => h.id == Number(id));
        return {
            id: Number(id),
            name: shortHeroName(hero?.name || String(id)),
            img: IMG_PREFIX + (hero?.img || ""),
            count8: cnt.count8,
            count4: cnt.count4,
            count2: cnt.count2,
            diff84: cnt.count4 - cnt.count8,
            diff42: cnt.count2 - cnt.count4
        };
    });
}

function topDecrease(list: any[], diffKey: "diff84" | "diff42", limit = 8) {
    return list
        .filter((e) => e[diffKey] < 0)
        .sort((a, b) => a[diffKey] - b[diffKey] || b.count8 - a.count8)
        .slice(0, limit);
}

function getList() {
    tableLoading.value = true;
    try {
        const gt = parseInt(gameType as string);
        const counts = emptyRace();
        const originalData = shijiesaiData.filter((e: any) => Math.floor(e.no / 10000) === gt);
        for (const match of originalData) {
            const round = match.no % 100;
            if (round >= 1 && round <= 4) addMatch(counts, match, "count8");
            else if (round >= 5 && round <= 6) addMatch(counts, match, "count4");
            else if (round === 8) addMatch(counts, match, "count2");
        }
        data.value = counts
            .map((e) => {
                const heroes = toHeroList(e.heroMap);
                return {
                    id: e.id,
                    name: e.name,
                    color: e.color,
                    count8: e.count8,
                    count4: e.count4,
                    count2: e.count2,
                    diff84: e.count4 - e.count8,
                    diff42: e.count2 - e.count4,
                    top84: topDecrease(heroes, "diff84"),
                    top42: topDecrease(heroes, "diff42")
                };
            })
            .sort((a, b) => b.count8 - a.count8 || b.count4 - a.count4 || b.count2 - a.count2);
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getList();
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
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.hint {
    margin: 0 0 8px;
    font-size: 12px;
    color: #94a3b8;
}

.list-head,
.list-foot,
.race-summary {
    display: grid;
    grid-template-columns: minmax(88px, 1.2fr) 0.85fr 0.75fr 0.85fr 0.75fr 0.85fr;
    align-items: center;
    gap: 4px;
}

.list-head {
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: center;

    .col-name {
        text-align: left;
        font-weight: 700;
        color: #374151;
    }
}

.race-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.race-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    overflow: hidden;
    opacity: 0;
    transform: translateY(8px);
    animation: race-in 0.45s ease both;
    animation-delay: calc(var(--i, 0) * 50ms);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;

    &--open {
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
}

@keyframes race-in {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.race-summary {
    padding: 12px 14px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s ease;

    &:active {
        background: #f8fafc;
    }
}

.col-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    min-width: 0;
}

.expand-icon {
    width: 12px;
    color: #94a3b8;
    font-size: 12px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.col-n {
    text-align: center;
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #0f172a;
}

.col-d {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.diff--down {
    color: #dc2626;
}

.diff--up {
    color: #15803d;
}

.diff--flat {
    color: #94a3b8;
}

.race-detail {
    border-top: 1px solid #f1f5f9;
    padding: 10px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #fafbfc;
}

.detail-enter-active,
.detail-leave-active {
    transition: opacity 0.28s ease, max-height 0.28s ease, transform 0.28s ease;
    overflow: hidden;
}

.detail-enter-from,
.detail-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-6px);
}

.detail-enter-to,
.detail-leave-from {
    opacity: 1;
    max-height: 480px;
    transform: translateY(0);
}

.detail-title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
}

.hero-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.hero-row {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 36px 44px 36px;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #fff;
    border: 1px solid #eef2f7;
    border-radius: 8px;
}

.hero-img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hero-stat {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #334155;
}

.hero-diff {
    text-align: center;
    font-size: 13px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
}

.detail-empty {
    font-size: 12px;
    color: #cbd5e1;
    padding: 4px 0;
}

.list-foot {
    margin-top: 8px;
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;

    .col-n {
        color: #334155;
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 820px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }
}
</style>
