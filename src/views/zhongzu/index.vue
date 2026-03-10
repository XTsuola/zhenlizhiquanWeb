<template>
    <div class="search">
        <div class="search_select">
            <a-select v-model:value="formState.quality" style="width: 100%;" placeholder="请选择品质">
                <a-select-option v-for="item in cardQualityList" :key="item.value" :value="item.value">{{
                    item.label
                }}</a-select-option>
            </a-select>
        </div>
        <div class="search_select">
            <a-select v-model:value="formState.cost" style="width: 100%;" placeholder="请选择费用">
                <a-select-option v-for="item in costList" :key="item.value" :value="item.value">{{
                    item.label
                }}</a-select-option>
            </a-select>
        </div>
    </div>
    <div class="search">
        <div class="search_input">
            <a-input style="width: 100%;" v-model:value="formState.name" placeholder="请输入名称" />
        </div>
        <div class="search_input">
            <a-input-number style="width: 100%;" v-model:value="formState.level" :precision="0" :min=1 :max="22"
                placeholder="等级模式" />
        </div>
    </div>
    <div class="search">
        <div class="search_btn">
            <a-button style="margin-right: 12px;" type="primary" @click="search">查询</a-button>
            <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" :loading="tableLoading"></MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
        <Detail :detailData="detailData" :level="formState.level"></Detail>
        <template #footer>
            <a-button key="back" @click="cancel">关闭</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { cardQualityList, costList } from "@/utils/func";
import { getCardList } from "@/api/card";
import router from "@/router";
import Detail from "../model/detailCard.vue";
import MyTabel from "@/components/table.vue";

const tableLoading = ref(false);
const originalData = ref([]);
const formState = reactive({
    name: "",
    level: undefined,
    quality: undefined,
    cost: undefined
});
const detailData = reactive({
    id: "",
    zhenyin: "",
    name: '',
    quality: '',
    cost: null,
    type: null,
    img: '',
    grade: '',
    data: []
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

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    if (formState.name) {
        allData = allData.filter((item: any) => item.name.includes(formState.name));
    }
    if (formState.quality) {
        allData = allData.filter((item: any) => item.quality == formState.quality);
    }
    console.log(formState.cost, "888")
    if (formState.cost != undefined && formState.cost !== "") {
        console.log(formState.cost, "999")
        allData = allData.filter((item: any) => item.cost == formState.cost);
    }
    for (let i = 0; i < allData.length; i++) {
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "cardImg" + allData[i].img;
    }
    data.value = allData;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.quality = formState.cost = formState.level = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    visible.value = true;
    detailData.id = record.id;
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.quality = record.quality;
    detailData.cost = record.cost;
    detailData.type = record.type;
    detailData.img = record.img;
    detailData.grade = record.grade;
    detailData.data = record.data;
}

function cancel() {
    visible.value = false;
}

async function getOriginalData() {
    tableLoading.value = true;
    const zhenyin = parseInt(sessionStorage.getItem("zhenyin") as string);
    const res = await getCardList(zhenyin);
    if (res.status == 200) {
        originalData.value = res.data.data;
    }
    tableLoading.value = false;
    getList();
}

onMounted(() => {
    getOriginalData();
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
        justify-content: flex-start;
        width: 40%;
    }
}
</style>