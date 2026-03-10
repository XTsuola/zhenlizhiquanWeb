<template>
    <div class="search">
        <a-button @click="goBack">返回</a-button>
    </div>
    <div>
        <MyTabel :columnsData="columns" :dataSource="data"></MyTabel>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { formatDate } from "@/utils/func";
import { logList } from "@/api/log";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        customRender: (opt: any) => formatDate(opt.value, "-")
    }
]);

async function getList() {
    const res = await logList();
    if (res.data.code == 200) {
        data.value = res.data.data;
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
.search {
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
    padding: 5px 10px;
    margin-bottom: 5px;
}
</style>