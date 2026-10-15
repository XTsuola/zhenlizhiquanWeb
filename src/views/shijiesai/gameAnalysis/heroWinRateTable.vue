<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">{{ title }}</h1>
            <div class="actions">
                <a-button :type="excludeSameHero ? 'primary' : 'default'" @click="toggleExcludeSameHero">
                    {{ excludeSameHero ? "已剔除同名" : "剔除同名对局" }}
                </a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <a-spin :spinning="tableLoading">
                <table class="rate-table">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>胜场</th>
                            <th>败场</th>
                            <th>胜率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in data"
                            :key="item.id"
                            :class="{ unused: !item.sheng && !item.bai, clickable: item.sheng + item.bai > 0 }"
                            @click="openHero(item)"
                        >
                            <td class="name">{{ item.name }}</td>
                            <td class="num win">{{ item.sheng }}</td>
                            <td class="num lose">{{ item.bai }}</td>
                            <td class="num rate">{{ item.shenglv }}</td>
                        </tr>
                    </tbody>
                </table>
            </a-spin>
        </div>

        <a-modal
            v-model:open="detailOpen"
            :footer="null"
            destroyOnClose
            :width="isNarrow ? '94%' : 560"
            centered
        >
            <template #title>
                <span class="modal-title">{{ detailHero ? detailHero.name + " · 历史对局" : "历史对局" }}</span>
            </template>
            <div v-if="detailHero" class="match-detail">
                <p class="match-meta">
                    有效 {{ detailStats.total }} 场 · 胜 {{ detailStats.sheng }} · 负 {{ detailStats.bai }} ·
                    胜率 {{ detailStats.shenglv }}
                </p>
                <div class="matchup">
                    <div class="matchup-col">
                        <div class="matchup-head win">战胜 <b>{{ matchup.win.reduce((n, r) => n + r.count, 0) }}</b></div>
                        <ul v-if="matchup.win.length" class="matchup-list">
                            <li v-for="r in matchup.win" :key="'w-' + r.id">{{ r.name }} · {{ r.count }}</li>
                        </ul>
                        <p v-else class="empty">暂无战胜记录</p>
                    </div>
                    <div class="matchup-col">
                        <div class="matchup-head lose">败给 <b>{{ matchup.lose.reduce((n, r) => n + r.count, 0) }}</b></div>
                        <ul v-if="matchup.lose.length" class="matchup-list">
                            <li v-for="r in matchup.lose" :key="'l-' + r.id">{{ r.name }} · {{ r.count }}</li>
                        </ul>
                        <p v-else class="empty">暂无败给记录</p>
                    </div>
                </div>
                <div v-if="detailLogs.length" class="match-list">
                    <div v-for="(log, i) in detailLogs" :key="i" class="match-row">
                        <div class="match-head">
                            <span class="round-tag">{{ log.roundLabel }} · 第{{ log.game }}局</span>
                            <span class="result-chip" :class="'result-' + log.result">
                                {{ log.result === 1 ? "战胜" : "战败" }}
                            </span>
                        </div>
                        <div class="match-body">
                            <span class="who">{{ log.playerName }}</span>
                            <span class="vs">VS</span>
                            <span class="who">{{ log.opponentName }}</span>
                        </div>
                        <div class="match-heroes">对手英雄 {{ log.opponentHeroName }}</div>
                    </div>
                </div>
                <p v-else class="empty">暂无有效对局</p>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiData } from "@/data/shijiesaiData/all";
import { changciList, zhanquList } from "@/utils/func";
import router from "@/router";

const props = defineProps<{
    title: string;
    /** 场次后两位下限（含） */
    roundMin: number;
    /** 场次后两位上限（含） */
    roundMax: number;
}>();

type HeroRow = {
    id: number;
    name: string;
    sheng: number;
    bai: number;
    shenglv: string;
    _shenglv: number;
};

type MatchLog = {
    roundLabel: string;
    game: number;
    playerName: string;
    opponentName: string;
    opponentHeroId: number;
    opponentHeroName: string;
    result: 1 | 2;
};

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const excludeSameHero = ref(false);
const data = ref<HeroRow[]>([]);
const detailOpen = ref(false);
const detailHero = ref<HeroRow | null>(null);
const isNarrow = ref(window.innerWidth < 576);

const heroNameMap = Object.fromEntries(heroTable.map((e: any) => [e.id, e.name]));

function heroName(id: number) {
    return heroNameMap[id] || `英雄${id}`;
}

function roundLabel(no: number) {
    const gt = parseInt(gameType as string);
    const zhanquNo = Math.floor(no / 100) * 100 - (gt - 7) * 10000;
    const zhanqu = zhanquList.find((v) => v.value == zhanquNo)?.label || `战区${Math.floor((no % 10000) / 100)}`;
    const changci = changciList.find((v) => v.value == no % 100)?.label || `场次${no % 100}`;
    return `${zhanqu} · ${changci}`;
}

function getMatches() {
    const gt = parseInt(gameType as string);
    return shijiesaiData.filter(
        (e: any) =>
            Math.floor(e.no / 10000) === gt && e.no % 100 >= props.roundMin && e.no % 100 <= props.roundMax
    );
}

function getList() {
    tableLoading.value = true;
    try {
        const matches = getMatches();
        const heroData: HeroRow[] = heroTable.map((e: any) => ({
            id: e.id,
            name: e.name,
            sheng: 0,
            bai: 0,
            shenglv: "0.00%",
            _shenglv: 0
        }));
        const indexMap = new Map(heroData.map((h, i) => [h.id, i]));
        for (const match of matches) {
            for (let j = 0; j < match.shengfuList.length; j++) {
                const n = match.shengfuList[j];
                if (n != 1 && n != 2) continue;
                const aHeroId = match.AInfo.hero[j % 4];
                const bHeroId = match.BInfo.hero[j % 4];
                if (excludeSameHero.value && aHeroId == bHeroId) continue;
                const aIndex = indexMap.get(aHeroId);
                const bIndex = indexMap.get(bHeroId);
                if (aIndex == null || bIndex == null) continue;
                if (n == 1) {
                    heroData[aIndex].sheng++;
                    heroData[bIndex].bai++;
                } else {
                    heroData[aIndex].bai++;
                    heroData[bIndex].sheng++;
                }
            }
        }
        for (const row of heroData) {
            const games = row.sheng + row.bai;
            const rate = games ? row.sheng / games : 0;
            row._shenglv = rate;
            row.shenglv = `${(rate * 100).toFixed(2)}%`;
        }
        heroData.sort((a, b) => b._shenglv - a._shenglv || b.sheng + b.bai - (a.sheng + a.bai));
        data.value = heroData;
        if (detailHero.value) {
            detailHero.value = heroData.find((h) => h.id === detailHero.value!.id) || detailHero.value;
        }
    } finally {
        tableLoading.value = false;
    }
}

/** 详情始终展示全部有效对局，不受「剔除同名」影响 */
function getHeroLogs(heroId: number): MatchLog[] {
    const logs: MatchLog[] = [];
    for (const match of getMatches()) {
        for (let j = 0; j < match.shengfuList.length; j++) {
            const n = match.shengfuList[j];
            if (n != 1 && n != 2) continue;
            const aHeroId = match.AInfo.hero[j % 4];
            const bHeroId = match.BInfo.hero[j % 4];
            if (aHeroId == heroId) {
                logs.push({
                    roundLabel: roundLabel(match.no),
                    game: j + 1,
                    playerName: match.AInfo.name,
                    opponentName: match.BInfo.name,
                    opponentHeroId: bHeroId,
                    opponentHeroName: heroName(bHeroId),
                    result: n == 1 ? 1 : 2
                });
            }
            if (bHeroId == heroId) {
                logs.push({
                    roundLabel: roundLabel(match.no),
                    game: j + 1,
                    playerName: match.BInfo.name,
                    opponentName: match.AInfo.name,
                    opponentHeroId: aHeroId,
                    opponentHeroName: heroName(aHeroId),
                    result: n == 2 ? 1 : 2
                });
            }
        }
    }
    return logs;
}

const detailLogs = computed(() => (detailHero.value ? getHeroLogs(detailHero.value.id) : []));

const detailStats = computed(() => {
    const logs = detailLogs.value;
    const sheng = logs.filter((l) => l.result === 1).length;
    const bai = logs.filter((l) => l.result === 2).length;
    const total = sheng + bai;
    const rate = total ? sheng / total : 0;
    return {
        sheng,
        bai,
        total,
        shenglv: `${(rate * 100).toFixed(2)}%`
    };
});

const matchup = computed(() => {
    const winMap = new Map<number, number>();
    const loseMap = new Map<number, number>();
    for (const log of detailLogs.value) {
        const map = log.result === 1 ? winMap : loseMap;
        map.set(log.opponentHeroId, (map.get(log.opponentHeroId) || 0) + 1);
    }
    const toRows = (map: Map<number, number>) =>
        [...map.entries()]
            .map(([id, count]) => ({ id, name: heroName(id), count }))
            .sort((a, b) => b.count - a.count || a.id - b.id);
    return { win: toRows(winMap), lose: toRows(loseMap) };
});

function toggleExcludeSameHero() {
    excludeSameHero.value = !excludeSameHero.value;
    getList();
}

function openHero(item: HeroRow) {
    if (!item.sheng && !item.bai) return;
    detailHero.value = item;
    detailOpen.value = true;
}

function goBack() {
    router.go(-1);
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getList();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
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
    gap: 8px;
    flex-shrink: 0;
}

.table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
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

.modal-title {
    font-weight: 800;
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

.matchup {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.matchup-col {
    min-width: 0;
    max-height: 180px;
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

    &.win {
        color: #15803d;
    }

    &.lose {
        color: #b91c1c;
    }

    b {
        margin-left: 4px;
    }
}

.matchup-list {
    margin: 0;
    padding-left: 16px;
    font-size: 12px;
    color: #334155;
    line-height: 1.6;
}

.match-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(50vh, 420px);
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
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
}

.empty {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .rate-table {
        font-size: 14px;
    }
}
</style>
