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
            <a-select v-model:value="formState.tag" style="width: calc(200% + 10px)" mode="multiple"
                placeholder="请选择标签">
                <a-select-option v-for="item in tabList" :key="item.value" :value="item.value">{{
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
                <a-button style="margin-right: 8px;" :type="showFlag ? 'default' : 'primary'" @click="showOrder"
                    :disabled="tableLoading">{{
                        showText }}</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal2" @tag="showModal"
            :loading="tableLoading">
        </MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="卡牌标签" :maskClosable="false">
        <div style="margin-bottom: 10px;">卡牌名称：{{ editData.name }}</div>
        <div style="margin-bottom: 10px;">
            <div style="margin-bottom: 10px;">添加标签：<a-button size="small" @click="clearTab">清空</a-button></div
                style="margin-bottom: 10px;">
            <a-checkbox-group v-model:value="editData.tag" name="checkboxgroup" :options="tabList" />
            <!-- <a-radio-group v-model:value="editData.grade">
                <a-radio class="myRadio" :value="6">
                    <a-tag :color="getGradeColor(6)">{{ getGradeName(6) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="5">
                    <a-tag :color="getGradeColor(5)">{{ getGradeName(5) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="4">
                    <a-tag :color="getGradeColor(4)">{{ getGradeName(4) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="3">
                    <a-tag :color="getGradeColor(3)">{{ getGradeName(3) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="2">
                    <a-tag :color="getGradeColor(2)">{{ getGradeName(2) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="1">
                    <a-tag :color="getGradeColor(1)">{{ getGradeName(1) }}</a-tag>
                </a-radio>
                <a-radio class="myRadio" :value="0">
                    <a-tag :color="getGradeColor(0)">{{ getGradeName(0) }}</a-tag>
                </a-radio>
            </a-radio-group> -->
            <!--  <div style="height: 400px;padding-left: 70px;padding-top: 20px;">
                <a-slider v-model:value="editData.grade" :marks="marks" range :min="0" :max="5" :step="1" vertical>
                    <template #mark="{ label }">
                        {{ label }}
                    </template>
</a-slider>
</div> -->
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
import { cardZhenyinList, costList, cardQualityList, tabList, allValuesInArray } from "@/utils/func";
import { getAllCardList, updateCardTag, type UpdateCardTagType } from "@/api/card";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import Detail from "../model/detailCard.vue";

const tableLoading = ref(false);
const isAdmin = sessionStorage.getItem("isAdmin");
const showFlag = ref(false);
const showText = ref("显示详情");
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
    tag: [],
    id: 0
});
const originalData = ref([]);
const formState = reactive<any>({
    name: "",
    tag: undefined,
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
        scopedSlots: { customRender: "pic" },
        width: 70
    },
    {
        title: "标签",
        dataIndex: "tag",
        key: "tag"
    }
];
const columns = ref<any>();
columns.value = originalColumns;
if (isAdmin) {
    columns.value.push({
        title: "操作",
        key: "action",
        list: ["tag"]
    });
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
    formState.tag = formState.zhenyin = formState.cost = formState.quality = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(record: any) {
    visible.value = true;
    editData.id = record.id;
    editData.name = record.name;
    editData.tag = record.tag;
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
        showText.value = "关闭详情";
        columns.value = [
            {
                title: "头像",
                dataIndex: "headImg2",
                key: "headImg2",
                scopedSlots: { customRender: "pic" },
                width: 70
            },
            {
                title: "名称",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "标签",
                dataIndex: "tag",
                key: "tag"
            }
        ];
    } else {
        showText.value = "显示详情";
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
    const params: UpdateCardTagType = {
        id: editData.id,
        tag: editData.tag
    };
    const res = await updateCardTag(params);
    if (res.data.code == 200) {
        data.value.find((e: any) => e.id == editData.id).tag = editData.tag;
        message.success("操作成功");
        visible.value = false;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getAllCardList();
    if (res.status == 200) {
        const isAdmin = sessionStorage.getItem("isAdmin");
        if (isAdmin) {
            originalData.value = res.data.data;
        } else {
            originalData.value = res.data.data.filter((e: any) => e.type != 4);
        }
    }
    tableLoading.value = false;
    getList();
}

function clearTab() {
    editData.tag = [];
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