<template>
    <div class="gameAnalysisZhongzu">
        <div style="margin-bottom: 10px;"><span style="margin-right: 15px;">第{{ title }}届—种族选取表</span><a-button
                size="small" @click="goBack">返回</a-button></div>
        <MyTabel :columnsData="columns" :rowClass="true" :dataSource="data">
        </MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from '@/api/shijiesai';
import MyTabel from "@/components/table.vue";
import router from '@/router';

const gameType = sessionStorage.getItem("gameType");
let zhongzuData: any = [{
    id: 1,
    name: "帝国",
    count1: 0,
    count2: 0
}, {
    id: 2,
    name: "隐秘",
    count1: 0,
    count2: 0
}, {
    id: 3,
    name: "禅意",
    count1: 0,
    count2: 0
}, {
    id: 4,
    name: "港口",
    count1: 0,
    count2: 0
}, {
    id: 5,
    name: "炼狱",
    count1: 0,
    count2: 0
}, {
    id: 6,
    name: "蛮石",
    count1: 0,
    count2: 0
}, {
    id: 7,
    name: "冬神",
    count1: 0,
    count2: 0
}];
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "种族",
        dataIndex: "name",
        key: "name",
        width: 100,
    },
    {
        title: "主",
        dataIndex: "count1",
        key: "count1",
        width: 80
    },
    {
        title: "",
        dataIndex: "count1",
        key: "count1",
        width: 100,
        customRender: (opt: any) => {
            return ((opt.value / 480) * 100).toFixed(2) + "%"
        }
    },
    {
        title: "副",
        dataIndex: "count2",
        key: "count2",
        width: 80
    },
    {
        title: "",
        dataIndex: "count2",
        key: "count2",
        width: 100,
        customRender: (opt: any) => {
            return ((opt.value / 480) * 100).toFixed(2) + "%"
        }
    }
]);
const title = ref();
title.value = gameType;

async function getList() {
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
        for (let i = 0; i < data4.length; i++) {
            for (let j = 0; j < 4; j++) {
                const aObj: any = heroTable.find((e: any) => e.id == data4[i].AInfo.hero[j]);
                const bObj: any = heroTable.find((e: any) => e.id == data4[i].BInfo.hero[j]);
                zhongzuData[aObj.zhu - 1].count1++;
                zhongzuData[aObj.fu - 1].count2++;
                zhongzuData[bObj.zhu - 1].count1++;
                zhongzuData[bObj.fu - 1].count2++;
            }
        }
        data.value = zhongzuData;
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
.gameAnalysisZhongzu {
    padding: 20px;
}
</style>