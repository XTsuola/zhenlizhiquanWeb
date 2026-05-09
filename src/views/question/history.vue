<template>
    <div class="questionAdmin">
        <div class="header">
            <div class="title">
                <div class="bold">历史问题回顾</div>
                <div>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData"></MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getQuestionList } from "@/api/question";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const columns = ref<any>([
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
    },
    {
        title: "题目",
        dataIndex: "info",
        key: "info"
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 180
    },
]);
const tableData = ref<any>([]);

async function getList() {
    const res = await getQuestionList();
    if (res.data.code == 200) {
        tableData.value = res.data.data;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getList();
})

</script>
<style lang="less" scoped>
.questionAdmin {
    .header {
        padding: 10px;

        .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>