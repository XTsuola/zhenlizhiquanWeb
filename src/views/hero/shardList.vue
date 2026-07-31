<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄碎片</h1>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :loading="tableLoading"
                @level="showModal" @star="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="levelTitle" :maskClosable="false"
            :width="isNarrow ? '94%' : 640" centered>
            <a-table :columns="columns2" :data-source="detailData.levelData" :pagination="false" size="middle" bordered
                :scroll="{ x: 'max-content' }" />
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose :title="starTitle" :maskClosable="false"
            :width="isNarrow ? '94%' : 560" centered>
            <a-table :columns="columns3" :data-source="detailData.skillData" :pagination="false" size="middle" bordered
                :scroll="{ x: 'max-content' }" />
            <template #footer>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { getShardList } from "@/api/hero";
import router from "@/router";
import MyTabel from "@/components/table.vue";

interface DetailDataType {
    id: number;
    quality: number;
    levelData: any[];
    skillData: any[];
}

const qualityList = ["白色英雄", "蓝色英雄", "紫色英雄", "橙色英雄"];
const tableLoading = ref(false);
const data = ref<any[]>([]);
const visible = ref(false);
const visible2 = ref(false);
const levelTitle = ref("橙色英雄升级碎片需求");
const starTitle = ref("橙色英雄升星碎片需求");
const isNarrow = ref(window.innerWidth < 576);
const detailData = reactive<DetailDataType>({
    id: 0,
    quality: 0,
    levelData: [],
    skillData: []
});
const columns = [
    {
        title: "品质",
        dataIndex: "quality",
        key: "quality",
        ellipsis: true,
        minWidth: 120,
        customRender: (opt: any) => qualityList[opt.value - 1] || "-"
    },
    {
        title: "操作",
        key: "action",
        list: ["level", "star"],
        width: 120,
        fixed: "right",
        align: "center"
    }
];
const columns2 = [
    { title: "描述", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 88, align: "right" },
    { title: "钻石", dataIndex: "zuanshi", key: "zuanshi", width: 88, align: "right" }
];
const columns3 = [
    { title: "描述", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 88, align: "right" }
];

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function showModal(type: number, record: any) {
    detailData.id = record.id;
    detailData.quality = record.quality;
    if (type == 1) {
        visible.value = true;
        levelTitle.value = (qualityList[record.quality - 1] || "英雄") + "升级碎片需求";
        try {
            detailData.levelData = JSON.parse(record.levelData);
        } catch {
            detailData.levelData = [];
        }
    } else {
        visible2.value = true;
        starTitle.value = (qualityList[record.quality - 1] || "英雄") + "升星碎片需求";
        try {
            detailData.skillData = JSON.parse(record.skillData);
        } catch {
            detailData.skillData = [];
        }
    }
}

function goBack() {
    router.go(-1);
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getShardList();
        if (res.status == 200) {
            data.value = res.data.data;
        }
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
