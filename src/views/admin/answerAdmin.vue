<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">答案管理</h1>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="table-wrap">
            <MyTabel
                :columnsData="columns"
                :dataSource="tableData"
                :loading="tableLoading"
                @detail="showDetail"
            />
        </div>
        <a-modal
            v-model:open="visible"
            destroyOnClose
            title="答案详情"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 560"
            centered
        >
            <div class="detail">
                <div class="detail-row">
                    <span class="label">ID</span>
                    <span class="value">{{ detail.id }}</span>
                </div>
                <div class="detail-block">
                    <div class="label">题目</div>
                    <div class="content content--question">{{ detail.questionTitle || "-" }}</div>
                </div>
                <div class="detail-row">
                    <span class="label">昵称</span>
                    <span class="value">{{ detail.name || "-" }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">时间</span>
                    <span class="value">{{ detail.timeText || "-" }}</span>
                </div>
                <div class="detail-block">
                    <div class="label">答案</div>
                    <div class="content">{{ detail.content || "-" }}</div>
                </div>
            </div>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { formatDate } from "@/utils/func";
import { getAnswerAllList, getQuestionList } from "@/api/question";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const tableLoading = ref(false);
const visible = ref(false);
const isNarrow = ref(window.innerWidth < 576);
const tableData = ref<any[]>([]);
const questionMap = ref(new Map<number | string, string>());
const detail = reactive({
    id: "" as string | number,
    questionId: "" as string | number,
    questionTitle: "",
    name: "",
    content: "",
    timeText: ""
});

const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 64, align: "center" },
    { title: "题目ID", dataIndex: "questionId", key: "questionId", width: 88, align: "center" },
    { title: "昵称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 100 },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 72,
        fixed: "right",
        align: "center"
    }
];

function formatTime(value: unknown) {
    if (value == null || value === "") return "-";
    const d = new Date(value as string | number | Date);
    if (Number.isNaN(d.getTime())) return String(value);
    return formatDate(d);
}

function getQuestionTitle(questionId: number | string) {
    return questionMap.value.get(questionId) || questionMap.value.get(Number(questionId)) || `题目#${questionId}`;
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function showDetail(_: number, record: any) {
    detail.id = record.id;
    detail.questionId = record.questionId;
    detail.questionTitle = getQuestionTitle(record.questionId);
    detail.name = record.name || "";
    detail.content = record.content || "";
    detail.timeText = record.timeText || formatTime(record.time);
    visible.value = true;
}

async function loadQuestions() {
    const res = await getQuestionList();
    if (res.data.code == 200) {
        const map = new Map<number | string, string>();
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        list.forEach((q: any) => {
            // 题目内容在 info，名称在 name；优先展示题目内容
            const title = String(q.info || q.name || "").trim() || `题目#${q.id}`;
            map.set(q.id, title);
            map.set(String(q.id), title);
        });
        questionMap.value = map;
    }
}

async function getList() {
    tableLoading.value = true;
    try {
        await loadQuestions();
        const res = await getAnswerAllList();
        if (res.data.code == 200) {
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            tableData.value = list.map((item: any) => ({
                ...item,
                timeText: formatTime(item.time)
            }));
        }
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getList();
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 14px;
    line-height: 1.5;
}

.label {
    flex-shrink: 0;
    width: 56px;
    color: #94a3b8;
    font-weight: 600;
}

.value {
    flex: 1;
    min-width: 0;
    color: #1f2937;
    word-break: break-word;
}

.detail-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid #eef2f7;

    .label {
        width: auto;
    }
}

.content {
    padding: 12px;
    background: #f8fafc;
    border: 1px solid #e8ebf0;
    border-radius: 8px;
    color: #1f2937;
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: min(50vh, 420px);
    overflow-y: auto;

    &--question {
        max-height: min(24vh, 180px);
        background: #fff8f1;
        border-color: #f3e0c8;
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }
}
</style>
