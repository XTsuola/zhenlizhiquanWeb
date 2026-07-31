<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="formState.zhenyin" allow-clear placeholder="种族" class="field">
                    <a-select-option v-for="item in cardZhenyinList" :key="item.value" :value="item.value">
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
                <a-select v-model:value="formState.type" allow-clear placeholder="类型" class="field">
                    <a-select-option v-for="item in cardTypeList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <div class="field-row">
                    <a-input v-model:value="formState.name" allow-clear placeholder="名称" class="field"
                        @pressEnter="getList" />
                    <a-select v-model:value="formState.tag" allow-clear mode="multiple" placeholder="标签"
                        class="field">
                        <a-select-option v-for="item in tabList" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </div>
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="getList">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button :type="viewMode === 'tag' ? 'default' : 'primary'" ghost :disabled="tableLoading"
                    @click="toggleTag">
                    {{ viewMode === "tag" ? "关闭" : "标签" }}
                </a-button>
                <a-button :type="viewMode === 'sort' ? 'default' : 'primary'" ghost :disabled="tableLoading"
                    @click="toggleSort">
                    {{ viewMode === "sort" ? "关闭" : "排序" }}
                </a-button>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { cardZhenyinList, costList, cardQualityList, tabList, allValuesInArray } from "@/utils/func";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const Detail = defineAsyncComponent(() => import("../model/detailCard.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
const cardTypeList = [
    { label: "全部", value: "" },
    { label: "部下", value: 1 },
    { label: "法术", value: 2 },
    { label: "传记", value: 3 },
    { label: "符文", value: 4 }
];
const baseColumns = [
    { title: "头像", dataIndex: "headImg2", key: "headImg2", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 96 },
    { title: "评级", dataIndex: "grade", key: "grade", width: 88, align: "center" }
];
const tagColumns = [
    { title: "头像", dataIndex: "headImg2", key: "headImg2", width: 64 },
    { title: "标签", dataIndex: "tag", key: "tag", ellipsis: true, minWidth: 120 }
];
const sortColumns = [
    { title: "头像", dataIndex: "headImg2", key: "headImg2", width: 52 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, width: 72 },
    {
        title: "攻",
        dataIndex: "att",
        key: "att",
        width: 56,
        align: "center",
        sorter: (a: any, b: any) => a.att - b.att
    },
    {
        title: "血",
        dataIndex: "life",
        key: "life",
        width: 56,
        align: "center",
        sorter: (a: any, b: any) => a.life - b.life
    },
    {
        title: "评级",
        dataIndex: "grade",
        key: "grade",
        width: 72,
        align: "center",
        sorter: (a: any, b: any) => JSON.parse(a.grade)[0] - JSON.parse(b.grade)[0]
    }
];
const tableLoading = ref(false);
const isNarrow = ref(window.innerWidth < 576);
const viewMode = ref<"default" | "tag" | "sort">("default");
const originalData = ref<any[]>([]);
const data = ref<any[]>([]);
const visible = ref(false);
const formState = reactive<{
    name: string;
    tag: number[] | undefined;
    zhenyin: number | undefined;
    cost: number | undefined;
    quality: number | undefined;
    type: number | string | undefined;
}>({
    name: "",
    tag: undefined,
    zhenyin: undefined,
    cost: undefined,
    quality: undefined,
    type: undefined
});
const detailData = reactive({
    id: 0,
    zhenyin: "",
    name: "",
    quality: "",
    cost: null as number | null,
    type: null as number | null,
    img: "",
    grade: "",
    data: [] as any[]
});
const columns = computed(() => {
    if (viewMode.value === "tag") return tagColumns;
    if (viewMode.value === "sort") return sortColumns;
    return baseColumns;
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function parseTags(tag: unknown) {
    if (!tag) return [];
    if (Array.isArray(tag)) return tag;
    if (typeof tag === "string") return JSON.parse(tag);
    return [];
}

function getList() {
    let list = originalData.value;
    const name = formState.name.trim();
    if (name) list = list.filter((item) => item.name.includes(name));
    if (formState.zhenyin != null) list = list.filter((item) => item.zhenyin == formState.zhenyin);
    if (formState.cost != null) list = list.filter((item) => item.cost == formState.cost);
    if (formState.quality != null) list = list.filter((item) => item.quality == formState.quality);
    if (formState.type != null && formState.type !== "") {
        list = list.filter((item) => item.type == formState.type);
    }
    const selectedTags = formState.tag;
    if (selectedTags?.length) {
        list = list.filter((item) => allValuesInArray(selectedTags, parseTags(item.tag)));
    }
    data.value = list.map((item) => {
        const last = item.data?.at?.(-1);
        return {
            ...item,
            img: IMG_PREFIX + item.img,
            tag: parseTags(item.tag),
            att: last?.attack,
            life: last?.life
        };
    });
}

function reset() {
    formState.name = "";
    formState.tag = undefined;
    formState.zhenyin = formState.cost = formState.quality = formState.type = undefined;
    viewMode.value = "default";
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    Object.assign(detailData, {
        id: record.id,
        name: record.name,
        zhenyin: record.zhenyin,
        quality: record.quality,
        cost: record.cost,
        type: record.type,
        img: record.img,
        grade: record.grade,
        data: record.data
    });
    visible.value = true;
}

function toggleTag() {
    viewMode.value = viewMode.value === "tag" ? "default" : "tag";
}

function toggleSort() {
    viewMode.value = viewMode.value === "sort" ? "default" : "sort";
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const { gradeData } = await import("@/data/z_otherData/gradeData");
        originalData.value = gradeData;
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

.field-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.table-wrap :deep(.myTable),
.table-wrap :deep(.table-scroll) {
    max-width: 100%;
    min-width: 0;
}

.table-wrap :deep(.cell-img) {
    width: 36px;
    height: 36px;
}

.table-wrap :deep(.ant-table) {
    font-size: 12px;
}

.table-wrap :deep(.ant-table-thead > tr > th),
.table-wrap :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px !important;
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
