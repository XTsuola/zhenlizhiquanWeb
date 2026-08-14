<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="formState.quality" allow-clear placeholder="品质" class="field">
                    <a-select-option v-for="item in shenqiQualityList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="formState.type" allow-clear placeholder="类型" class="field">
                    <a-select-option v-for="item in typeList" :key="item.value" :value="item.value">
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
            <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :loading="tableLoading"
                @detail="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, defineAsyncComponent } from "vue";
import { shenqiQualityList, typeList } from "@/utils/func";
import router from "@/router";
import MyTabel from "@/components/table.vue";
const Detail = defineAsyncComponent(() => import("../model/detailShenqi.vue"));

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "shenqiImg";
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const formState = reactive<{
    name: string;
    quality: number | undefined;
    type: number | undefined;
}>({
    name: "",
    quality: undefined,
    type: undefined
});
const detailData = reactive({
    zhenyin: "",
    name: "",
    quality: "",
    type: "",
    img: "",
    bonus: "",
    data: [] as any[]
});
const visible = ref(false);
const data = ref<any[]>([]);
const columns = [
    {
        title: "头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 64
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 72
    }
];

function getList() {
    let list = originalData.value;
    const name = formState.name.trim();
    if (name) {
        list = list.filter((item) => item.name.includes(name));
    }
    if (formState.quality != null) {
        list = list.filter((item) => item.quality == formState.quality);
    }
    if (formState.type != null && formState.type !== ("" as any)) {
        list = list.filter((item) => item.type == formState.type);
    }
    data.value = list.map((item) => ({
        ...item,
        img: IMG_PREFIX + item.img,
        rowTone: item.quality === 3 ? "orange" : item.quality === 2 ? "purple" : item.quality === 1 ? "blue" : ""
    }));
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.quality = formState.type = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.zhenyin = record.zhenyin;
    detailData.quality = record.quality;
    detailData.type = record.type;
    detailData.img = record.img;
    detailData.bonus = record.bonus;
    detailData.data = record.data;
    visible.value = true;
}

function cancel() {
    visible.value = false;
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const zhenyin = parseInt(sessionStorage.getItem("shenqi") || "0", 10);
        const { shenqiData } = await import("@/data/shenqiData/all");
        originalData.value = shenqiData.filter((item: any) => item.zhenyin === zhenyin);
        getList();
    } finally {
        tableLoading.value = false;
    }
}

onMounted(() => {
    getOriginalData();
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
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
    background: transparent;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-bottom: 12px;
    }
}
</style>
