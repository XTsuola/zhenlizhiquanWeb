<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄击杀表&各强数据</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :rowClass="true" @detail="showModal" :dataSource="data"
                :loading="tableLoading" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="1" tab="击杀">
                    <div>胜率：{{ nowShenglv.toFixed(2) }}%</div>
                    <div>英雄击杀排名：</div>
                    <ul class="modal-list">
                        <li v-for="value in nowJishaList" :key="'k-' + value.name">{{ value.name }}：{{ value.count }}</li>
                    </ul>
                    <div>英雄被击杀排名：</div>
                    <ul>
                        <li v-for="value in nowJishaList2" :key="'d-' + value.name">{{ value.name }}：{{ value.count }}</li>
                    </ul>
                </a-tab-pane>
                <a-tab-pane key="2" tab="8强">
                    <ul class="modal-list">
                        <li v-for="name in nowPlayerList" :key="'p8-' + name">
                            <span>{{ name }}</span>
                            <span
                                v-if="nowPlayerList2.length != 0 && nowPlayerList2.findIndex((e: any) => e == name) == -1"
                                class="eliminated">（淘汰）</span>
                        </li>
                    </ul>
                </a-tab-pane>
                <a-tab-pane key="3" tab="4强">
                    <ul class="modal-list">
                        <li v-for="name in nowPlayerList2" :key="'p4-' + name">
                            <span>{{ name }}</span>
                            <span
                                v-if="nowPlayerList3.length != 0 && nowPlayerList3.findIndex((e: any) => e == name) == -1"
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
import { ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import MyTabel from "@/components/table.vue";
import router from "@/router";

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const visible = ref(false);
const title = ref("");
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 100,
        ellipsis: true
    },
    {
        title: "8强",
        dataIndex: "count",
        key: "count",
        width: 64,
        align: "center"
    },
    {
        title: "4强",
        dataIndex: "count2",
        key: "count2",
        width: 64,
        align: "center"
    },
    {
        title: "2强",
        dataIndex: "count3",
        key: "count3",
        width: 64,
        align: "center"
    },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 72
    }
]);
const nowJishaList = ref<any>([]);
const nowJishaList2 = ref<any>([]);
const nowShenglv = ref(0);
const nowPlayerList = ref<string[]>([]);
const nowPlayerList2 = ref<string[]>([]);
const nowPlayerList3 = ref<string[]>([]);
const activeKey = ref("1");

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
            let originalData = res.data.data;
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
                    if (n != 0) {
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
            }
            heroData.sort((a: any, b: any) => b.count - a.count);
            data.value = heroData;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal(_: number, record: any) {
    nowJishaList.value = [];
    visible.value = true;
    title.value = record.name + "的信息";
    let data = [], data2 = [];
    for (let v of record.cnt) {
        let heroObj: any = heroTable.find((e: any) => e.id == v[0]);
        data.push({
            name: heroObj.name,
            count: v[1]
        });
    }
    for (let v of record.cnt2) {
        let heroObj: any = heroTable.find((e: any) => e.id == v[0]);
        data2.push({
            name: heroObj.name,
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

.modal-list {
    margin-bottom: 15px;
}

.eliminated {
    color: #dc2626;
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
