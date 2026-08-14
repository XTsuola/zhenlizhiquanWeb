<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">每日问题管理</h1>
            <div class="actions">
                <a-button type="primary" @click="showModal">新增</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="新增每日问题" :maskClosable="false"
            :width="isNarrow ? '92%' : 520" centered>
            <a-form ref="formRef" :model="addData" :layout="isNarrow ? 'vertical' : 'horizontal'"
                :label-col="{ span: isNarrow ? 24 : 5 }" :wrapper-col="{ span: isNarrow ? 24 : 19 }" autocomplete="off">
                <a-form-item label="每日问题" name="info" :rules="[{ required: true, message: '请输入问题!' }]">
                    <a-textarea v-model:value="addData.info" class="question-input" placeholder="请输入问题内容" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" :loading="saving" @click="save">保存</a-button>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { getQuestionList, questionAdd } from "@/api/question";
import { formatDate } from "@/utils/func";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const visible = ref(false);
const tableLoading = ref(false);
const saving = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<any>();
const isNarrow = ref(window.innerWidth < 576);
const addData = reactive<any>({ info: "", time: "" });

const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 64, align: "center" },
    { title: "题目", dataIndex: "info", key: "info", minWidth: 200 },
    { title: "时间", dataIndex: "time", key: "time", width: 150 }
];

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getQuestionList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal() {
    visible.value = true;
    addData.info = "";
    addData.time = "";
}

async function save() {
    try {
        await formRef.value?.validate();
        saving.value = true;
        addData.time = formatDate(new Date());
        const res = await questionAdd(addData);
        if (res.data.code == 200) {
            visible.value = false;
            await getList();
            message.success("新增成功");
        }
    } catch (_) {
    } finally {
        saving.value = false;
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

.table-wrap :deep(.ant-table-cell) {
    white-space: normal;
    word-break: break-word;
}

.question-input {
    min-height: 160px;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
