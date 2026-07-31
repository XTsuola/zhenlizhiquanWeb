<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">答案管理</h1>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getAnswerAllList } from "@/api/question";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const tableLoading = ref(false);
const tableData = ref<any[]>([]);
const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 64, align: "center" },
    { title: "题目ID", dataIndex: "questionId", key: "questionId", width: 80, align: "center" },
    { title: "昵称", dataIndex: "name", key: "name", width: 96, ellipsis: true },
    { title: "答案", dataIndex: "content", key: "content", ellipsis: true, minWidth: 120 },
    { title: "时间", dataIndex: "time", key: "time", width: 150, ellipsis: true }
];

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getAnswerAllList();
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
