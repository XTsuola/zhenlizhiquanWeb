<template>
    <div class="search">
        <div class="search_btn">
            <div>
                <a-button @click="goBack">返回</a-button>
                <a-button style="margin-left: 8px;" type="primary" @click="add"
                    :disabled="gameType != '10'">新增对局</a-button>
            </div>
            <div>
                <a-button style="margin-left: auto;" type="primary" danger @click="analysis">数据分析</a-button>
            </div>
        </div>
    </div>
    <div class="header">
        第{{ gameType }}届世界赛
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :loading="tableLoading"
            :pagination="{ pageSize: pageSize, currentPage: currentPage, total: total }" @detail="showModal"
            @edit="showModal" @delete="deleteOk" @change-page="changePage">
        </MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
        <Detail :detailData="detailData"></Detail>
        <template #footer>
            <a-button key="back" @click="cancel">关闭</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { zhanquList, changciList } from "@/utils/func";
import { shijiesaiDelete, shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import Detail from "../model/detaiHero.vue";

declare var window: any;

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
const loading = ref(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(200);
const total = ref<number>(0);
const detailData = reactive({
    name: "",
    quality: "",
    zhu: "",
    fu: "",
    skillName: "",
    img: "",
    data: []
});
const visible = ref(false);
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "战区",
        dataIndex: "zhanqu",
        key: "zhanqu",
        width: 100,
    },
    {
        title: "场次",
        dataIndex: "changci",
        key: "changci",
        width: 100
    }
]);
const isAdmin = sessionStorage.getItem("isAdmin");
if (isAdmin) {
    columns.value.push({
        title: "操作",
        key: "action",
        list: ["detail", "edit", "delete"],
        width: 50
    });
} else {
    columns.value.push({
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 50
    });
}

async function getList() {
    tableLoading.value = true;
    const params: ShijiesaiInfoListType = {
        pageSize: pageSize.value,
        pageNo: currentPage.value,
        gameType: parseInt(gameType as string)
    };
    const res = await shijiesaiInfoList(params);
    if (res.status == 200) {
        let originalData = res.data.data;
        total.value = res.data.total;
        data.value = originalData.map((e: any) => {
            let zhanquNo = Math.floor(e.no / 100) * 100 - (parseInt(gameType as string) - 7) * 10000, changciNo = e.no % 100;
            return {
                ...e,
                zhanqu: zhanquList.find((v: any) => v.value == zhanquNo)?.label,
                changci: changciList.find((v: any) => v.value == changciNo)?.label
            }
        });
    }
    tableLoading.value = false;
}

function goBack() {
    router.push("/gameMenu");
}

function add() {
    window.open("#/gameAdd", '_blank');
}

function showModal(type: number, record: any) {
    sessionStorage.setItem("changciInfo", JSON.stringify(record));
    if (type == 3) {
        window.open("#/gameDetail", '_blank');
    } else if (type == 2) {
        window.open("#/gameUpdate", '_blank');
    }
}

function changePage(page: number, size: number) {
    pageSize.value = size;
    currentPage.value = page;
    getList();
}

async function deleteOk(id: number) {
    loading.value = true;
    const res = await shijiesaiDelete(id);
    if (res.data.code == 200) {
        message.success("删除成功");
    } else {
        message.error("失败");
    }
    if (data.value.length == 1) {
        currentPage.value--;
    }
    getList();
    loading.value = false;
}

function cancel() {
    visible.value = false;
}

function analysis() {
    router.push("/gameAnalysisList");
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

    .search_input {
        width: 40%;
        margin-right: 10px;
    }

    .search_select {
        width: 40%;
        margin-right: 10px;
    }

    .search_btn {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

}

.header {
    padding-left: 10px;
    margin-bottom: 10px;
}
</style>