<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">查询日志</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :loading="tableLoading" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { formatDate } from "@/utils/func";
import { logList } from "@/api/log";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const tableLoading = ref(false);
const data = ref<any[]>([]);
const columns = [
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        minWidth: 120
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 168,
        customRender: (opt: any) => formatDate(opt.value, "-")
    }
];

async function getList() {
    tableLoading.value = true;
    try {
        const res = await logList();
        if (res.data.code == 200) {
            data.value = res.data.data;
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
