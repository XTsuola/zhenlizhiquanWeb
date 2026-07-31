<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄上届与这届对比</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :rowClass="true" :dataSource="data" :loading="tableLoading" />
        </div>
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
        title: "这届",
        dataIndex: "now",
        key: "now",
        width: 120,
        ellipsis: true
    },
    {
        title: "上届",
        dataIndex: "last",
        key: "last",
        width: 120,
        ellipsis: true
    },
    {
        title: "变化",
        dataIndex: "change",
        key: "change",
        width: 72,
        align: "center"
    }
]);

async function getList0() {
    let type = parseInt(gameType as string);
    if (type == 11) {
        type -= 2;
    } else {
        type -= 1;
    }
    const params: ShijiesaiInfoListType = {
        pageSize: 200,
        pageNo: 1,
        gameType: type
    };
    const res = await shijiesaiInfoList(params);
    if (res.status == 200) {
        let originalData = res.data.data;
        let data4 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 4;
        });
        let data8 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 8;
        });
        let heroData: any = heroTable.map((e: any) => {
            return {
                id: e.id,
                name: e.name,
                count: 0,
                sheng: 0,
                bai: 0
            };
        });
        for (let i = 0; i < data4.length; i++) {
            for (let j = 0; j < 4; j++) {
                const aIndex = heroData.findIndex((e: any) => e.id == data4[i].AInfo.hero[j]);
                const bIndex = heroData.findIndex((e: any) => e.id == data4[i].BInfo.hero[j]);
                heroData[aIndex].count++;
                heroData[bIndex].count++;
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
                    } else {
                        heroData[aHeroIndex].bai++;
                        heroData[bHeroIndex].sheng++;
                    }
                }
            }
        }
        return heroData;
    }
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
            let originalData = res.data.data;
            let data4 = originalData.filter((e: any) => {
                return e.no % 100 >= 1 && e.no % 100 <= 4;
            });
            let data8 = originalData.filter((e: any) => {
                return e.no % 100 >= 1 && e.no % 100 <= 8;
            });
            let heroData: any = heroTable.map((e: any) => {
                return {
                    id: e.id,
                    name: e.name,
                    count: 0,
                    sheng: 0,
                    bai: 0
                };
            });
            for (let i = 0; i < data4.length; i++) {
                for (let j = 0; j < 4; j++) {
                    const aIndex = heroData.findIndex((e: any) => e.id == data4[i].AInfo.hero[j]);
                    const bIndex = heroData.findIndex((e: any) => e.id == data4[i].BInfo.hero[j]);
                    heroData[aIndex].count++;
                    heroData[bIndex].count++;
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
                        } else {
                            heroData[aHeroIndex].bai++;
                            heroData[bHeroIndex].sheng++;
                        }
                    }
                }
            }
            const data1 = JSON.parse(JSON.stringify(heroData));
            const data0 = await getList0();
            let data2 = [];
            for (let i = 0; i < data1.length; i++) {
                const obj = data0.find((e: any) => e.id == data1[i].id);
                data2.push({
                    id: data1[i].id,
                    name: data1[i].name,
                    now: [data1[i].count, data1[i].sheng + data1[i].bai != 0 ? (data1[i].sheng / (data1[i].sheng + data1[i].bai)) * 100 : 0],
                    last: [obj.count, obj.sheng + obj.bai != 0 ? (obj.sheng / (obj.sheng + obj.bai)) * 100 : 0],
                    sort: data1[i].count - obj.count
                });
            }
            data2.sort((a, b) => b.sort - a.sort);
            data.value = data2;
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
