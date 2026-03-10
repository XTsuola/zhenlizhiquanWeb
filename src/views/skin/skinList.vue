<template>
    <div class="search">
        <div class="search_select">
            <a-select v-model:value="formState.zhenyin" style="width: 100%;" placeholder="请选择种族">
                <a-select-option v-for="item in zhenyinList" :key="item.value" :value="item.value">{{
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
                <a-button style="margin-right: 8px;" :type="showFlag ? 'default' : 'primary'" @click="showTogether">{{
                    showText }}</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" @together="showDetail"
            :loading="tableLoading"></MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
        <Detail :detailData="detailData"></Detail>
        <template #footer>
            <a-button key="back" @click="visible = false">关闭</a-button>
        </template>
    </a-modal>
    <a-modal v-model:open="visible2" destroyOnClose :title="detailData.name + '——皮肤数据'" :maskClosable="false">
        <a-form style="width: 100%;" name="unit">
            <a-form-item>
                <div class="form_div" v-for="(item, index) in addData" :key="'label' + index">
                    <div style="width: calc(100% - 130px)">
                        <h3>{{ index as number + 1 }}->{{ index as number + 2 }}星数据：</h3>
                        <div class="flex_center" style="margin-bottom: 15px;">
                            <span style="width: 130px;">皮肤珠子：</span>
                            <a-input-number style="width: 100%;" v-model:value="item.zhuzi" :precision="0"
                                placeholder="皮肤珠子" addon-after="个" />
                        </div>
                        <div class="flex_center">
                            <span style="width: 130px;">时空精华：</span>
                            <a-input-number style="width: 100%;" v-model:value="item.jinghua" :precision="0"
                                placeholder="时空精华" addon-after="个" />
                        </div>
                    </div>
                    <div class="add_or_reduce">
                        <a-button @click="reduceUnitList(index)"
                            v-if="index == addData.length - 1 && addData.length != 1">-</a-button>
                        <a-button @click="addUnitList()"
                            v-if="index == addData.length - 1 && addData.length < 4">+</a-button>
                    </div>
                </div>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button key="back" @click="visible2 = false">关闭</a-button>
            <a-button key="save" type="primary" @click="save">保存</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { costList } from "@/utils/func";
import { getSkinList, skinTogether } from "@/api/skin";
import router from "@/router";
import Detail from "../model/detailSkin.vue";
import MyTabel from "@/components/table.vue";

const nowID = ref(0);
const tableLoading = ref(false);
const originalData = ref([]);
const showFlag = ref(false);
const showText = ref("参与共创");
const zhenyinList = [{
    label: "全部",
    value: ""
}, {
    label: "帝国",
    value: 1
}, {
    label: "隐秘",
    value: 2
}, {
    label: "禅意",
    value: 3
}, {
    label: "港口",
    value: 4
}, {
    label: "炼狱",
    value: 5
}, {
    label: "蛮石",
    value: 6
}, {
    label: "冬神",
    value: 7
}];
const formState = reactive({
    name: "",
    zhenyin: undefined,
    cost: undefined
});
const detailData = reactive({
    name: "",
    zhenyin: "",
    skill: "",
    img: "",
    shuxing: "",
    origin: "",
    effect: "",
    cost: null,
    remark: "",
    together: []
});
const visible = ref(false);
const visible2 = ref(false);
const data = ref<any>([]);
let originalColumns = [
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
];
const columns = ref<any>();
columns.value = originalColumns;
const addData = ref<any>([]);

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    if (formState.name) {
        allData = allData.filter((item: any) => item.name.includes(formState.name));
    }
    if (formState.cost != undefined && formState.cost != "") {
        allData = allData.filter((item: any) => item.cost == formState.cost);
    }
    if (formState.zhenyin != undefined && formState.zhenyin != "") {
        allData = allData.filter((item: any) => item.zhenyin == formState.zhenyin);
    }
    let map: any = [];
    for (let i = 0; i < allData.length; i++) {
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "skinImg" + allData[i].img + ".png";
        // map.push({
        //     id: allData[i].id,
        //     together: allData[i].together
        // });
    }
    data.value = allData;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.zhenyin = formState.cost = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    visible.value = true;
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.shuxing = record.shuxing;
    detailData.origin = record.origin;
    detailData.skill = record.skill;
    detailData.cost = record.cost;
    detailData.img = record.img;
    detailData.effect = record.effect;
    detailData.remark = record.remark;
    detailData.together = JSON.parse(record.together);
}

function showTogether(_: any) {
    if (!showFlag.value) {
        showText.value = "关闭共创";
        columns.value = [
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
                list: ["detail", "together"],
                width: 50
            },
        ];
    } else {
        showText.value = "参与共创";
        columns.value = originalColumns;
    }
    showFlag.value = !showFlag.value;
}

function showDetail(record: any) {
    visible2.value = true;
    nowID.value = record.id;
    detailData.name = record.name;
    addData.value = JSON.parse(record.together);
    if (addData.value.length == 0) {
        addData.value = [{
            zhuzi: null,
            jinghua: null
        }];
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getSkinList();
    if (res.status == 200) {
        originalData.value = res.data.data;
    }
    tableLoading.value = false;
    getList();
}

function addUnitList() {
    addData.value.push({
        zhuzi: null,
        jinghua: null
    });
}

function reduceUnitList(index: number | string) {
    addData.value.splice(index, 1);
}

async function save() {
    const params = {
        id: nowID.value,
        together: JSON.stringify(addData.value)
    };
    const res = await skinTogether(params);
    if (res.data.code == 200) {
        message.success("操作成功");
        visible2.value = false;
        getOriginalData();
    }
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

.form_div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.add_or_reduce {
    width: 100px;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    column-gap: 10px;
    transform: translateY(-5px);
}

.flex_center {
    display: flex;
    justify-self: flex-start;
    align-items: center;
}
</style>