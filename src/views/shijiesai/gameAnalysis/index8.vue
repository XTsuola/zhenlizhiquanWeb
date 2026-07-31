<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">8强有效数据表</h1>
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
        title: "胜场",
        dataIndex: "sheng",
        key: "sheng",
        width: 72,
        align: "center"
    },
    {
        title: "败场",
        dataIndex: "bai",
        key: "bai",
        width: 72,
        align: "center"
    },
    {
        title: "胜率",
        dataIndex: "shenglv",
        key: "shenglv",
        width: 88,
        align: "center",
        customRender: (opt: any) => {
            return opt.value == 0 ? "0.00%" : (opt.value * 100).toFixed(2) + "%";
        }
    }
]);

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
            let data8 = originalData.filter((e: any) => {
                return e.no % 100 >= 1 && e.no % 100 <= 4;
            });
            let heroData: any = heroTable.map((e: any) => {
                return {
                    id: e.id,
                    name: e.name,
                    zhu: e.zhu,
                    fu: e.fu,
                    count: 0,
                    sheng: 0,
                    bai: 0
                };
            });
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
            for (let i = 0; i < heroData.length; i++) {
                heroData[i].shenglv = (heroData[i].sheng + heroData[i].bai) != 0 ? (heroData[i].sheng / (heroData[i].sheng + heroData[i].bai)).toFixed(4) : 0;
            }
            heroData.sort((a: any, b: any) => (b.sheng + b.bai) - (a.sheng + a.bai));
            heroData.sort((a: any, b: any) => b.shenglv - a.shenglv);
            data.value = heroData;
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
