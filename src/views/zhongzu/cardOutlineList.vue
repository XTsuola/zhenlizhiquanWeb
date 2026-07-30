<template>
    <div class="search">
        <div class="search_select">
            <a-select v-model:value="formState.zhenyin" style="width: 100%;" placeholder="请选择种族">
                <a-select-option v-for="item in cardZhenyinList" :key="item.value" :value="item.value">{{
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
        <div class="search_select">
            <a-select v-model:value="formState.quality" style="width: 100%;" placeholder="请选择品质">
                <a-select-option v-for="item in cardQualityList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
        <div class="search_input">
            <a-input v-model:value="formState.name" placeholder="请输入名称" />
        </div>
    </div>
    <div class="search">
        <div class="search_select">
            <a-select v-model:value="formState.tag" style="width: 100%" mode="multiple" placeholder="请选择标签">
                <a-select-option v-for="item in tabList" :key="item.value" :value="item.value">{{
                    item.label
                }}</a-select-option>
            </a-select>
        </div>
        <div class="search_select">
            <a-select v-model:value="formState.type" style="width: 100%;" placeholder="请选择类型">
                <a-select-option v-for="item in cardTypeList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
    </div>
    <div class="search">
        <div class="search_div">
            <div class="search_btn">
                <a-button style="margin-right: 12px;" type="primary" @click="search">查询</a-button>
                <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
            <div>
                <a-button style="margin-right: 8px;" :type="showFlag == 2 ? 'default' : 'primary'" @click="showTag"
                    :disabled="tableLoading">{{
                        showTagText }}</a-button>
                <a-button style="margin-right: 8px;" :type="showFlag == 1 ? 'default' : 'primary'" @click="showOrder"
                    :disabled="tableLoading">{{
                        showSortText }}</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" :loading="tableLoading">
        </MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
        <Detail :detailData="detailData"></Detail>
        <template #footer>
            <a-button key="back" @click="visible = false">关闭</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { gradeData } from "@/data/z_otherData/gradeData.js";
import { cardZhenyinList, costList, cardQualityList, tabList, allValuesInArray } from "@/utils/func";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import Detail from "../model/detailCard.vue";

const tableLoading = ref(false);
const cardTypeList = [{
    label: "全部",
    value: ""
}, {
    label: "部下",
    value: 1
}, {
    label: "法术",
    value: 2
}, {
    label: "传记",
    value: 3
}, {
    label: "符文",
    value: 4
}];
const showFlag = ref(0);
const showTagText = ref("标签");
const showSortText = ref("排序");
const detailData = reactive({
    id: 0,
    zhenyin: "",
    name: "",
    quality: "",
    cost: null,
    type: null,
    img: "",
    grade: "",
    data: []
});
const originalData = ref<any>([]);
const formState = reactive({
    name: "",
    tag: undefined,
    zhenyin: undefined,
    cost: undefined,
    quality: undefined,
    type: undefined
});
const visible = ref(false);
const data = ref<any>([]);
let originalColumns = [
    {
        title: "头像",
        dataIndex: "headImg2",
        key: "headImg2",
        scopedSlots: { customRender: "pic" }
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name"
    }
];
const columns = ref<any>();
columns.value = originalColumns;

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    if (formState.name) {
        allData = allData.filter((item: any) => item.name.includes(formState.name));
    }
    if (formState.zhenyin) {
        allData = allData.filter((item: any) => item.zhenyin == formState.zhenyin);
    }
    if (formState.cost != undefined && formState.cost !== "") {
        allData = allData.filter((item: any) => item.cost == formState.cost);
    }
    if (formState.quality != undefined && formState.quality != "") {
        allData = allData.filter((item: any) => item.quality == formState.quality);
    }
    if (formState.type != undefined && formState.type != "") {
        allData = allData.filter((item: any) => item.type == formState.type);
    }
    if (formState.tag) {
        const arr1 = formState.tag ? formState.tag : [];
        allData = allData.filter((item: any) => {
            const arr2 = item.tag ? JSON.parse(item.tag) : [];
            return allValuesInArray(arr1, arr2);
        })
    }
    for (let i = 0; i < allData.length; i++) {
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "cardImg" + allData[i].img;
        allData[i].tag = allData[i].tag ? JSON.parse(allData[i].tag) : [];
        allData[i].att = allData[i].data.at(-1).attack;
        allData[i].life = allData[i].data.at(-1).life;
    }
    data.value = allData;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.zhenyin = formState.cost = formState.quality = formState.type = undefined;
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

function showTag() {
    if (showFlag.value != 2) {
        showFlag.value = 2;
        showTagText.value = "关闭";
        showSortText.value = "排序";
        columns.value = [
            {
                title: "头像",
                dataIndex: "headImg2",
                key: "headImg2",
                scopedSlots: { customRender: "pic" },
                width: 70
            },
            {
                title: "标签",
                dataIndex: "tag",
                key: "tag"
            }
        ];
    } else {
        showFlag.value = 0;
        showTagText.value = "标签";
        columns.value = originalColumns;
    }
}

function showOrder() {
    if (showFlag.value != 1) {
        showFlag.value = 1;
        showSortText.value = "关闭";
        showTagText.value = "标签";
        columns.value = [
            {
                title: "头像",
                dataIndex: "headImg2",
                key: "headImg2",
                scopedSlots: { customRender: "pic" }
            },
            {
                title: "名称",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "att",
                dataIndex: "att",
                key: "att",
                sorter: (a: any, b: any) => {
                    return a.att - b.att
                }
            },
            {
                title: "lif",
                dataIndex: "life",
                key: "life",
                sorter: (a: any, b: any) => {
                    return a.life - b.life
                }
            }
        ];
    } else {
        showFlag.value = 0;
        showSortText.value = "排序";
        columns.value = originalColumns;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    originalData.value = JSON.parse(JSON.stringify(gradeData));
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

    .search_div {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .search_btn {
        display: flex;
        justify-content: flex-start;
        width: 40%;
    }
}

.myRadio {
    display: 'flex';
    height: '30px';
    line-height: '30px';
    width: 100%;
    margin: 10px 0;
}

.tagBg {
    margin: 0;
    width: 60px;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    border-radius: 4px;
    background: linear-gradient(45deg,
            #111,
            #AA8B3B,
            #FFD700,
            #FF6B35,
            #E6B325,
            #C8A951,
            #111);
    background-size: 600% 600%;
    animation: colorGold 10s ease infinite;
}

@keyframes colorGold {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}
</style>