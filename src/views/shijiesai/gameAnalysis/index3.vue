<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ title }}届—种族选取表</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <a-spin :spinning="tableLoading">
            <div class="race-list">
                <section v-for="race in data" :key="race.id" class="race-card">
                    <header class="race-head">
                        <h2 class="race-name">{{ race.name }}</h2>
                        <div class="race-stats">
                            <span class="stat-pill">
                                <em>主</em>{{ race.count1 }}<small>{{ race.rate1 }}</small>
                            </span>
                            <span class="stat-pill">
                                <em>副</em>{{ race.count2 }}<small>{{ race.rate2 }}</small>
                            </span>
                        </div>
                    </header>
                    <div class="race-body">
                        <div class="hero-row">
                            <span class="hero-label">主</span>
                            <div v-if="race.heroList?.length" class="hero-chips">
                                <span v-for="item in race.heroList" :key="'z-' + item.id" class="chip">
                                    {{ item.name }}<b>{{ item.count }}</b>
                                </span>
                            </div>
                            <span v-else class="hero-empty">暂无</span>
                        </div>
                        <div class="hero-row">
                            <span class="hero-label">副</span>
                            <div v-if="race.heroList2?.length" class="hero-chips">
                                <span v-for="item in race.heroList2" :key="'f-' + item.id" class="chip chip--muted">
                                    {{ item.name }}<b>{{ item.count }}</b>
                                </span>
                            </div>
                            <span v-else class="hero-empty">暂无</span>
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
let zhongzuData: any = [{
    id: 1,
    name: "帝国",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 2,
    name: "隐秘",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 3,
    name: "禅意",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 4,
    name: "港口",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 5,
    name: "炼狱",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 6,
    name: "蛮石",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}, {
    id: 7,
    name: "冬神",
    count1: 0,
    count2: 0,
    heroCnt: {},
    heroCnt2: {}
}];
const data = ref<any>([]);
const title = ref();
title.value = gameType;

function shortHeroName(name: string) {
    const i = name.indexOf("·");
    return i >= 0 ? name.slice(i + 1) : name;
}

function formatRate(value: number, total: number) {
    if (!total) return "0.00%";
    return `${((value / total) * 100).toFixed(2)}%`;
}

function addZhuPick(hero: any) {
    const race = zhongzuData[hero.zhu - 1];
    race.count1++;
    race.heroCnt[hero.id] = (race.heroCnt[hero.id] || 0) + 1;
}

function addFuPick(hero: any) {
    const race = zhongzuData[hero.fu - 1];
    race.count2++;
    race.heroCnt2[hero.id] = (race.heroCnt2[hero.id] || 0) + 1;
}

function toHeroList(cnt: Record<number, number>) {
    return Object.entries(cnt)
        .map(([id, count]) => {
            const hero: any = heroTable.find((h: any) => h.id == Number(id));
            return {
                id: Number(id),
                name: shortHeroName(hero?.name || String(id)),
                count: count as number
            };
        })
        .sort((a, b) => b.count - a.count);
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
            zhongzuData.forEach((e: any) => {
                e.count1 = 0;
                e.count2 = 0;
                e.heroCnt = {};
                e.heroCnt2 = {};
            });
            let originalData = res.data.data;
            let data4 = originalData.filter((e: any) => {
                return e.no % 100 >= 1 && e.no % 100 <= 4;
            });
            for (let i = 0; i < data4.length; i++) {
                for (let j = 0; j < 4; j++) {
                    const aObj: any = heroTable.find((e: any) => e.id == data4[i].AInfo.hero[j]);
                    const bObj: any = heroTable.find((e: any) => e.id == data4[i].BInfo.hero[j]);
                    addZhuPick(aObj);
                    addFuPick(aObj);
                    addZhuPick(bObj);
                    addFuPick(bObj);
                }
            }
            const totalZhu = zhongzuData.reduce((sum: number, e: any) => sum + e.count1, 0);
            const totalFu = zhongzuData.reduce((sum: number, e: any) => sum + e.count2, 0);
            data.value = zhongzuData
                .map((e: any) => ({
                    ...e,
                    rate1: formatRate(e.count1, totalZhu),
                    rate2: formatRate(e.count2, totalFu),
                    heroList: toHeroList(e.heroCnt),
                    heroList2: toHeroList(e.heroCnt2)
                }))
                .sort((a: any, b: any) => (b.count1 + b.count2) - (a.count1 + a.count2));
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

.actions {
    flex-shrink: 0;
}

.race-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.race-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.race-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding: 12px 14px 10px;
    border-bottom: 1px solid #f0f2f5;
}

.race-name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    letter-spacing: 0.02em;
}

.race-stats {
    display: flex;
    gap: 8px;
}

.stat-pill {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: #f3f4f6;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    font-variant-numeric: tabular-nums;

    em {
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        color: #6b7280;
    }

    small {
        font-size: 11px;
        font-weight: 500;
        color: #9ca3af;
    }
}

.race-body {
    padding: 10px 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hero-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.hero-label {
    flex-shrink: 0;
    margin-top: 3px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.hero-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 6px;
    background: #f8fafc;
    border: 1px solid #e8ebf0;
    font-size: 12px;
    color: #374151;
    line-height: 1.35;

    b {
        font-weight: 600;
        color: #111827;
        font-variant-numeric: tabular-nums;
    }
}

.chip--muted {
    background: #fafafa;
    color: #4b5563;
}

.hero-empty {
    margin-top: 3px;
    font-size: 12px;
    color: #c0c4cc;
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
}
</style>
