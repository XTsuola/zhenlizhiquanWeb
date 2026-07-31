<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-main">
                <h1 class="title">每日一题</h1>
                <div v-if="questionObj.time" class="subtitle">{{ questionObj.time }}</div>
            </div>
            <div class="actions">
                <a-button type="primary" :disabled="!questionObj.id" @click="showModal">立刻答题</a-button>
                <a-button :disabled="!questionObj.id" @click="answerFlag = !answerFlag">
                    {{ answerFlag ? "关闭答案" : "查看答案" }}
                </a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <a-spin :spinning="pageLoading">
            <div class="question-card">
                <div class="section-label">今日题目</div>
                <div class="question-text">{{ questionObj.id ? questionObj.info : "暂无题目" }}</div>
            </div>
            <div v-if="answerFlag" class="answers">
                <div v-if="!list.length" class="empty">暂无回答</div>
                <div v-for="item in list" :key="item.id" class="answer-card">
                    <div class="answer-head">
                        <span class="answer-meta">{{ item.name }} · {{ item.time }}</span>
                        <img v-if="isAdmin" class="answer-delete" src="@/assets/icon/delete_white.png" alt="删除"
                            @click="deleteInfo(item)" />
                    </div>
                    <div class="answer-body">{{ item.content }}</div>
                </div>
            </div>
        </a-spin>
        <a-modal v-model:open="visible" title="您的答案" centered destroyOnClose :maskClosable="false"
            :width="isNarrow ? '92%' : 480">
            <a-form :model="addData" layout="vertical" autocomplete="off">
                <a-form-item label="您的昵称" required>
                    <a-input v-model:value="addData.name" placeholder="您的昵称" :maxlength="20" />
                </a-form-item>
                <a-form-item label="您的答案（理由）" required>
                    <a-textarea v-model:value="addData.content" placeholder="您的答案（理由）"
                        :auto-size="{ minRows: 4, maxRows: 8 }" :maxlength="500" show-count />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" :loading="saving" @click="addAnswer">提交答案</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" title="删除提示" centered :width="isNarrow ? '92%' : 400">
            <div>确认删除这条回答吗？</div>
            <template #footer>
                <a-button @click="visible2 = false">取消</a-button>
                <a-button type="primary" danger :loading="saving" @click="deleteOk">确认</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { formatDate, formatDate2 } from "@/utils/func";
import { noteDelete } from "@/api/note";
import { answerAdd, getAnswerList, questionDetail, type AnswerAddType } from "@/api/question";
import router from "@/router";

const isAdmin = sessionStorage.getItem("isAdmin") === "admin";
const nowId = ref("");
const visible = ref(false);
const visible2 = ref(false);
const saving = ref(false);
const pageLoading = ref(false);
const list = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const answerFlag = ref(false);
const addData = reactive<AnswerAddType>({
    questionId: undefined,
    name: "",
    content: "",
    time: ""
});
const questionObj = reactive<{
    id: number | undefined;
    info: string;
    time: string;
}>({
    id: undefined,
    info: "",
    time: ""
});

let timer: ReturnType<typeof setInterval> | null = null;

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function showModal() {
    visible.value = true;
    addData.name = addData.content = addData.time = "";
}

async function addAnswer() {
    if (!addData.name) {
        message.error("请填写昵称！");
        return;
    }
    if (!addData.content) {
        message.error("请填写回答！");
        return;
    }
    saving.value = true;
    try {
        addData.time = formatDate(new Date());
        addData.questionId = questionObj.id;
        const res = await answerAdd(addData);
        if (res.data.code == 200) {
            message.success("提交成功");
            await getList();
            addData.name = "";
            addData.content = "";
            addData.time = "";
            answerFlag.value = true;
            visible.value = false;
        } else {
            message.error("提交失败");
        }
    } finally {
        saving.value = false;
    }
}

async function getList(silent = false) {
    if (!questionObj.id) {
        list.value = [];
        return;
    }
    if (!silent) pageLoading.value = true;
    try {
        const res = await getAnswerList(questionObj.id);
        if (res.data.code == 200) {
            list.value = res.data.data;
        }
    } finally {
        if (!silent) pageLoading.value = false;
    }
}

function deleteInfo(item: any) {
    nowId.value = item.id;
    visible2.value = true;
}

async function deleteOk() {
    saving.value = true;
    try {
        const res = await noteDelete(nowId.value);
        if (res.data.code == 200) {
            message.success("删除成功");
            visible2.value = false;
            await getList();
        } else {
            message.error("删除失败");
        }
    } finally {
        saving.value = false;
    }
}

async function getQuestion() {
    pageLoading.value = true;
    try {
        questionObj.id = undefined;
        questionObj.info = questionObj.time = "";
        const res = await questionDetail();
        if (res.data.code == 200) {
            if (res.data.data.id == 0) return;
            questionObj.id = res.data.data.id;
            questionObj.info = res.data.data.info;
            questionObj.time = formatDate2(res.data.data.time);
            await getList(true);
        }
    } finally {
        pageLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getQuestion();
    timer = setInterval(() => {
        if (questionObj.id) getList(true);
    }, 5000);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    if (timer) clearInterval(timer);
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
    flex-wrap: wrap;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-main {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.question-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.section-label {
    margin-bottom: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2937;
}

.question-text {
    font-size: 14px;
    line-height: 1.7;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
}

.answers {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.empty {
    text-align: center;
    padding: 36px 16px;
    color: #9ca3af;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
}

.answer-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.answer-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: linear-gradient(135deg, #4f9bc4, #45a8b0);
    color: #fff;
}

.answer-meta {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.answer-delete {
    width: 18px;
    height: 18px;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.9;
}

.answer-body {
    padding: 14px 12px;
    font-size: 13px;
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 720px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }
}
</style>
