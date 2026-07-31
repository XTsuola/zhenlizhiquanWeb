<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="formState.zhenyin" allow-clear placeholder="种族" class="field">
                    <a-select-option v-for="item in zhenyinList" :key="String(item.value)" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="formState.cost" allow-clear placeholder="费用" class="field">
                    <a-select-option v-for="item in costList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-input v-model:value="formState.name" allow-clear placeholder="名称" class="field"
                    @pressEnter="search" />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button type="primary" @click="showModal(1)">新增皮肤</a-button>
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
                <a-form-item label="原始皮肤" name="cardId" :rules="[{ required: !isDetail, message: '请选择原始皮肤!' }]">
                    <a-select v-model:value="addData.cardId" placeholder="请选择" :disabled="isDetail">
                        <a-select-option v-for="item in skinSelect" :key="item.cardId" :value="item.cardId">
                            {{ item.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="皮肤名称" name="name" :rules="[{ required: !isDetail, message: '请输入皮肤名称!' }]">
                    <a-input v-model:value="addData.name" placeholder="请输入" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="技能名称">
                    <a-input v-model:value="addData.skill" placeholder="请输入" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="皮肤效果" name="effect" :rules="[{ required: !isDetail, message: '请输入皮肤效果!' }]">
                    <a-textarea v-model:value="addData.effect" placeholder="请输入" :rows="4" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="设计理由" name="reason" :rules="[{ required: !isDetail, message: '请输入设计理由!' }]">
                    <a-textarea v-model:value="addData.reason" placeholder="请输入" :rows="4" :readonly="isDetail" />
                </a-form-item>
                <a-form-item label="其他备注">
                    <a-textarea v-model:value="addData.remark" placeholder="请输入" :rows="3" :readonly="isDetail" />
                </a-form-item>
                <a-form-item v-if="title === '修改皮肤'" label="管理员密码" name="password"
                    :rules="[{ required: true, message: '请输入管理员密码!' }]">
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
import { costList, skinSelect } from "@/utils/func";
import { getSkinDiyList, skinDiyAdd, skinDiyUpdate, type SkinDiyAddType } from "@/api/diy";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "skinImg";
const loading = ref(false);
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const visible = ref(false);
const formRef = ref<any>();
const title = ref("新增皮肤");
const data = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const isDetail = computed(() => title.value === "皮肤详情");
const zhenyinList = [
    { label: "全部", value: "" },
    { label: "帝国", value: 1 },
    { label: "隐秘", value: 2 },
    { label: "禅意", value: 3 },
    { label: "港口", value: 4 },
    { label: "炼狱", value: 5 },
    { label: "蛮石", value: 6 },
    { label: "冬神", value: 7 }
];
const formState = reactive<{
    name: string;
    zhenyin: number | string | undefined;
    cost: number | undefined;
}>({
    name: "",
    zhenyin: undefined,
    cost: undefined
});

const columns = [
    { title: "头像", dataIndex: "headImg", key: "headImg", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 100 },
    { title: "效果", dataIndex: "effect", key: "effect", ellipsis: true, minWidth: 120 },
    { title: "操作", key: "action", list: ["detail", "edit"], width: 110, fixed: "right", align: "center" }
];

const addData = reactive<SkinDiyAddType>({
    id: undefined,
    cardId: undefined,
    name: "",
    skill: "",
    effect: "",
    reason: "",
    remark: "",
    password: ""
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function getList() {
    let list = originalData.value.map((item) => {
        const obj: any = skinSelect.find((e: any) => e.cardId == item.cardId);
        return {
            ...item,
            img: obj ? IMG_PREFIX + obj.img + ".png" : "",
            zhenyin: obj?.zhenyin,
            cost: obj?.cost
        };
    });

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
    data.value = list;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.zhenyin = undefined;
    formState.cost = undefined;
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
        title.value = "新增皮肤";
        addData.cardId = undefined;
        addData.name = "";
        addData.skill = "";
        addData.effect = "";
        addData.reason = "";
        addData.remark = "";
    } else if (type == 2 || type == 3) {
        title.value = type == 2 ? "修改皮肤" : "皮肤详情";
        addData.id = record.id;
        addData.cardId = record.cardId;
        addData.name = record.name;
        addData.skill = record.skill;
        addData.effect = record.effect;
        addData.reason = record.reason;
        addData.remark = record.remark;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getSkinDiyList();
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
        if (title.value === "新增皮肤") {
            const params: SkinDiyAddType = {
                cardId: addData.cardId,
                name: addData.name,
                skill: addData.skill,
                effect: addData.effect,
                reason: addData.reason,
                remark: addData.remark
            };
            const res = await skinDiyAdd(params);
            if (res.data.code == 200) {
                message.success("新增成功");
                visible.value = false;
                await getOriginalData();
            }
        } else {
            const params: SkinDiyAddType = {
                id: addData.id,
                cardId: addData.cardId,
                name: addData.name,
                skill: addData.skill,
                effect: addData.effect,
                reason: addData.reason,
                remark: addData.remark,
                password: addData.password
            };
            const res = await skinDiyUpdate(params);
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

.field {
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
