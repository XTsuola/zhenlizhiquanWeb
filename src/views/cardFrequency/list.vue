<template>
    <div class="card">
        <div class="header">
            <div class="title">
                <div class="bold">{{ heroInfo.name }}-卡牌频率</div>
                <div>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
            <div class="bottom10">样本数：{{ sourseData.length }}</div>
            <div>提供者：{{sourseData.map((e: any) => e.qu + "-" + e.name).join("、")}}</div>
        </div>
        <MyTabel :columnsData="columns" :rowClass="true" :dataSource="tableData"></MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { gradeData } from "@/data/z_otherData/gradeData";
import { getFrequencyCardsDetail } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const sourseData = ref<any>([]);
const heroInfo: any = JSON.parse(sessionStorage.getItem("heroInfo") as string);
const tableData = ref<any>([]);
const originalData = ref<any>([]);
const columns = ref<any>([
    {
        title: "头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 60,
        scopedSlots: { customRender: "pic" }
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "费用",
        dataIndex: "cost",
        key: "cost",
        width: 80
    },
    {
        title: "次数",
        dataIndex: "count",
        key: "count",
        width: 80
    },
]);

async function getOriginalData() {
    let list: any = [...gradeData.filter((e: any) => e.zhenyin == heroInfo.zhu), ...gradeData.filter((e: any) => e.zhenyin == heroInfo.fu)];
    originalData.value = list.map((e: any) => {
        return {
            name: e.name,
            quality: e.quality,
            cost: e.cost,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + e.img,
            zhenyin: e.zhenyin,
            count: 0
        }
    })
    const cnt = new Map();
    for (let i = 0; i < sourseData.value.length; i++) {
        let arr = JSON.parse(sourseData.value[i].cards)
        for (let j = 0; j < arr.length; j++) {
            cnt.set(arr[j].name, (cnt.get(arr[j].name) || 0) + 1);
        }
    }
    for (const [k, c] of cnt.entries()) {
        const ind = originalData.value.findIndex((e: any) => e.name == k);
        originalData.value[ind].count = c;
    }
    originalData.value = originalData.value.filter((e: any) => e.count != 0);
    originalData.value.sort((a: any, b: any) => b.quality - a.quality);
    originalData.value.sort((a: any, b: any) => a.cost - b.cost);
    originalData.value.sort((a: any, b: any) => b.count - a.count);
    tableData.value = originalData.value;
}

function goDetail() {
    router.push("/cardsDetail");
}

function goBack() {
    router.go(-1);
}

async function getCardsDetailList() {
    const res = await getFrequencyCardsDetail(heroInfo.id);
    if (res.data.code == 200) {
        sourseData.value = res.data.data;
        getOriginalData();
    }
}

onMounted(() => {
    getCardsDetailList();
})

</script>
<style lang="less" scoped>
.header {
    padding: 10px;
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.bottom10 {
    margin-bottom: 10px;
}

.right30 {
    margin-right: 30px;
}

.bold {
    font-weight: bold;
}
</style>