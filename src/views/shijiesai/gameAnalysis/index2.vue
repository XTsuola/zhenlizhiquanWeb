<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ title }}届—种族胜率对比</h1>
            <a-button size="small" @click="goBack">返回</a-button>
        </div>
        <a-spin :spinning="tableLoading" class="spin-wrap">
            <div class="table-panel">
                <table class="wr-table">
                    <thead>
                        <tr>
                            <th class="col-name">种族</th>
                            <th class="col-block">这届</th>
                            <th class="col-block">上届</th>
                            <th class="col-change">变化</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="race in data" :key="race.id" :class="rateTone(race.nowTotalRate)">
                            <td class="col-name">{{ race.name }}</td>
                            <td class="col-block">
                                <span class="rate-main">{{ race.nowTotalText }}</span>
                                <span class="rate-sub">主 {{ race.nowZhuText }} · 副 {{ race.nowFuText }}</span>
                                <span class="rate-meta">{{ race.nowTotalSheng }}胜 {{ race.nowTotalBai }}败</span>
                            </td>
                            <td class="col-block">
                                <span class="rate-main">{{ race.lastTotalText }}</span>
                                <span class="rate-sub">主 {{ race.lastZhuText }} · 副 {{ race.lastFuText }}</span>
                                <span class="rate-meta">{{ race.lastTotalSheng }}胜 {{ race.lastTotalBai }}败</span>
                            </td>
                            <td class="col-change">
                                <span class="diff-main" :class="diffClass(race.totalDiff)">{{ formatDiff(race.totalDiff) }}</span>
                                <span class="diff-sub">
                                    <span :class="diffClass(race.zhuDiff)">主 {{ formatDiff(race.zhuDiff) }}</span>
                                    <span :class="diffClass(race.fuDiff)">副 {{ formatDiff(race.fuDiff) }}</span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
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

const RACE_LIST = ["帝国", "隐秘", "禅意", "港口", "炼狱", "蛮石", "冬神"];

function createRaceData() {
    return RACE_LIST.map((name, i) => ({
        id: i + 1,
        name,
        zhuSheng: 0,
        zhuBai: 0,
        fuSheng: 0,
        fuBai: 0
    }));
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

function diffClass(diff: number) {
    if (diff > 0) return "diff-up";
    if (diff < 0) return "diff-down";
    return "";
}

function formatDiff(diff: number) {
    const abs = Math.abs(diff).toFixed(2);
    if (diff > 0) return `+${abs}%`;
    if (diff < 0) return `-${abs}%`;
    return "0.00%";
}

function addResult(raceData: any[], raceId: number, type: "zhu" | "fu", win: boolean) {
    const race = raceData[raceId - 1];
    if (type === "zhu") {
        win ? race.zhuSheng++ : race.zhuBai++;
    } else {
        win ? race.fuSheng++ : race.fuBai++;
    }
}

function buildRaceStats(raw: any[]) {
    const raceData = createRaceData();
    const matchList = raw.filter((e: any) => e.no % 100 >= 1 && e.no % 100 <= 8);
    for (let i = 0; i < matchList.length; i++) {
        for (let j = 0; j < matchList[i].shengfuList.length; j++) {
            const n = matchList[i].shengfuList[j];
            if (n != 1 && n != 2) continue;
            const aHero: any = heroTable.find((e: any) => e.id == matchList[i].AInfo.hero[j % 4]);
            const bHero: any = heroTable.find((e: any) => e.id == matchList[i].BInfo.hero[j % 4]);
            if (!aHero || !bHero) continue;
            if (n == 1) {
                addResult(raceData, aHero.zhu, "zhu", true);
                addResult(raceData, bHero.zhu, "zhu", false);
                addResult(raceData, aHero.fu, "fu", true);
                addResult(raceData, bHero.fu, "fu", false);
            } else {
                addResult(raceData, aHero.zhu, "zhu", false);
                addResult(raceData, bHero.zhu, "zhu", true);
                addResult(raceData, aHero.fu, "fu", false);
                addResult(raceData, bHero.fu, "fu", true);
            }
        }
    }
    return raceData.map((e: any) => {
        const zhu = formatRate(e.zhuSheng, e.zhuBai);
        const fu = formatRate(e.fuSheng, e.fuBai);
        const totalSheng = e.zhuSheng + e.fuSheng;
        const totalBai = e.zhuBai + e.fuBai;
        const total = formatRate(totalSheng, totalBai);
        return {
            id: e.id,
            name: e.name,
            zhuRate: zhu.rate,
            fuRate: fu.rate,
            totalRate: total.rate,
            zhuText: zhu.text,
            fuText: fu.text,
            totalText: total.text,
            totalSheng,
            totalBai
        };
    });
}

function getPreviousGameType() {
    let type = parseInt(gameType as string);
    if (type == 11) {
        type -= 2;
    } else {
        type -= 1;
    }
    return type;
}

async function fetchRaceStats(type: number) {
    const params: ShijiesaiInfoListType = {
        pageSize: 200,
        pageNo: 1,
        gameType: type
    };
    const res = await shijiesaiInfoList(params);
    if (res.status == 200) {
        return buildRaceStats(res.data.data);
    }
    return [];
}

async function getList() {
    tableLoading.value = true;
    try {
        const nowStats = await fetchRaceStats(parseInt(gameType as string));
        const lastStats = await fetchRaceStats(getPreviousGameType());
        data.value = nowStats
            .map((now: any) => {
                const last = lastStats.find((e: any) => e.id == now.id) || {
                    totalRate: 0,
                    zhuRate: 0,
                    fuRate: 0,
                    totalText: "0.00%",
                    zhuText: "0.00%",
                    fuText: "0.00%",
                    totalSheng: 0,
                    totalBai: 0
                };
                const totalDiff = (now.totalRate - last.totalRate) * 100;
                const zhuDiff = (now.zhuRate - last.zhuRate) * 100;
                const fuDiff = (now.fuRate - last.fuRate) * 100;
                return {
                    id: now.id,
                    name: now.name,
                    nowTotalText: now.totalText,
                    nowZhuText: now.zhuText,
                    nowFuText: now.fuText,
                    nowTotalSheng: now.totalSheng,
                    nowTotalBai: now.totalBai,
                    nowTotalRate: now.totalRate,
                    lastTotalText: last.totalText,
                    lastZhuText: last.zhuText,
                    lastFuText: last.fuText,
                    lastTotalSheng: last.totalSheng,
                    lastTotalBai: last.totalBai,
                    totalDiff,
                    zhuDiff,
                    fuDiff
                };
            })
            .sort((a: any, b: any) => b.totalDiff - a.totalDiff || b.nowTotalRate - a.nowTotalRate);
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

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
}

.table-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.wr-table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 13px;
    color: #374151;

    th,
    td {
        padding: 10px 12px;
        border-bottom: 1px solid #f0f2f5;
        vertical-align: middle;
    }

    th {
        background: #f7f8fa;
        font-weight: 600;
        color: #6b7280;
        font-size: 12px;
        white-space: nowrap;
        height: 40px;
    }

    tbody tr {
        height: calc((100% - 40px) / 7);
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    .col-name {
        width: 64px;
        font-size: 14px;
        font-weight: 700;
        color: #111827;
    }

    .col-block {
        width: 32%;
        text-align: center;
    }

    .col-change {
        width: 22%;
        text-align: center;
    }

    .rate-main {
        display: block;
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        font-variant-numeric: tabular-nums;
    }

    .rate-sub {
        display: block;
        margin-top: 4px;
        font-size: 11px;
        color: #6b7280;
        white-space: nowrap;
    }

    .rate-meta {
        display: block;
        margin-top: 3px;
        font-size: 11px;
        color: #9ca3af;
        font-variant-numeric: tabular-nums;
    }

    .diff-main {
        display: block;
        font-size: 17px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #374151;
    }

    .diff-sub {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 6px;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        color: #6b7280;
    }

    .diff-up {
        color: #dc2626;
    }

    .diff-down {
        color: #2563eb;
    }

    tr.tone-low td {
        background: #faf5fc;
    }

    tr.tone-high td {
        background: #fef5f5;
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
    }

    .title {
        font-size: 1.1rem;
    }

    .wr-table {
        font-size: 14px;

        th,
        td {
            padding: 12px 16px;
        }

        th {
            font-size: 13px;
            height: 44px;
        }

        tbody tr {
            height: calc((100% - 44px) / 7);
        }

        .col-name {
            width: 88px;
            font-size: 15px;
        }

        .rate-main {
            font-size: 20px;
        }

        .rate-sub {
            font-size: 12px;
        }

        .rate-meta {
            font-size: 12px;
        }

        .diff-main {
            font-size: 20px;
        }

        .diff-sub {
            font-size: 12px;
        }
    }
}
</style>
