<template>
    <div class="answerAdmin">
        <div class="header">
            <div class="title">
                <div class="bold">答案管理</div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData"></MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getAnswerAllList } from "@/api/question";
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
        title: "题目ID",
        dataIndex: "questionId",
        key: "questionId"
    },
    {
        title: "昵称",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "答案",
        dataIndex: "content",
        key: "content"
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
    const res = await getAnswerAllList();
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
.answerAdmin {
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