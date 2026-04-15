<template>
    <div class="cardDiyList">
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
                    <a-button style="margin-right: 8px;" type="primary" @click="showModal(1)">新增卡牌</a-button>
                </div>
            </div>
        </div>
        <div class="card">
            <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" @edit="showModal"
                :loading="tableLoading"></MyTabel>
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
            <a-form ref="skinDiyAddRef" style="width: 100%;" :model="addData" name="basic" :label-col="{ span: 4 }"
                autocomplete="off">
                <a-form-item label="卡牌种族" name="zhenyin"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请选择种族!' }]">
                    <a-select v-model:value="addData.zhenyin" placeholder="请选择" :disabled="title == '卡牌详情'">
                        <a-select-option v-for="item in zhenyinList" :key="item.value" :value="item.value">{{
                            item.label
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌名称" name="name"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请输入名称!' }]">
                    <a-input v-model:value="addData.name" placeholder="请输入" :readonly="title == '卡牌详情'" />
                </a-form-item>
                <a-form-item label="卡牌类型" name="cardType"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请选择类型!' }]">
                    <a-select v-model:value="addData.cardType" placeholder="请选择" :disabled="title == '卡牌详情'">
                        <a-select-option v-for="item in cardTypeList" :key="item.value" :value="item.value">{{
                            item.label
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌品质" name="quality"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请选择费用!' }]">
                    <a-select v-model:value="addData.quality" placeholder="请选择" :disabled="title == '卡牌详情'">
                        <a-select-option v-for="item in cardQualityList" :key="item.value" :value="item.value">{{
                            item.label
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌费用" name="cost"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请选择费用!' }]">
                    <a-select v-model:value="addData.cost" placeholder="请选择" :disabled="title == '卡牌详情'">
                        <a-select-option v-for="item in costList" :key="item.value" :value="item.value">{{
                            item.label
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌攻击" name="att"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请输入攻击!' }]">
                    <a-input-number style="width: 100%;" v-model:value="addData.att" placeholder="请输入" :precision="0"
                        :min="0" :readonly="title == '卡牌详情'" />
                </a-form-item>
                <a-form-item label="卡牌生命" name="life"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请输入生命!' }]">
                    <a-input-number style="width: 100%;" v-model:value="addData.life" placeholder="请输入" :precision="0"
                        :min="0" :readonly="title == '卡牌详情'" />
                </a-form-item>
                <a-form-item label="卡牌效果" name="effect"
                    :rules="[{ required: title != '卡牌详情' ? true : false, message: '请输入皮肤效果!' }]">
                    <a-textarea v-model:value="addData.effect" placeholder="请输入" style="height: 100px;"
                        :readonly="title == '卡牌详情'"></a-textarea>
                </a-form-item>
                <a-form-item label="设计理由">
                    <a-textarea v-model:value="addData.info" placeholder="请输入" style="height: 100px;"
                        :readonly="title == '卡牌详情'"></a-textarea>
                </a-form-item>
                <a-form-item label="其他备注">
                    <a-textarea v-model:value="addData.remark" placeholder="请输入" style="height: 60px;"
                        :readonly="title == '卡牌详情'"></a-textarea>
                </a-form-item>
                <a-form-item v-if="title == '修改卡牌'" label="临时密码" name="password"
                    :rules="[{ required: true, message: '请输入临时密码!' }]">
                    <a-input v-model:value="addData.password" placeholder="请输入" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
                <a-button v-if="title != '卡牌详情'" key="submit" type="primary" :loading="loading" @click="handleOk">保存
                </a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { costList, cardQualityList } from "@/utils/func";
import { getCardDiyList, cardDiyAdd, cardDiyUpdateTemp, type CardDiyAddType } from "@/api/diy";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const loading = ref(false);
const tableLoading = ref(false);
const originalData = ref([]);
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
const cardTypeList = [{
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
const formState = reactive({
    name: "",
    zhenyin: undefined,
    cost: undefined,
    quality: undefined
});
const visible = ref(false);
const skinDiyAddRef = ref<any>();
const title = ref("新增卡牌");
const data = ref<any>([]);
let originalColumns = [
    /* {
        title: "头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 50,
        scopedSlots: { customRender: "pic" }
    }, */
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "种族",
        dataIndex: "zhenyin",
        key: "zhenyin",
        customRender: (opt: any) => zhenyinList[opt.value].label,
        width: 160
    },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit"],
        width: 50
    },
];
const columns = ref<any>();
columns.value = originalColumns;
const addData = reactive<CardDiyAddType>({
    id: undefined,
    zhenyin: undefined,
    name: "",
    cardType: undefined,
    cost: undefined,
    quality: undefined,
    att: undefined,
    life: undefined,
    effect: "",
    info: "",
    remark: "",
    password: ""
});

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    if (formState.name) {
        allData = allData.filter((item: any) => item.name.includes(formState.name));
    }
    if (formState.cost != undefined && formState.cost !== "") {
        allData = allData.filter((item: any) => item.cost == formState.cost);
    }
    if (formState.zhenyin != undefined && formState.zhenyin != "") {
        allData = allData.filter((item: any) => item.zhenyin == formState.zhenyin);
    }
    if (formState.quality != undefined && formState.quality != "") {
        allData = allData.filter((item: any) => item.quality == formState.quality);
    }
    /* for (let i = 0; i < allData.length; i++) {
        const obj: any = skinSelect.find((e: any) => e.cardId == allData[i].cardId);
        allData[i].zhenyin = obj.zhenyin;
        allData[i].cost = obj.cost;
    } */
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

function showModal(type: number, record?: any) {
    visible.value = true;
    addData.id = undefined;
    addData.password = "";
    if (type == 1) {
        title.value = "新增卡牌";
        addData.zhenyin = addData.cardType = addData.cost = addData.quality = addData.att = addData.life = undefined;
        addData.name = addData.effect = addData.info = addData.remark = "";
    } else if (type == 2) {
        title.value = "修改卡牌";
        addData.id = record.id;
        addData.zhenyin = record.zhenyin;
        addData.name = record.name;
        addData.cardType = record.cardType;
        addData.cost = record.cost;
        addData.quality = record.quality;
        addData.att = record.att;
        addData.life = record.life;
        addData.effect = record.effect;
        addData.info = record.info;
        addData.remark = record.remark;
    } else if (type == 3) {
        title.value = "卡牌详情";
        addData.id = record.id;
        addData.zhenyin = record.zhenyin;
        addData.name = record.name;
        addData.cardType = record.cardType;
        addData.cost = record.cost;
        addData.quality = record.quality;
        addData.att = record.att;
        addData.life = record.life;
        addData.effect = record.effect;
        addData.info = record.info;
        addData.remark = record.remark;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getCardDiyList();
    if (res.status == 200) {
        const data = res.data.data.reverse();
        originalData.value = data;
    }
    tableLoading.value = false;
    getList();
}

async function handleOk() {
    loading.value = true;
    try {
        await skinDiyAddRef.value?.validate();
        if (title.value == "新增卡牌") {
            const params: CardDiyAddType = {
                zhenyin: addData.zhenyin,
                name: addData.name,
                cardType: addData.cardType,
                cost: addData.cost,
                quality: addData.quality,
                att: addData.att,
                life: addData.life,
                effect: addData.effect,
                info: addData.info,
                remark: addData.remark
            };
            const res = await cardDiyAdd(params);
            if (res.data.code == 200) {
                message.success("新增成功");
                visible.value = false;
                getOriginalData();
            }
        } else {
            const params: CardDiyAddType = {
                id: addData.id,
                zhenyin: addData.zhenyin,
                name: addData.name,
                cardType: addData.cardType,
                cost: addData.cost,
                quality: addData.quality,
                att: addData.att,
                life: addData.life,
                effect: addData.effect,
                info: addData.info,
                remark: addData.remark,
                password: addData.password
            };
            const res = await cardDiyUpdateTemp(params);
            if (res.data.code == 200) {
                message.success("修改成功");
                visible.value = false;
                getOriginalData();
            }
        }

    } catch (_) { }
    loading.value = false;
}

onMounted(() => {
    getOriginalData();
})

</script>
<style lang="less" scoped>
.cardDiyList {
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
}
</style>