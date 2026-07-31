<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">临时密码管理</h1>
            <div class="actions">
                <a-button type="primary" @click="showModal">新增</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" @delete="deleteOk" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="新增临时密码" :maskClosable="false"
            :width="isNarrow ? '92%' : 420" centered>
            <a-form ref="formRef" :model="addData" :layout="isNarrow ? 'vertical' : 'horizontal'"
                :label-col="{ span: isNarrow ? 24 : 6 }" :wrapper-col="{ span: isNarrow ? 24 : 18 }" autocomplete="off">
                <a-form-item label="临时密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                    <a-input v-model:value="addData.password" placeholder="请输入密码" />
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
import { getFrequencyPasswordList, frequencyPasswordAdd, frequencyPasswordDelete } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const visible = ref(false);
const tableLoading = ref(false);
const saving = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<any>();
const isNarrow = ref(window.innerWidth < 576);
const addData = reactive({ password: "" });
const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 64, align: "center" },
    { title: "密码", dataIndex: "password", key: "password", ellipsis: true, minWidth: 120 },
    { title: "操作", key: "action", list: ["delete"], width: 80, fixed: "right", align: "center" }
];

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getFrequencyPasswordList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal() {
    visible.value = true;
    addData.password = "";
}

async function save() {
    try {
        await formRef.value?.validate();
        saving.value = true;
        const res = await frequencyPasswordAdd(addData);
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

async function deleteOk(id: number) {
    const res = await frequencyPasswordDelete(id);
    if (res.data.code == 200) {
        message.success("删除成功");
    } else {
        message.error("删除失败");
    }
    getList();
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

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
