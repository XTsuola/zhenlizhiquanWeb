<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-input v-model:value="formState.name" allow-clear placeholder="名称" class="field"
                    @pressEnter="search" />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :loading="tableLoading"
                @detail="showModal" @frequency="goFrequency" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false"
            :width="isNarrow ? '92%' : 520" centered>
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { getHeroList } from "@/api/hero";
import { getFrequencyCardsAll } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

interface HeroInfoType {
    id: number;
    name: string;
    zhu: number;
    fu: number;
}

const Detail = defineAsyncComponent(() => import("../model/detailHero.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const cardsData = ref<any[]>([]);
const formState = reactive({ name: "" });
const detailData = reactive({
    name: "",
    quality: "",
    zhu: "",
    fu: "",
    skillName: "",
    img: "",
    data: [] as any[]
});
const visible = ref(false);
const data = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const columns = [
    { title: "头像", dataIndex: "headImg3", key: "headImg3", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 120 },
    {
        title: "操作",
        key: "action",
        list: ["skill", "frequency"],
        width: 110,
        fixed: "right",
        align: "center"
    }
];

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        let list = originalData.value;
        const res = await getFrequencyCardsAll();
        if (res.data.code == 200) {
            cardsData.value = res.data.data;
        }
        const name = formState.name.trim();
        if (name) list = list.filter((item) => item.name.includes(name));
        data.value = list
            .map((item) => ({
                ...item,
                cardsCount: cardsData.value.filter((e: any) => e.heroId == item.id).length,
                img: IMG_PREFIX + item.img
            }))
            .sort((a, b) => b.cardsCount - a.cardsCount);
    } finally {
        tableLoading.value = false;
    }
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.quality = record.quality;
    detailData.zhu = record.zhu;
    detailData.fu = record.fu;
    detailData.skillName = record.skillName;
    detailData.img = record.img;
    detailData.data = record.data;
    visible.value = true;
}

function goFrequency(record: any) {
    const params: HeroInfoType = {
        id: record.id,
        name: record.name,
        zhu: record.zhu,
        fu: record.fu
    };
    sessionStorage.setItem("heroInfo", JSON.stringify(params));
    router.push("/cardsDetail");
}

function cancel() {
    visible.value = false;
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getHeroList();
        if (res.status == 200) {
            originalData.value = res.data.data;
        }
        await getList();
    } finally {
        tableLoading.value = false;
    }
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getOriginalData();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
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
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filters {
    margin-bottom: 10px;
}

.field {
    width: 100%;
    max-width: 280px;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
