<template>
    <div class="search">
        <div class="search_input">
            <a-input v-model:value="formState.name" placeholder="请输入名称" />
        </div>
        <div class="search_btn">
            <a-button style="margin-right: 8px;" type="primary" @click="search">查询</a-button>
            <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" @frequency="goFrequency"></MyTabel>
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
import { getHeroList } from "@/api/hero";
import { getFrequencyCardsAll } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import Detail from "../model/detaiHero.vue";

interface HeroInfoType {
    id: number
    name: string
    zhu: number
    fu: number
}

const originalData = ref<any>([]);
const cardsData = ref<any>([]);
const formState = reactive({
    name: ""
});
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
        title: "头像",
        dataIndex: "headImg3",
        key: "headImg3",
        width: 50,
        scopedSlots: { customRender: "pic" }
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160,
    },
    {
        title: "操作",
        key: "action",
        list: ["skill", "frequency"],
        width: 80
    }
]);

async function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    const res = await getFrequencyCardsAll();
    if (res.data.code == 200) {
        cardsData.value = res.data.data;
    }
    if (formState.name) allData = allData.filter((item: any) => item.name.includes(formState.name));
    for (let i = 0; i < allData.length; i++) {
        allData[i].cardsCount = cardsData.value.filter((e: any) => e.heroId == allData[i].id).length;
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "heroImg" + allData[i].img;
    }
    allData.sort((a: any, b: any) => b.cardsCount - a.cardsCount);
    data.value = allData;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    visible.value = true;
    detailData.name = record.name;
    detailData.quality = record.quality;
    detailData.zhu = record.zhu;
    detailData.fu = record.fu;
    detailData.skillName = record.skillName;
    detailData.img = record.img;
    detailData.data = record.data;
}

function goFrequency(record: any) {
    const params: HeroInfoType = {
        id: record.id,
        name: record.name,
        zhu: record.zhu,
        fu: record.fu
    }
    sessionStorage.setItem("heroInfo", JSON.stringify(params));
    router.push("/cardsDetail");
}

function cancel() {
    visible.value = false;
}

async function getOriginalData() {
    const res = await getHeroList();
    if (res.status == 200) {
        originalData.value = res.data.data;
    }
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