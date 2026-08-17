<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ gameType }}届世界赛</h1>
            <div class="actions">
                <a-button type="primary" :disabled="gameType != '11'" @click="add">新增对局</a-button>
                <a-button type="primary" danger @click="analysis">数据分析</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel
                :columnsData="columns"
                :dataSource="data"
                :rowClass="true"
                :loading="tableLoading"
                :pagination="{ pageSize, currentPage, total }"
                @detail="showModal"
                @edit="showModal"
                @delete="deleteOk"
                @change-page="changePage"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { zhanquList, changciList } from "@/utils/func";
import { shijiesaiDelete, shijiesaiInfoList, type ShijiesaiInfoListType } from "@/api/shijiesai";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const gameType = sessionStorage.getItem("gameType");
import { isSuperAdmin } from "@/utils/admin";
const isAdmin = isSuperAdmin();
const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(200);
const total = ref(0);
const data = ref<any[]>([]);

const columns = [
    { title: "战区", dataIndex: "zhanqu", key: "zhanqu", ellipsis: true, minWidth: 96 },
    { title: "场次", dataIndex: "changci", key: "changci", ellipsis: true, minWidth: 120 },
    {
        title: "操作",
        key: "action",
        list: isAdmin ? ["detail", "edit", "delete"] : ["detail"],
        width: isAdmin ? 160 : 72,
        fixed: "right",
        align: "center"
    }
];

async function getList() {
    tableLoading.value = true;
    try {
        const params: ShijiesaiInfoListType = {
            pageSize: pageSize.value,
            pageNo: currentPage.value,
            gameType: parseInt(gameType as string)
        };
        const res = await shijiesaiInfoList(params);
        if (res.status == 200) {
            total.value = res.data.total;
            const gt = parseInt(gameType as string);
            data.value = res.data.data.map((e: any) => {
                const zhanquNo = Math.floor(e.no / 100) * 100 - (gt - 7) * 10000;
                const changciNo = e.no % 100;
                return {
                    ...e,
                    zhanqu: zhanquList.find((v) => v.value == zhanquNo)?.label,
                    changci: changciList.find((v) => v.value == changciNo)?.label
                };
            });
        }
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.push("/gameMenu");
}

function add() {
    window.open("#/gameAdd", "_blank");
}

function showModal(type: number, record: any) {
    sessionStorage.setItem("changciInfo", JSON.stringify(record));
    if (type == 3) window.open("#/gameDetail", "_blank");
    else if (type == 2) window.open("#/gameUpdate", "_blank");
}

function changePage(page: number, size: number) {
    pageSize.value = size;
    currentPage.value = page;
    getList();
}

async function deleteOk(id: number) {
    const res = await shijiesaiDelete(id);
    if (res.data.code == 200) message.success("删除成功");
    else message.error("删除失败");
    if (data.value.length == 1 && currentPage.value > 1) currentPage.value--;
    getList();
}

function analysis() {
    router.push("/gameAnalysisList");
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
    flex-wrap: wrap;
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
}

.table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
