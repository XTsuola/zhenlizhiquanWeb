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
                <a-select
                    v-model:value="formState.tag"
                    allow-clear
                    mode="multiple"
                    placeholder="标签"
                    class="field field--span"
                >
                    <a-select-option v-for="item in tabList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-input
                    v-model:value="formState.name"
                    allow-clear
                    placeholder="名称"
                    class="field"
                    @pressEnter="getList"
                />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="getList">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button
                    :type="viewMode === 'tag' ? 'default' : 'primary'"
                    ghost
                    :disabled="tableLoading"
                    @click="toggleTag"
                >
                    {{ viewMode === "tag" ? "关闭" : "标签" }}
                </a-button>
                <a-button
                    :type="viewMode === 'sort' ? 'default' : 'primary'"
                    ghost
                    :disabled="tableLoading"
                    @click="toggleSort"
                >
                    {{ viewMode === "sort" ? "关闭" : "排序" }}
                </a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="table-wrap">
            <MyTabel
                :columnsData="columns"
                :dataSource="data"
                :rowClass="true"
                :loading="tableLoading"
                @detail="openDetail"
                @grade="openGrade"
                @tag="openTag"
            />
        </div>

        <a-modal
            v-model:open="gradeVisible"
            destroyOnClose
            title="卡牌评级"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 420"
            centered
        >
            <div class="modal-line">卡牌名称：{{ gradeEdit.name }}</div>
            <div class="modal-line">选择评级：</div>
            <a-radio-group v-model:value="gradeEdit.grade" class="grade-group">
                <a-radio v-for="item in gradeList" :key="item.value" class="myRadio" :value="item.value">
                    <div v-if="item.value === 6" class="tagBg">{{ item.label }}</div>
                    <a-tag v-else :color="item.color">{{ item.label }}</a-tag>
                </a-radio>
            </a-radio-group>
            <template #footer>
                <a-button @click="gradeVisible = false">关闭</a-button>
                <a-button type="primary" :loading="saving" @click="saveGrade">确定</a-button>
            </template>
        </a-modal>

        <a-modal
            v-model:open="tagVisible"
            destroyOnClose
            title="卡牌标签"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 480"
            centered
        >
            <div class="modal-line">卡牌名称：{{ tagEdit.name }}</div>
            <div class="modal-line tag-actions">
                <span>添加标签</span>
                <a-button size="small" @click="tagEdit.tag = []">清空</a-button>
            </div>
            <a-checkbox-group v-model:value="tagEdit.tag" :options="tabList" />
            <template #footer>
                <a-button @click="tagVisible = false">关闭</a-button>
                <a-button type="primary" :loading="saving" @click="saveTag">确定</a-button>
            </template>
        </a-modal>

        <a-modal
            v-model:open="detailVisible"
            destroyOnClose
            title="详细信息"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 520"
            centered
        >
            <Detail v-if="detailVisible" :detailData="detailData" />
            <template #footer>
                <a-button @click="detailVisible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { message } from "ant-design-vue";
import { cardZhenyinList, costList, cardQualityList, tabList, allValuesInArray } from "@/utils/func";
import { getAllCardList, updateCardGrade, updateCardTag } from "@/api/card";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const Detail = defineAsyncComponent(() => import("../model/detailCard.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
import { isAdmin as checkAdmin } from "@/utils/admin";
const isAdmin = checkAdmin();

const gradeList = [
    { label: "SSS真神", value: 6, color: "#000000" },
    { label: "SS神话", value: 5, color: "#000000" },
    { label: "S顶级", value: 4, color: "#ff0000" },
    { label: "A高级", value: 3, color: "#ff6633" },
    { label: "B能带", value: 2, color: "#8e488e" },
    { label: "C普通", value: 1, color: "#2db7f5" },
    { label: "D垃圾", value: 0, color: "#87d068" }
];

const cardTypeList = [
    { label: "全部", value: "" },
    { label: "部下", value: 1 },
    { label: "法术", value: 2 },
    { label: "传记", value: 3 },
    { label: "符文", value: 4 }
];

const adminAction = {
    title: "操作",
    key: "action",
    list: ["grade", "tag"],
    width: 120,
    fixed: "right",
    align: "center"
};

function withAdmin(cols: any[]) {
    return isAdmin ? [...cols, adminAction] : cols;
}

const baseColumns = withAdmin([
    { title: "头像", dataIndex: "headImg2", key: "headImg2", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 96 },
    { title: "评级", dataIndex: "grade", key: "grade", width: 88, align: "center" }
]);

const tagColumns = withAdmin([
    { title: "头像", dataIndex: "headImg2", key: "headImg2", width: 64 },
    { title: "标签", dataIndex: "tag", key: "tag", ellipsis: true, minWidth: 120 }
]);

const sortColumns = withAdmin([
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
]);

const tableLoading = ref(false);
const saving = ref(false);
const isNarrow = ref(window.innerWidth < 576);
const viewMode = ref<"default" | "tag" | "sort">("default");
const originalData = ref<any[]>([]);
const data = ref<any[]>([]);
const gradeVisible = ref(false);
const tagVisible = ref(false);
const detailVisible = ref(false);

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

const gradeEdit = reactive({ id: 0, name: "", grade: 0 });
const tagEdit = reactive<{ id: number; name: string; tag: any[] }>({ id: 0, name: "", tag: [] });

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

function openGrade(record: any) {
    gradeEdit.id = record.id;
    gradeEdit.name = record.name;
    gradeEdit.grade = JSON.parse(record.grade)[0];
    gradeVisible.value = true;
}

function openTag(record: any) {
    tagEdit.id = record.id;
    tagEdit.name = record.name;
    tagEdit.tag = Array.isArray(record.tag) ? [...record.tag] : [];
    tagVisible.value = true;
}

function openDetail(_: number, record: any) {
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
    detailVisible.value = true;
}

function toggleTag() {
    viewMode.value = viewMode.value === "tag" ? "default" : "tag";
}

function toggleSort() {
    viewMode.value = viewMode.value === "sort" ? "default" : "sort";
}

async function saveGrade() {
    saving.value = true;
    try {
        const res = await updateCardGrade({ id: gradeEdit.id, grade: [gradeEdit.grade] });
        if (res.data.code == 200) {
            const row = data.value.find((e) => e.id == gradeEdit.id);
            if (row) row.grade = JSON.stringify([gradeEdit.grade]);
            message.success("操作成功");
            gradeVisible.value = false;
        }
    } finally {
        saving.value = false;
    }
}

async function saveTag() {
    saving.value = true;
    try {
        const res = await updateCardTag({ id: tagEdit.id, tag: tagEdit.tag });
        if (res.data.code == 200) {
            const row = data.value.find((e) => e.id == tagEdit.id);
            if (row) row.tag = tagEdit.tag;
            message.success("操作成功");
            tagVisible.value = false;
        }
    } finally {
        saving.value = false;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getAllCardList();
        if (res.status == 200) originalData.value = res.data.data;
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

.field--span {
    grid-column: 1 / -1;
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

.modal-line {
    margin-bottom: 10px;
    font-size: 13px;
    color: #374151;
}

.tag-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.grade-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.myRadio {
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    margin: 0;
}

.tagBg {
    margin: 0;
    width: 72px;
    height: 22px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    border-radius: 4px;
    background: linear-gradient(45deg, #111, #aa8b3b, #ffd700, #ff6b35, #e6b325, #c8a951, #111);
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

    .field--span {
        grid-column: auto;
    }
}
</style>
