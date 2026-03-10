<template>
    <div class="search">
        <div class="search_btn">
            <div class="bold">{{ chongwuParams.name_cn }}-近卫列表</div>
            <div>
                <a-button style="margin-right: 15px;" type="primary" @click="goChongwuStar">升星资源</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal"></MyTabel>
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
import { chongwuData as data1 } from "@/data/chongwuData/simangdiguo";
import { chongwuData as data2 } from "@/data/chongwuData/yinmizhe";
import { chongwuData as data3 } from "@/data/chongwuData/chanyigu";
import { chongwuData as data4 } from "@/data/chongwuData/tiantanggang";
import { chongwuData as data5 } from "@/data/chongwuData/lianyushenyuan";
import { chongwuData as data6 } from "@/data/chongwuData/manshikuangye";
import { chongwuData as data7 } from "@/data/chongwuData/dongshenshitu";
import router from "@/router";
import Detail from "../model/detailChongwu.vue";
import MyTabel from "@/components/table.vue";

const chongwuParams = JSON.parse(sessionStorage.getItem("chongwuParams") as string);
const dataList = [data1, data2, data3, data4, data5, data6, data7];
const detailData = reactive({
    zhenyin: "",
    name: "",
    quality: 0,
    img: "",
    level: [],
    qualityList: [],
    skillList: []
});
const visible = ref(false);
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 50,
        scopedSlots: { customRender: "pic" }
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 50
    },
]);

async function getList() {
    const chongwuData = dataList[chongwuParams.id - 1];
    data.value = JSON.parse(JSON.stringify(chongwuData));
    for (let i = 0; i < data.value.length; i++) {
        data.value[i].img = import.meta.env.VITE_APP_BASE_URL + "chongwuImg" + data.value[i].img;
    }
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    visible.value = true;
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.quality = record.quality;
    detailData.img = record.img;
    detailData.level = record.level;
    detailData.qualityList = record.qualityList;
    detailData.skillList = record.skillList;
}

function cancel() {
    visible.value = false;
}

function goChongwuStar() {
    router.push("/chongwuStar");
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

    .search_btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .bold {
        font-weight: bold;
    }
}
</style>