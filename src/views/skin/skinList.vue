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
                <a-input v-model:value="formState.name" allow-clear placeholder="名称" class="field"
                    @pressEnter="search" />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :loading="tableLoading" @detail="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false"
            :width="isNarrow ? '92%' : 520" centered>
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { costList } from "@/utils/func";
import { getSkinList } from "@/api/skin";
import router from "@/router";
import MyTabel from "@/components/table.vue";
const Detail = defineAsyncComponent(() => import("../model/detailSkin.vue"));

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "skinImg";
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const visible = ref(false);
const data = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const zhenyinOptions = [
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
    zhenyin: number | undefined;
    cost: number | undefined;
}>({
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
    cost: null as number | null,
    remark: ""
});
const columns = [
    { title: "头像", dataIndex: "headImg", key: "headImg", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 120 },
    { title: "操作", key: "action", list: ["detail"], width: 72, fixed: "right", align: "center" }
];

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
    if (formState.zhenyin != null) {
        list = list.filter((item) => item.zhenyin == formState.zhenyin);
    }
    data.value = list.map((item) => ({
        ...item,
        img: IMG_PREFIX + item.img + ".png"
    }));
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

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.shuxing = record.shuxing;
    detailData.origin = record.origin;
    detailData.skill = record.skill;
    detailData.cost = record.cost;
    detailData.img = record.img;
    detailData.effect = record.effect;
    detailData.remark = record.remark;
    visible.value = true;
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getSkinList();
        if (res.status == 200) {
            originalData.value = res.data.data;
        }
        getList();
    } finally {
        tableLoading.value = false;
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
        max-width: 960px;
        margin: 0 auto;
    }

    .filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
