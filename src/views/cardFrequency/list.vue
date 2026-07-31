<template>
    <div class="page">
        <div class="toolbar">
            <div class="meta">
                <h1 class="title">{{ heroInfo.name }}-卡牌频率</h1>
                <p class="stat">样本数：{{ sourseData.length }}</p>
                <p class="providers">提供者：{{ providerText }}</p>
            </div>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :rowClass="true" :dataSource="tableData" :loading="tableLoading" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { getFrequencyCardsDetail } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
const heroInfo: any = readHeroInfo();
const sourseData = ref<any[]>([]);
const tableData = ref<any[]>([]);
const tableLoading = ref(false);
const providerText = computed(() =>
    sourseData.value.map((e: any) => `${e.qu}-${e.name}`).join("、") || "-"
);
const columns = [
    { title: "头像", dataIndex: "headImg", key: "headImg", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 100 },
    { title: "费用", dataIndex: "cost", key: "cost", width: 64, align: "center" },
    { title: "次数", dataIndex: "count", key: "count", width: 64, align: "center" }
];

function readHeroInfo() {
    try {
        return JSON.parse(sessionStorage.getItem("heroInfo") || "{}");
    } catch {
        return {};
    }
}

async function buildTable() {
    const { gradeData } = await import("@/data/z_otherData/gradeData");
    let list: any[] = [
        ...gradeData.filter((e: any) => e.zhenyin == heroInfo.zhu),
        ...gradeData.filter((e: any) => e.zhenyin == heroInfo.fu)
    ].map((e: any) => ({
        name: e.name,
        quality: e.quality,
        cost: e.cost,
        img: IMG_PREFIX + e.img,
        zhenyin: e.zhenyin,
        count: 0
    }));
    const cnt = new Map<string, number>();
    for (const item of sourseData.value) {
        const arr = JSON.parse(item.cards);
        for (const card of arr) {
            cnt.set(card.name, (cnt.get(card.name) || 0) + 1);
        }
    }
    for (const [name, count] of cnt.entries()) {
        const ind = list.findIndex((e) => e.name == name);
        if (ind !== -1) list[ind].count = count;
    }
    list = list.filter((e) => e.count != 0);
    list.sort((a, b) => b.count - a.count || a.cost - b.cost || b.quality - a.quality);
    tableData.value = list;
}

async function getCardsDetailList() {
    tableLoading.value = true;
    try {
        const res = await getFrequencyCardsDetail(heroInfo.id);
        if (res.data.code == 200) {
            sourseData.value = res.data.data;
            await buildTable();
        }
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getCardsDetailList();
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.meta {
    min-width: 0;
    flex: 1;
}

.title {
    margin: 0 0 8px;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.stat,
.providers {
    margin: 0 0 6px;
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
    word-break: break-all;
}

.providers {
    margin-bottom: 0;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }
}
</style>
