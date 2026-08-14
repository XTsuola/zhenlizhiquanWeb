<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">查询日志</h1>
                <p class="subtitle">共 {{ data.length }} 条记录</p>
            </div>
            <div class="actions">
                <a-button :loading="tableLoading" @click="getList">刷新</a-button>
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
    { title: "序号", dataIndex: "index", key: "index", width: 64, align: "center" },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 140 },
    { title: "时间", dataIndex: "timeText", key: "timeText", width: 180 }
];

function formatTime(value: unknown) {
    if (value == null || value === "") return "-";
    const d = new Date(value as string | number | Date);
    if (Number.isNaN(d.getTime())) return String(value);
    return formatDate(d);
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await logList();
        if (res.data.code == 200) {
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            data.value = list
                .slice()
                .sort((a: any, b: any) => {
                    const ta = new Date(a.time).getTime();
                    const tb = new Date(b.time).getTime();
                    if (Number.isNaN(tb) && Number.isNaN(ta)) return 0;
                    if (Number.isNaN(tb)) return -1;
                    if (Number.isNaN(ta)) return 1;
                    return tb - ta;
                })
                .map((item: any) => ({
                    ...item,
                    timeText: formatTime(item.time)
                }));
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
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
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
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 880px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }
}
</style>
