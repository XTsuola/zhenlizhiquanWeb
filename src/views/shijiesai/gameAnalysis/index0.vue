<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">所有比赛有效数据表</h1>
            <div class="actions">
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
                        <tr v-for="item in data" :key="item.id">
                            <td class="name">
                                <HeroCell :name="item.name" :img="item.img" :zhu="item.zhu" :fu="item.fu" />
                            </td>
                            <td class="num">{{ item.sheng }}</td>
                            <td class="num">{{ item.bai }}</td>
                            <td class="num">{{ item.shenglv }}</td>
                        </tr>
                    </tbody>
                </table>
            </a-spin>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiData } from "@/data/shijiesaiData/all";
import router from "@/router";
import HeroCell from "./heroCell.vue";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const data = ref<any>([]);

function getList() {
    tableLoading.value = true;
    try {
        const gt = parseInt(gameType as string);
        const originalData = shijiesaiData.filter((e: any) => Math.floor(e.no / 10000) === gt);
        let data8 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 8;
        });
        let heroData: any = heroTable.map((e: any) => {
            return {
                id: e.id,
                name: e.name,
                img: IMG_PREFIX + e.img,
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
                if (n != 1 && n != 2) continue;
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
        for (let i = 0; i < heroData.length; i++) {
            const games = heroData[i].sheng + heroData[i].bai;
            const rate = games ? heroData[i].sheng / games : 0;
            heroData[i]._shenglv = rate;
            heroData[i].shenglv = `${(rate * 100).toFixed(2)}%`;
        }
        heroData.sort((a: any, b: any) => b._shenglv - a._shenglv || b.sheng + b.bai - (a.sheng + a.bai));
        data.value = heroData;
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
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
}

.rate-table td.name {
    white-space: normal;
}

.rate-table .num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
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
