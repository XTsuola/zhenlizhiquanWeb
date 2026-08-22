<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ title }}届—种族胜率表</h1>
            <a-button size="small" @click="goBack">返回</a-button>
        </div>
        <a-spin :spinning="tableLoading" class="spin-wrap">
            <div class="list-head">
                <div class="col-name">种族</div>
                <div class="col-total">综合</div>
                <div class="col-sub"><span class="type-tag type-tag--zhu">主</span></div>
                <div class="col-sub"><span class="type-tag type-tag--fu">副</span></div>
            </div>
            <div class="race-list">
                <section
                    v-for="race in data"
                    :key="race.id"
                    class="race-item"
                    :class="[rateTone(race._totalRate), { 'race-item--open': expandedId === race.id }]"
                >
                    <div class="race-summary" @click="toggleExpand(race.id)">
                        <div class="col-name">
                            <span class="expand-icon">{{ expandedId === race.id ? "▾" : "▸" }}</span>
                            <span>{{ race.name }}</span>
                        </div>
                        <div class="col-total">
                            <span class="rate-main">{{ race.totalRate }}</span>
                            <span class="rate-sub">{{ race.totalSheng }}胜 {{ race.totalBai }}败</span>
                        </div>
                        <div class="col-sub">
                            <span class="type-tag type-tag--zhu type-tag--inline">主</span>
                            <span class="rate-val">{{ race.zhuRate }}</span>
                            <span class="rate-sub">{{ race.zhuSheng }}胜 {{ race.zhuBai }}败</span>
                        </div>
                        <div class="col-sub">
                            <span class="type-tag type-tag--fu type-tag--inline">副</span>
                            <span class="rate-val">{{ race.fuRate }}</span>
                            <span class="rate-sub">{{ race.fuSheng }}胜 {{ race.fuBai }}败</span>
                        </div>
                    </div>
                    <div v-show="expandedId === race.id" class="race-heroes">
                        <div class="hero-group">
                            <div class="hero-group-title"><span class="type-tag type-tag--zhu">主</span>种族英雄</div>
                            <div v-if="race.heroListZhu.length" class="hero-chips">
                                <span v-for="item in race.heroListZhu" :key="'z-' + item.id" class="chip">
                                    {{ item.name }}<b>{{ item.rate }}</b>
                                    <small>{{ item.sheng }}胜{{ item.bai }}败</small>
                                </span>
                            </div>
                            <div v-else class="hero-empty">暂无</div>
                        </div>
                        <div class="hero-group">
                            <div class="hero-group-title"><span class="type-tag type-tag--fu">副</span>种族英雄</div>
                            <div v-if="race.heroListFu.length" class="hero-chips">
                                <span v-for="item in race.heroListFu" :key="'f-' + item.id" class="chip chip--fu">
                                    {{ item.name }}<b>{{ item.rate }}</b>
                                    <small>{{ item.sheng }}胜{{ item.bai }}败</small>
                                </span>
                            </div>
                            <div v-else class="hero-empty">暂无</div>
                        </div>
                    </div>
                </section>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import router from "@/router";

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const title = ref(gameType);
const data = ref<any>([]);
const expandedId = ref<number | null>(null);

const RACE_LIST = ["帝国", "隐秘", "禅意", "港口", "炼狱", "蛮石", "冬神"];

function createRaceData() {
    return RACE_LIST.map((name, i) => ({
        id: i + 1,
        name,
        zhuSheng: 0,
        zhuBai: 0,
        fuSheng: 0,
        fuBai: 0,
        heroZhu: {} as Record<number, { sheng: number; bai: number }>,
        heroFu: {} as Record<number, { sheng: number; bai: number }>
    }));
}

function shortHeroName(name: string) {
    const i = name.indexOf("·");
    return i >= 0 ? name.slice(i + 1) : name;
}

function formatRate(sheng: number, bai: number) {
    const games = sheng + bai;
    const rate = games ? sheng / games : 0;
    return {
        text: `${(rate * 100).toFixed(2)}%`,
        rate
    };
}

function rateTone(rate: number) {
    if (!rate) return "";
    if (rate < 0.4) return "tone-low";
    if (rate >= 0.6) return "tone-high";
    return "";
}

function addHeroResult(
    map: Record<number, { sheng: number; bai: number }>,
    heroId: number,
    win: boolean
) {
    if (!map[heroId]) map[heroId] = { sheng: 0, bai: 0 };
    win ? map[heroId].sheng++ : map[heroId].bai++;
}

function addResult(
    race: any,
    raceId: number,
    heroId: number,
    type: "zhu" | "fu",
    win: boolean
) {
    const item = race[raceId - 1];
    if (type === "zhu") {
        win ? item.zhuSheng++ : item.zhuBai++;
        addHeroResult(item.heroZhu, heroId, win);
    } else {
        win ? item.fuSheng++ : item.fuBai++;
        addHeroResult(item.heroFu, heroId, win);
    }
}

function toHeroList(map: Record<number, { sheng: number; bai: number }>) {
    return Object.entries(map)
        .map(([id, stat]) => {
            const hero: any = heroTable.find((h: any) => h.id == Number(id));
            const rate = formatRate(stat.sheng, stat.bai);
            return {
                id: Number(id),
                name: shortHeroName(hero?.name || String(id)),
                sheng: stat.sheng,
                bai: stat.bai,
                rate: rate.text,
                _rate: rate.rate
            };
        })
        .sort((a, b) => b._rate - a._rate || b.sheng + b.bai - (a.sheng + a.bai));
}

function toggleExpand(id: number) {
    expandedId.value = expandedId.value === id ? null : id;
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
            const raceData = createRaceData();
            const matchList = res.data.data.filter((e: any) => e.no % 100 >= 1 && e.no % 100 <= 8);
            for (let i = 0; i < matchList.length; i++) {
                for (let j = 0; j < matchList[i].shengfuList.length; j++) {
                    const n = matchList[i].shengfuList[j];
                    if (n != 1 && n != 2) continue;
                    const aHero: any = heroTable.find((e: any) => e.id == matchList[i].AInfo.hero[j % 4]);
                    const bHero: any = heroTable.find((e: any) => e.id == matchList[i].BInfo.hero[j % 4]);
                    if (!aHero || !bHero) continue;
                    if (n == 1) {
                        addResult(raceData, aHero.zhu, aHero.id, "zhu", true);
                        addResult(raceData, bHero.zhu, bHero.id, "zhu", false);
                        addResult(raceData, aHero.fu, aHero.id, "fu", true);
                        addResult(raceData, bHero.fu, bHero.id, "fu", false);
                    } else {
                        addResult(raceData, aHero.zhu, aHero.id, "zhu", false);
                        addResult(raceData, bHero.zhu, bHero.id, "zhu", true);
                        addResult(raceData, aHero.fu, aHero.id, "fu", false);
                        addResult(raceData, bHero.fu, bHero.id, "fu", true);
                    }
                }
            }
            data.value = raceData
                .map((e: any) => {
                    const zhu = formatRate(e.zhuSheng, e.zhuBai);
                    const fu = formatRate(e.fuSheng, e.fuBai);
                    const totalSheng = e.zhuSheng + e.fuSheng;
                    const totalBai = e.zhuBai + e.fuBai;
                    const total = formatRate(totalSheng, totalBai);
                    return {
                        ...e,
                        zhuRate: zhu.text,
                        fuRate: fu.text,
                        totalSheng,
                        totalBai,
                        totalRate: total.text,
                        _totalRate: total.rate,
                        heroListZhu: toHeroList(e.heroZhu),
                        heroListFu: toHeroList(e.heroFu)
                    };
                })
                .sort((a: any, b: any) => b._totalRate - a._totalRate || b.totalSheng + b.totalBai - (a.totalSheng + a.totalBai));
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
    min-height: 100dvh;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    display: flex;
    flex-direction: column;
    max-width: 960px;
    margin: 0 auto;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.spin-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
}

.race-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.list-head {
    display: grid;
    grid-template-columns: 72px 1fr 1fr 1fr;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    margin-bottom: 4px;
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

.type-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;

    &--zhu {
        color: #1d4ed8;
        background: #eff6ff;
        border: 1px solid #dbeafe;
    }

    &--fu {
        color: #7c3aed;
        background: #f5f3ff;
        border: 1px solid #e9e5ff;
    }

    &--inline {
        margin-bottom: 4px;
    }
}

.race-item {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

    &.tone-low {
        border-color: #e9d4f0;
    }

    &.tone-high {
        border-color: #f0c4c4;
    }

    &--open {
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
    }
}

.race-summary {
    display: grid;
    grid-template-columns: 72px 1fr 1fr 1fr;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    cursor: pointer;
    user-select: none;

    &:hover {
        background: #fafbfc;
    }
}

.col-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
}

.expand-icon {
    font-size: 11px;
    color: #9ca3af;
    width: 12px;
    flex-shrink: 0;
}

.col-total,
.col-sub {
    text-align: center;
    line-height: 1.35;
}

.rate-main {
    display: block;
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    font-variant-numeric: tabular-nums;
}

.rate-val {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    font-variant-numeric: tabular-nums;
}

.rate-sub {
    display: block;
    margin-top: 3px;
    font-size: 11px;
    color: #9ca3af;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.race-heroes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border-top: 1px solid #f0f2f5;
    background: #fafbfc;
}

.hero-group {
    padding: 10px 14px 12px;

    & + .hero-group {
        border-left: 1px solid #f0f2f5;
    }
}

.hero-group-title {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

.hero-chips {
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
    background: #fff;
    border: 1px solid #e8ebf0;
    font-size: 12px;
    color: #374151;
    line-height: 1.3;

    b {
        font-weight: 600;
        color: #111827;
        font-variant-numeric: tabular-nums;
    }

    small {
        font-size: 10px;
        color: #9ca3af;
        font-variant-numeric: tabular-nums;
    }
}

.chip--fu {
    background: #fafafa;
}

.hero-empty {
    font-size: 12px;
    color: #c0c4cc;
}

.race-item.tone-low .race-summary {
    background: #faf5fc;
}

.race-item.tone-high .race-summary {
    background: #fef5f5;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
    }

    .title {
        font-size: 1.1rem;
    }

    .list-head {
        grid-template-columns: 96px 1fr 1fr 1fr;
        padding: 8px 16px;
        font-size: 13px;
    }

    .race-summary {
        grid-template-columns: 96px 1fr 1fr 1fr;
        padding: 14px 16px;
    }

    .col-name {
        font-size: 15px;
    }

    .rate-main {
        font-size: 20px;
    }

    .rate-val {
        font-size: 17px;
    }

    .rate-sub {
        font-size: 12px;
    }
}
</style>
