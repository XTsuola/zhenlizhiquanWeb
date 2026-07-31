<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">历史问题回顾</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getQuestionList } from "@/api/question";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const tableLoading = ref(false);
const tableData = ref<any[]>([]);
const columns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 72,
        align: "center"
    },
    {
        title: "题目",
        dataIndex: "info",
        key: "info",
        ellipsis: true,
        minWidth: 160
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 168
    }
];

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getQuestionList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
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
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.table-wrap {
    width: 100%;
    max-width: 100%;
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
