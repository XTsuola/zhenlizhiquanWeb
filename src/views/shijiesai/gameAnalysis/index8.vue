<template>
    <div class="gameAnalysis8">
        <div style="margin-bottom: 10px;"><span style="margin-right: 15px;">8强有效数据表</span><a-button size="small"
                @click="goBack">返回</a-button></div>
        <MyTabel :columnsData="columns" :rowClass="true" :dataSource="data">
        </MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import MyTabel from "@/components/table.vue";
import router from "@/router";

const gameType = sessionStorage.getItem("gameType");
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 100,
    },
    {
        title: "胜场",
        dataIndex: "sheng",
        key: "sheng",
        width: 100,
    },
    {
        title: "败场",
        dataIndex: "bai",
        key: "bai",
        width: 100,
    },
    {
        title: "胜率",
        dataIndex: "shenglv",
        key: "shenglv",
        width: 100,
        customRender: (opt: any) => {
            return opt.value == 0 ? "0.00%" : (opt.value * 100).toFixed(2) + "%"
        }
    }
]);

async function getList() {
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
                bai: 0,
            }
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
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getList();
})

</script>
<style lang="less" scoped>
.gameAnalysis8 {
    padding: 20px;
}
</style>