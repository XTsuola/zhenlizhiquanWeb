<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄击杀表数据</h1>
            <div class="actions">
                <a-button :type="viewMode === 'advance' ? 'primary' : 'default'" @click="toggleView">英雄晋级率</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :rowClass="true" @detail="showModal" :dataSource="data"
                :loading="tableLoading" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :maskClosable="false">
            <template #title>
                <span class="modal-title">
                    <img v-if="detailImg" class="avatar" :src="detailImg" :alt="title" />
                    {{ title }}
                </span>
            </template>
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="1" tab="击杀">
                    <div>胜率：{{ nowShenglv.toFixed(2) }}%</div>
                    <div>英雄击杀排名：</div>
                    <ul class="modal-list">
                        <li v-for="value in nowJishaList" :key="'k-' + value.name" class="hero-line">
                            <img class="avatar" :src="value.img" :alt="value.name" />
                            <span>{{ value.name }}：{{ value.count }}</span>
                        </li>
                    </ul>
                    <div>英雄被击杀排名：</div>
                    <ul>
                        <li v-for="value in nowJishaList2" :key="'d-' + value.name" class="hero-line">
                            <img class="avatar" :src="value.img" :alt="value.name" />
                            <span>{{ value.name }}：{{ value.count }}</span>
                        </li>
                    </ul>
                </a-tab-pane>
                <a-tab-pane key="2" tab="8强">
                    <div class="advance-block">
                        <div class="advance-label">8强→4强晋级率</div>
                        <div class="advance-frac">{{ detailRate8Frac }}</div>
                        <div v-if="detailRate8Pct" class="advance-pct">{{ detailRate8Pct }}</div>
                    </div>
                    <ul class="modal-list">
                        <li v-for="(name, idx) in nowPlayerList" :key="'p8-' + idx + '-' + name">
                            <span>{{ name }}</span>
                            <span
                                v-if="nowPlayerList2.length != 0 && nowPlayerList2.findIndex((e: any) => e == name) != -1"
                                class="advanced">（晋级）</span>
                            <span
                                v-else-if="nowPlayerList2.length != 0 && nowPlayerList2.findIndex((e: any) => e == name) == -1"
                                class="eliminated">（淘汰）</span>
                        </li>
                    </ul>
                </a-tab-pane>
                <a-tab-pane key="3" tab="4强">
                    <div class="advance-block">
                        <div class="advance-label">4强→决赛晋级率</div>
                        <div class="advance-frac">{{ detailRate4Frac }}</div>
                        <div v-if="detailRate4Pct" class="advance-pct">{{ detailRate4Pct }}</div>
                    </div>
                    <ul class="modal-list">
                        <li v-for="(name, idx) in nowPlayerList2" :key="'p4-' + idx + '-' + name">
                            <span>{{ name }}</span>
                            <span
                                v-if="nowPlayerList3.length != 0 && nowPlayerList3.findIndex((e: any) => e == name) != -1"
                                class="advanced">（晋级）</span>
                            <span
                                v-else-if="nowPlayerList3.length != 0 && nowPlayerList3.findIndex((e: any) => e == name) == -1"
                                class="eliminated">（淘汰）</span>
                        </li>
                    </ul>
                </a-tab-pane>
                <a-tab-pane key="4" tab="决赛">
                    <ul class="modal-list">
                        <li v-for="name in nowPlayerList3" :key="'pf-' + name">{{ name }}</li>
                    </ul>
                </a-tab-pane>
            </a-tabs>
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiData } from "@/data/shijiesaiData/all";
import MyTabel from "@/components/table.vue";
import router from "@/router";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const viewMode = ref<"count" | "advance">("count");
const visible = ref(false);
const title = ref("");
const detailImg = ref("");
const detailRate8Frac = ref("—");
const detailRate8Pct = ref("");
const detailRate4Frac = ref("—");
const detailRate4Pct = ref("");
const data = ref<any>([]);
const columns = computed(() => {
    const head = { title: "头像", dataIndex: "headImg", key: "headImg", width: 64 };
    const action = { title: "操作", key: "action", list: ["detail"], width: 72 };
    if (viewMode.value === "advance") {
        return [
            head,
            {
                title: "8强→4强",
                key: "rate8",
                frac: "rate8Frac",
                pct: "rate8Pct",
                width: 110,
                align: "center",
                sorter: (a: any, b: any) => a.rate8 - b.rate8
            },
            {
                title: "4强→决赛",
                key: "rate4",
                frac: "rate4Frac",
                pct: "rate4Pct",
                width: 110,
                align: "center",
                sorter: (a: any, b: any) => a.rate4 - b.rate4
            },
            action
        ];
    }
    return [
        head,
        {
            title: "8强",
            dataIndex: "count",
            key: "count",
            width: 72,
            align: "center",
            sorter: (a: any, b: any) => a.count - b.count,
            defaultSortOrder: "descend"
        },
        {
            title: "4强",
            dataIndex: "count2",
            key: "count2",
            width: 72,
            align: "center",
            sorter: (a: any, b: any) => a.count2 - b.count2
        },
        {
            title: "2强",
            dataIndex: "count3",
            key: "count3",
            width: 72,
            align: "center",
            sorter: (a: any, b: any) => a.count3 - b.count3
        },
        action
    ];
});
const nowJishaList = ref<any>([]);
const nowJishaList2 = ref<any>([]);
const nowShenglv = ref(0);
const nowPlayerList = ref<string[]>([]);
const nowPlayerList2 = ref<string[]>([]);
const nowPlayerList3 = ref<string[]>([]);
const activeKey = ref("1");

function advanceStat(baseNames: string[], laterNames: string[], laterExists: boolean) {
    if (!laterExists || !baseNames.length) {
        return { hit: 0, base: baseNames.length, rate: -1, frac: "—", pct: "" };
    }
    const later = new Set(laterNames);
    const hit = baseNames.filter((name) => later.has(name)).length;
    const rate = hit / baseNames.length;
    return {
        hit,
        base: baseNames.length,
        rate,
        frac: `${hit}/${baseNames.length}`,
        pct: `${(rate * 100).toFixed(2)}%`
    };
}

function shortHeroName(name: string) {
    const i = name.indexOf("·");
    return i >= 0 ? name.slice(i + 1) : name;
}

function getList() {
    tableLoading.value = true;
    try {
        const gt = parseInt(gameType as string);
        const originalData = shijiesaiData.filter((e: any) => Math.floor(e.no / 10000) === gt);
        let data4 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 4;
        });
        let data5 = originalData.filter((e: any) => {
            return e.no % 100 >= 5 && e.no % 100 <= 6;
        });
        let data6 = originalData.filter((e: any) => {
            return e.no % 100 == 8;
        });
        let data8 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 8;
        });
        let heroData: any = heroTable.map((e: any) => {
            return {
                id: e.id,
                name: e.name,
                img: IMG_PREFIX + e.img,
                shortName: shortHeroName(e.name),
                zhu: e.zhu,
                fu: e.fu,
                count: 0,
                count2: 0,
                count3: 0,
                sheng: 0,
                bai: 0,
                player: [],
                player2: [],
                player3: [],
                cnt: new Map(),
                cnt2: new Map()
            };
        });
        for (let i = 0; i < data4.length; i++) {
            for (let j = 0; j < 4; j++) {
                const aIndex = heroData.findIndex((e: any) => e.id == data4[i].AInfo.hero[j]);
                const bIndex = heroData.findIndex((e: any) => e.id == data4[i].BInfo.hero[j]);
                heroData[aIndex].count++;
                heroData[aIndex].player.push(data4[i].AInfo.name);
                heroData[bIndex].count++;
                heroData[bIndex].player.push(data4[i].BInfo.name);
            }
        }
        for (let i = 0; i < data5.length; i++) {
            for (let j = 0; j < 4; j++) {
                const aIndex = heroData.findIndex((e: any) => e.id == data5[i].AInfo.hero[j]);
                const bIndex = heroData.findIndex((e: any) => e.id == data5[i].BInfo.hero[j]);
                heroData[aIndex].count2++;
                heroData[aIndex].player2.push(data5[i].AInfo.name);
                heroData[bIndex].count2++;
                heroData[bIndex].player2.push(data5[i].BInfo.name);
            }
        }
        for (let i = 0; i < data6.length; i++) {
            for (let j = 0; j < 4; j++) {
                const aIndex = heroData.findIndex((e: any) => e.id == data6[i].AInfo.hero[j]);
                const bIndex = heroData.findIndex((e: any) => e.id == data6[i].BInfo.hero[j]);
                heroData[aIndex].count3++;
                heroData[aIndex].player3.push(data6[i].AInfo.name);
                heroData[bIndex].count3++;
                heroData[bIndex].player3.push(data6[i].BInfo.name);
            }
        }
        for (let i = 0; i < data8.length; i++) {
            for (let j = 0; j < data8[i].shengfuList.length; j++) {
                let n = data8[i].shengfuList[j];
                if (n != 1 && n != 2) continue;
                let aHeroIndex = heroData.findIndex((e: any) => e.id == data8[i].AInfo.hero[j % 4]);
                let bHeroIndex = heroData.findIndex((e: any) => e.id == data8[i].BInfo.hero[j % 4]);
                if (n == 1) {
                        heroData[aHeroIndex].sheng++;
                        heroData[bHeroIndex].bai++;
                        if (heroData[aHeroIndex].cnt.get(heroData[bHeroIndex].id)) {
                            heroData[aHeroIndex].cnt.set(heroData[bHeroIndex].id, heroData[aHeroIndex].cnt.get(heroData[bHeroIndex].id) + 1);
                        } else {
                            heroData[aHeroIndex].cnt.set(heroData[bHeroIndex].id, 1);
                        }
                        if (heroData[bHeroIndex].cnt2.get(heroData[aHeroIndex].id)) {
                            heroData[bHeroIndex].cnt2.set(heroData[aHeroIndex].id, heroData[bHeroIndex].cnt2.get(heroData[aHeroIndex].id) + 1);
                        } else {
                            heroData[bHeroIndex].cnt2.set(heroData[aHeroIndex].id, 1);
                        }
                    } else {
                        heroData[aHeroIndex].bai++;
                        heroData[bHeroIndex].sheng++;
                        if (heroData[bHeroIndex].cnt.get(heroData[aHeroIndex].id)) {
                            heroData[bHeroIndex].cnt.set(heroData[aHeroIndex].id, heroData[bHeroIndex].cnt.get(heroData[aHeroIndex].id) + 1);
                        } else {
                            heroData[bHeroIndex].cnt.set(heroData[aHeroIndex].id, 1);
                        }
                        if (heroData[aHeroIndex].cnt2.get(heroData[bHeroIndex].id)) {
                            heroData[aHeroIndex].cnt2.set(heroData[bHeroIndex].id, heroData[aHeroIndex].cnt2.get(heroData[bHeroIndex].id) + 1);
                        } else {
                        heroData[aHeroIndex].cnt2.set(heroData[bHeroIndex].id, 1);
                    }
                }
            }
        }
        const hasRound4 = data5.length > 0;
        const hasFinal = data6.length > 0;
        for (const hero of heroData) {
            const to4 = advanceStat(hero.player, hero.player2, hasRound4);
            const toFinal = advanceStat(hero.player2, hero.player3, hasFinal);
            hero.rate8 = to4.rate;
            hero.rate8Frac = to4.frac;
            hero.rate8Pct = to4.pct;
            hero.rate4 = toFinal.rate;
            hero.rate4Frac = toFinal.frac;
            hero.rate4Pct = toFinal.pct;
        }
        data.value = heroData;
        applySort();
    } finally {
        tableLoading.value = false;
    }
}

function applySort() {
    const list = [...data.value];
    if (viewMode.value === "advance") {
        list.sort((a, b) => b.rate8 - a.rate8 || b.rate4 - a.rate4 || b.count - a.count);
    } else {
        list.sort((a, b) => b.count - a.count);
    }
    data.value = list;
}

function toggleView() {
    viewMode.value = viewMode.value === "advance" ? "count" : "advance";
    applySort();
}

function showModal(_: number, record: any) {
    nowJishaList.value = [];
    visible.value = true;
    title.value = record.name + "的信息";
    detailImg.value = record.img || "";
    detailRate8Frac.value = record.rate8Frac || "—";
    detailRate8Pct.value = record.rate8Pct || "";
    detailRate4Frac.value = record.rate4Frac || "—";
    detailRate4Pct.value = record.rate4Pct || "";
    let data = [], data2 = [];
    for (let v of record.cnt) {
        let heroObj: any = heroTable.find((e: any) => e.id == v[0]);
        data.push({
            name: heroObj.name,
            img: IMG_PREFIX + heroObj.img,
            count: v[1]
        });
    }
    for (let v of record.cnt2) {
        let heroObj: any = heroTable.find((e: any) => e.id == v[0]);
        data2.push({
            name: heroObj.name,
            img: IMG_PREFIX + heroObj.img,
            count: v[1]
        });
    }
    data.sort((a: any, b: any) => b.count - a.count);
    nowJishaList.value = data;
    data2.sort((a: any, b: any) => b.count - a.count);
    nowJishaList2.value = data2;
    const sum = record.sheng + record.bai;
    nowShenglv.value = sum != 0 ? (record.sheng / sum) * 100 : 0;
    record.player.sort((a: string, b: string) => parseInt(a) - parseInt(b));
    nowPlayerList.value = record.player;
    nowPlayerList2.value = record.player2;
    nowPlayerList3.value = record.player3;
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
}

.modal-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.modal-list {
    margin-bottom: 15px;
}

.hero-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
}

.avatar {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    background: #e2e8f0;
}

.eliminated {
    color: #dc2626;
}

.advanced {
    color: #15803d;
}

.advance-block {
    margin-bottom: 10px;
}

.advance-label {
    font-size: 12px;
    color: #64748b;
}

.advance-frac {
    margin-top: 2px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.advance-pct {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.2;
    color: #0c4a6e;
    font-variant-numeric: tabular-nums;
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
