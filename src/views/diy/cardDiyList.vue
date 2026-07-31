<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="formState.zhenyin" allow-clear placeholder="种族" class="field">
                    <a-select-option v-for="item in zhenyinOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="formState.cost" allow-clear placeholder="费用" class="field">
                    <a-select-option v-for="item in costList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="formState.quality" allow-clear placeholder="品质" class="field">
                    <a-select-option v-for="item in cardQualityList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-input v-model:value="formState.name" allow-clear placeholder="名称" class="field"
                    @pressEnter="search" />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button type="primary" @click="showModal(1)">新增卡牌</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :loading="tableLoading" @detail="showModal"
                @edit="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false"
            :width="isNarrow ? '92%' : 560" centered>
            <a-form ref="formRef" :model="addData" :layout="isNarrow ? 'vertical' : 'horizontal'"
                :label-col="{ span: isNarrow ? 24 : 5 }" :wrapper-col="{ span: isNarrow ? 24 : 19 }" autocomplete="off">
                <a-form-item label="卡牌种族" name="zhenyin" :rules="[{ required: !isDetail, message: '请选择种族!' }]">
                    <a-select v-model:value="addData.zhenyin" placeholder="请选择" :disabled="isDetail">
                        <a-select-option v-for="item in zhenyinOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌名称" name="name" :rules="[{ required: !isDetail, message: '请输入名称!' }]">
                    <a-input v-model:value="addData.name" placeholder="请输入" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="卡牌类型" name="cardType" :rules="[{ required: !isDetail, message: '请选择类型!' }]">
                    <a-select v-model:value="addData.cardType" placeholder="请选择" :disabled="isDetail">
                        <a-select-option v-for="item in cardTypeList" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌品质" name="quality" :rules="[{ required: !isDetail, message: '请选择品质!' }]">
                    <a-select v-model:value="addData.quality" placeholder="请选择" :disabled="isDetail">
                        <a-select-option v-for="item in cardQualityList" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌费用" name="cost" :rules="[{ required: !isDetail, message: '请选择费用!' }]">
                    <a-select v-model:value="addData.cost" placeholder="请选择" :disabled="isDetail">
                        <a-select-option v-for="item in costList" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="卡牌攻击" name="att" :rules="[{ required: !isDetail, message: '请输入攻击!' }]">
                    <a-input-number v-model:value="addData.att" class="full-field" placeholder="请输入" :precision="0"
                        :min="0" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="卡牌生命" name="life" :rules="[{ required: !isDetail, message: '请输入生命!' }]">
                    <a-input-number v-model:value="addData.life" class="full-field" placeholder="请输入" :precision="0"
                        :min="0" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="卡牌效果" name="effect" :rules="[{ required: !isDetail, message: '请输入卡牌效果!' }]">
                    <a-textarea v-model:value="addData.effect" placeholder="请输入" :rows="4" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="设计理由">
                    <a-textarea v-model:value="addData.info" placeholder="请输入" :rows="4" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="其他备注">
                    <a-textarea v-model:value="addData.remark" placeholder="请输入" :rows="3" :readonly="isDetail" />
                </a-form-item>
                <a-form-item v-if="title === '修改卡牌'" label="临时密码" name="password"
                    :rules="[{ required: true, message: '请输入临时密码!' }]">
                    <a-input-password v-model:value="addData.password" placeholder="请输入" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
                <a-button v-if="!isDetail" type="primary" :loading="loading" @click="handleOk">保存</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import { message } from "ant-design-vue";
import { costList, cardQualityList } from "@/utils/func";
import { getCardDiyList, cardDiyAdd, cardDiyUpdateTemp, type CardDiyAddType } from "@/api/diy";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const loading = ref(false);
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const visible = ref(false);
const formRef = ref<any>();
const title = ref("新增卡牌");
const data = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const isDetail = computed(() => title.value === "卡牌详情");
const zhenyinList = [
    { label: "全部", value: "" as const },
    { label: "帝国", value: 1 },
    { label: "隐秘", value: 2 },
    { label: "禅意", value: 3 },
    { label: "港口", value: 4 },
    { label: "炼狱", value: 5 },
    { label: "蛮石", value: 6 },
    { label: "冬神", value: 7 }
];
const zhenyinOptions = zhenyinList.filter((item) => item.value !== "");
const cardTypeList = [
    { label: "部下", value: 1 },
    { label: "法术", value: 2 },
    { label: "传记", value: 3 },
    { label: "符文", value: 4 }
];
const formState = reactive<{
    name: string;
    zhenyin: number | string | undefined;
    cost: number | undefined;
    quality: number | undefined;
}>({
    name: "",
    zhenyin: undefined,
    cost: undefined,
    quality: undefined
});
const columns = [
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 100 },
    {
        title: "种族",
        dataIndex: "zhenyin",
        key: "zhenyin",
        width: 80,
        customRender: (opt: any) => zhenyinList.find((e) => e.value == opt.value)?.label || "-"
    },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit"],
        width: 110,
        fixed: "right",
        align: "center"
    }
];
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

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function getList() {
    let list = originalData.value;
    const name = formState.name.trim();
    if (name) {
        list = list.filter((item) => item.name.includes(name));
    }
    if (formState.cost != null && formState.cost !== ("" as any)) {
        list = list.filter((item) => item.cost == formState.cost);
    }
    if (formState.zhenyin != null && formState.zhenyin !== "") {
        list = list.filter((item) => item.zhenyin == formState.zhenyin);
    }
    if (formState.quality != null && formState.quality !== ("" as any)) {
        list = list.filter((item) => item.quality == formState.quality);
    }
    data.value = list;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.zhenyin = undefined;
    formState.cost = undefined;
    formState.quality = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function fillForm(record: any) {
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

function showModal(type: number, record?: any) {
    visible.value = true;
    addData.id = undefined;
    addData.password = "";
    if (type == 1) {
        title.value = "新增卡牌";
        addData.zhenyin = undefined;
        addData.cardType = undefined;
        addData.cost = undefined;
        addData.quality = undefined;
        addData.att = undefined;
        addData.life = undefined;
        addData.name = "";
        addData.effect = "";
        addData.info = "";
        addData.remark = "";
    } else if (type == 2 || type == 3) {
        title.value = type == 2 ? "修改卡牌" : "卡牌详情";
        fillForm(record);
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getCardDiyList();
        if (res.status == 200) {
            originalData.value = res.data.data.reverse();
        }
        getList();
    } finally {
        tableLoading.value = false;
    }
}

async function handleOk() {
    loading.value = true;
    try {
        await formRef.value?.validate();
        if (title.value === "新增卡牌") {
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
                await getOriginalData();
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
                await getOriginalData();
            }
        }
    } catch (_) {
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getOriginalData();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    overflow-x: hidden;
}

.toolbar {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
}

.field,
.full-field {
    width: 100%;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }

    .filters {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>
