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
        <div class="search_div">
            <div class="search_btn">
                <a-button style="margin-right: 12px;" type="primary" @click="search">查询</a-button>
                <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
            <div>
                <a-button style="margin-right: 8px;" :type="showFlag ? 'default' : 'primary'" @click="showOrder"
                    :disabled="tableLoading">{{
                        showText }}</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal2" @grade="showModal"
            :loading="tableLoading">
        </MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="卡牌评级" :maskClosable="false">
        <div style="margin-bottom: 10px;">卡牌名称：{{ editData.name }}</div>
        <div style="margin-bottom: 10px;">
            <span>选择评级：</span>
            <a-radio-group v-model:value="editData.grade">
                <a-radio v-for="i in 7" class="myRadio" :value="7 - i">
                    <a-tag :color="getGradeColor(7 - i)">{{ getGradeName(7 - i) }}</a-tag>
                </a-radio>
            </a-radio-group>
        </div>
        <template #footer>
            <a-button style="margin-right: 10px;" key="back" @click="cancel">关闭</a-button>
            <a-button key="ok" type="primary" @click="ok">确定</a-button>
        </template>
    </a-modal>
    <a-modal v-model:open="visible2" destroyOnClose title="详细信息" :maskClosable="false">
        <Detail :detailData="detailData"></Detail>
        <template #footer>
            <a-button key="back" @click="cancel2">关闭</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { cardZhenyinList, costList, cardQualityList } from "@/utils/func";
import { getAllCardList, updateCardGrade, type UpdateCardGradeType } from "@/api/card";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import Detail from "../model/detailCard.vue";

const tableLoading = ref(false);
const gradeList = [{
    label: "SS真神",
    value: 6,
    color: "#000000"
}, {
    label: "S顶级",
    value: 5,
    color: "#ff0000"
}, {
    label: "A+超级",
    value: 4,
    color: "#ff6633"
}, {
    label: "A高级",
    value: 3,
    color: "#ff6633"
}, {
    label: "B能带",
    value: 2,
    color: "#8e488e"
}, {
    label: "C普通",
    value: 1,
    color: "#2db7f5"
}, {
    label: "D垃圾",
    value: 0,
    color: "#87d068"
}];
const isAdmin = sessionStorage.getItem("isAdmin");
const showFlag = ref(false);
const showText = ref("显示排序");
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
const editData = reactive({
    name: "",
    grade: 0,
    id: 0
});
const originalData = ref([]);
const formState = reactive({
    name: "",
    zhenyin: undefined,
    cost: undefined,
    quality: undefined
});
const visible = ref(false);
const visible2 = ref(false);
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
    },
    {
        title: "评级",
        dataIndex: "grade",
        key: "grade"
    }
];
const columns = ref<any>();
columns.value = originalColumns;
if (isAdmin) {
    columns.value.push({
        title: "操作",
        key: "action",
        list: ["grade"]
    });
}

function getGradeName(grade: number) {
    return gradeList.find(e => e.value == grade)?.label;
}

function getGradeColor(grade: number) {
    return gradeList.find(e => e.value == grade)?.color;
}

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
    for (let i = 0; i < allData.length; i++) {
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "cardImg" + allData[i].img;
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
    formState.zhenyin = formState.cost = formState.quality = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(record: any) {
    visible.value = true;
    editData.id = record.id;
    editData.name = record.name;
    editData.grade = JSON.parse(record.grade)[0];
}

function showModal2(_: number, record: any) {
    visible2.value = true;
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

function showOrder() {
    if (!showFlag.value) {
        showText.value = "关闭排序";
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
            },
            {
                title: "评级",
                dataIndex: "grade",
                key: "grade",
                sorter: (a: any, b: any) => {
                    let aSort = [-1, -1], bSort = [-1, -1];
                    if (a.grade != "") aSort = JSON.parse(a.grade);
                    if (b.grade != "") bSort = JSON.parse(b.grade);
                    if (aSort[1] == bSort[1]) return aSort[0] - bSort[0];
                    return aSort[1] - bSort[1]
                }
            }
        ];
    } else {
        showText.value = "显示排序";
        columns.value = originalColumns;
    }
    showFlag.value = !showFlag.value;
}

function cancel() {
    visible.value = false;
}

function cancel2() {
    visible2.value = false;
}

async function ok() {
    const params: UpdateCardGradeType = {
        id: editData.id,
        grade: [editData.grade]
    };
    const res = await updateCardGrade(params);
    if (res.data.code == 200) {
        data.value.find((e: any) => e.id == editData.id).grade = JSON.stringify([editData.grade]);
        message.success("操作成功");
        visible.value = false;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getAllCardList();
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
</style>