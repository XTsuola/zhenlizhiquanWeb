<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-main">
                <h1 class="title">第{{ title }}届—选手详情</h1>
                <span class="total-count">共 <b>{{ playerTotal }}</b> 人</span>
            </div>
            <a-button size="small" @click="goBack">返回</a-button>
        </div>
        <a-spin :spinning="tableLoading">
            <div class="summary-card">
                <div class="summary-chips">
                    <span v-for="item in summary" :key="item.id" class="summary-chip"
                        :class="{ 'tag-rainbow': item.id === 'tianlong' }" :style="item.id === 'tianlong' ? undefined : {
                            color: '#fff',
                            background: item.color,
                            borderColor: item.color
                        }">
                        {{ item.name }} <b>{{ item.count }}</b>
                    </span>
                </div>
            </div>
            <div class="player-list">
                <section v-for="player in data" :key="player.id" class="player-card">
                    <header class="player-head">
                        <h2 class="player-name">{{ player.name }}</h2>
                        <div v-if="player.tags.length" class="player-tags">
                            <span v-for="tag in player.tags" :key="tag.label" class="player-tag"
                                :class="{ 'tag-rainbow': tag.id === 'tianlong' }" :style="tag.id === 'tianlong' ? undefined : {
                                    color: '#fff',
                                    background: tag.color,
                                    borderColor: tag.color
                                }">{{ tag.label }}</span>
                        </div>
                    </header>
                    <div class="player-body">
                        <div class="race-section">
                            <div v-if="player.raceList.length" class="race-chips">
                                <span v-for="item in player.raceList" :key="item.id" class="chip">
                                    {{ item.name }}<b>{{ item.count }}</b>
                                </span>
                            </div>
                            <div v-else class="empty">暂无</div>
                        </div>
                    </div>
                </section>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import router from "@/router";

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const title = ref(gameType);
const data = ref<any>([]);
const summary = ref<any>([]);
const playerTotal = computed(() => data.value.length);

const RACE_LIST = [
    { id: 1, name: "帝国", color: "#e69500" },
    { id: 2, name: "隐秘", color: "#8a2be2" },
    { id: 3, name: "禅意", color: "#2e8b57" },
    { id: 4, name: "港口", color: "#1a6fa5" },
    { id: 5, name: "炼狱", color: "#c01b10" },
    { id: 6, name: "蛮石", color: "#8b5a2b" },
    { id: 7, name: "冬神", color: "#0290b5" }
];

const TIANLONG_IDS = [4, 5, 7]; // 港口、炼狱、冬神
const TIANLONG_TAG = {
    id: "tianlong",
    name: "天龙玩家",
    color: "#b45309"
};

function createPlayer(key: string, name: string) {
    return {
        id: key,
        name,
        raceCnt: {} as Record<number, number>
    };
}

function addSide(players: Map<string, any>, matchNo: number, sideLabel: "A" | "B", side: any) {
    if (!side?.name || !side?.hero?.length) return;
    const key = `${matchNo}-${sideLabel}`;
    const player = createPlayer(key, side.name);
    for (let j = 0; j < 4; j++) {
        const heroId = side.hero[j];
        const hero: any = heroTable.find((e: any) => e.id == heroId);
        if (!hero) continue;
        player.raceCnt[hero.zhu] = (player.raceCnt[hero.zhu] || 0) + 1;
        player.raceCnt[hero.fu] = (player.raceCnt[hero.fu] || 0) + 1;
    }
    players.set(key, player);
}

function toRaceList(cnt: Record<number, number>) {
    return Object.entries(cnt)
        .map(([id, count]) => {
            const race = RACE_LIST.find((e) => e.id == Number(id));
            return {
                id: Number(id),
                name: race?.name || String(id),
                color: race?.color || "#6b7280",
                count: count as number
            };
        })
        .sort((a, b) => b.count - a.count);
}

function buildTags(raceList: any[]) {
    const tags = raceList
        .filter((e: any) => e.count >= 3)
        .map((e: any) => ({
            id: e.id,
            label: `${e.name}玩家`,
            color: e.color
        }));
    const tianlongCount = raceList
        .filter((e: any) => TIANLONG_IDS.includes(e.id))
        .reduce((sum: number, e: any) => sum + e.count, 0);
    if (tianlongCount >= 5) {
        tags.unshift({
            id: TIANLONG_TAG.id,
            label: TIANLONG_TAG.name,
            color: TIANLONG_TAG.color
        });
    }
    return tags;
}

function buildSummary(players: any[]) {
    const counts: Record<string | number, number> = {};
    for (const player of players) {
        for (const tag of player.tags) {
            counts[tag.id] = (counts[tag.id] || 0) + 1;
        }
    }
    const raceSummary = RACE_LIST.map((race) => ({
        id: race.id,
        name: `${race.name}玩家`,
        color: race.color,
        count: counts[race.id] || 0
    })).sort((a, b) => b.count - a.count);
    return [
        {
            id: TIANLONG_TAG.id as any,
            name: TIANLONG_TAG.name,
            color: TIANLONG_TAG.color,
            count: counts[TIANLONG_TAG.id] || 0
        },
        ...raceSummary
    ];
}

async function getList() {
    tableLoading.value = true;
    try {
        const params: ShijiesaiInfoListType = {
            pageSize: 200,
            pageNo: 1,
            gameType: parseInt(gameType as string)
        };
        const res = await shijiesaiInfoList(params);
        if (res.status == 200) {
            const map = new Map<string, any>();
            const data4 = res.data.data.filter((e: any) => e.no % 100 >= 1 && e.no % 100 <= 4);
            for (const match of data4) {
                addSide(map, match.no, "A", match.AInfo);
                addSide(map, match.no, "B", match.BInfo);
            }
            data.value = [...map.values()]
                .map((p: any) => {
                    const raceList = toRaceList(p.raceCnt);
                    return {
                        id: p.id,
                        name: p.name,
                        raceList,
                        tags: buildTags(raceList)
                    };
                })
                .sort((a, b) => {
                    const an = parseInt(a.name);
                    const bn = parseInt(b.name);
                    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
                    return String(a.name).localeCompare(String(b.name), "zh");
                });
            summary.value = buildSummary(data.value);
        }
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
    max-width: 960px;
    margin: 0 auto;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-main {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px 10px;
    min-width: 0;
}

.total-count {
    flex-shrink: 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;

    b {
        font-size: 15px;
        font-weight: 700;
        color: #111827;
        font-variant-numeric: tabular-nums;
    }
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.tip {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    background: #f0f7ff;
    border: 1px solid #dbeafe;
    color: #4b5563;
    font-size: 12px;
    line-height: 1.4;
}

.summary-card {
    margin-bottom: 10px;
    padding: 10px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.summary-chips {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
}

.summary-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 0;
    padding: 5px 4px;
    border-radius: 8px;
    border: 1px solid transparent;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    b {
        font-variant-numeric: tabular-nums;
    }
}

.player-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.player-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.player-head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
    padding: 12px 14px;
    border-bottom: 1px solid #f0f2f5;
    background: #fafbfc;
}

.player-name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
}

.player-tags {
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
    font-weight: 600;
    line-height: 1.4;
}

.tag-rainbow {
    position: relative;
    overflow: hidden;
    color: #5c3d0a !important;
    border: 1px solid #e0b84a !important;
    background: linear-gradient(135deg, #fff4c8 0%, #f0d078 45%, #e8b84a 100%) !important;
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
        background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.55),
                transparent);
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

@media (prefers-reduced-motion: reduce) {
    .tag-rainbow::after {
        animation: none;
        display: none;
    }
}

.player-body {
    padding: 0;
}

.race-section {
    padding: 10px 14px 12px;
}

.race-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    background: #fafbfc;
    border: 1px solid #e8ebf0;
    font-size: 12px;
    color: #374151;
    line-height: 1.3;

    b {
        font-weight: 600;
        color: #111827;
        font-variant-numeric: tabular-nums;
    }
}

.empty {
    font-size: 12px;
    color: #c0c4cc;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
    }

    .title {
        font-size: 1.1rem;
    }

    .summary-card {
        padding: 12px 14px;
    }

    .summary-chips {
        gap: 8px;
    }

    .summary-chip {
        padding: 6px 8px;
        font-size: 13px;
        border-radius: 999px;
    }

    .player-head {
        padding: 14px 16px;
    }

    .player-name {
        font-size: 16px;
    }
}
</style>
