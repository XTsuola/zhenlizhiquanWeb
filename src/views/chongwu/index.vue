<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">{{ pageTitle }}</h1>
            <div class="actions">
                <a-button type="primary" @click="goChongwuStar">升星资源</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :loading="tableLoading"
                @detail="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, defineAsyncComponent } from "vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const Detail = defineAsyncComponent(() => import("../model/detailChongwu.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "chongwuImg";
const chongwuParams = readParams();
const pageTitle = computed(() => `${chongwuParams.name_cn || "近卫"}-近卫列表`);
const tableLoading = ref(false);
const detailData = reactive({
    zhenyin: "",
    name: "",
    quality: 0,
    img: "",
    level: [] as any[],
    qualityList: [] as any[],
    skillList: [] as any[]
});
const visible = ref(false);
const data = ref<any[]>([]);
const columns = [
    { title: "头像", dataIndex: "headImg", key: "headImg", width: 64 },
    { title: "名称", dataIndex: "name", key: "name" },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 72
    }
];

function readParams() {
    try {
        return JSON.parse(sessionStorage.getItem("chongwuParams") || "{}");
    } catch {
        return {};
    }
}


async function getList() {
    tableLoading.value = true;
    try {
        const params = readParams();
        const { chongwuData } = await import("@/data/chongwuData/all");
        data.value = chongwuData
            .filter((item: any) => item.zhenyin === params.id)
            .map((item: any) => ({
                ...item,
                img: IMG_PREFIX + item.img
            }));
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.quality = record.quality;
    detailData.img = record.img;
    detailData.level = record.level;
    detailData.qualityList = record.qualityList;
    detailData.skillList = record.skillList;
    visible.value = true;
}

function cancel() {
    visible.value = false;
}

function goChongwuStar() {
    router.push("/chongwuStar");
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
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
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
