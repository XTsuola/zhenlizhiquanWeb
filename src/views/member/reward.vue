<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">奖励榜</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <a-spin :spinning="tableLoading">
            <div v-if="tableData.length" class="list">
                <div v-for="(item, index) in tableData" :key="item.id" class="row">
                    <div class="row-main">
                        <span class="idx">{{ index + 1 }}</span>
                        <div class="info">
                            <div class="line1">
                                <span class="name">{{ item.name }}</span>
                                <a-button v-if="isAdmin" type="link" size="small" @click="showModal(2, item)">
                                    修改
                                </a-button>
                            </div>
                            <div class="line2">
                                <span class="reward-label">奖励</span>
                                <span class="reward-value">{{ formatNum(item.reward) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <a-empty v-else description="暂无数据" />
        </a-spin>
        <a-modal v-model:open="visible" destroyOnClose title="修改奖励" :maskClosable="false"
            :width="isNarrow ? '92%' : 480" centered>
            <a-form ref="formRef" :model="editData" :label-col="{ span: isNarrow ? 24 : 5 }"
                :wrapper-col="{ span: isNarrow ? 24 : 19 }" :layout="isNarrow ? 'vertical' : 'horizontal'"
                autocomplete="off">
                <a-form-item label="名称">
                    <a-input :value="editData.name" disabled />
                </a-form-item>
                <a-form-item label="奖励" name="reward" :rules="[{ required: true, message: '请输入奖励!' }]">
                    <a-input-number v-model:value="editData.reward" class="full-field" :min="0" :precision="2" />
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
import { getRewardList, memberUpdate, type MemberAddType } from "@/api/member";
import router from "@/router";

const isAdmin = !!sessionStorage.getItem("isAdmin");
const visible = ref(false);
const tableLoading = ref(false);
const saving = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<any>();
const isNarrow = ref(window.innerWidth < 576);

const editData = reactive<MemberAddType>({
    id: undefined,
    name: "",
    donation: 0,
    reward: 0,
    score: null,
    title: "",
    remark: ""
});

function formatNum(value: number) {
    return Number(value || 0).toFixed(2);
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getRewardList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal(_type: number, record?: any) {
    if (!record) return;
    visible.value = true;
    editData.id = record.id;
    editData.name = record.name;
    editData.donation = record.donation ?? 0;
    editData.score = record.score ?? null;
    editData.reward = record.reward ?? 0;
    editData.title = record.title ?? "";
    editData.remark = record.remark ?? "";
}

async function save() {
    try {
        await formRef.value?.validate();
        saving.value = true;
        const res = await memberUpdate(editData);
        if (res.data.code == 200) {
            await getList();
            message.success("修改成功");
            visible.value = false;
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
    flex-shrink: 0;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.row {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.row-main {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

.idx {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 1px;
    border-radius: 6px;
    background: #eef2f7;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.line1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;

    :deep(.ant-btn-link) {
        padding-inline: 4px;
        height: auto;
        flex-shrink: 0;
    }
}

.name {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.line2 {
    display: flex;
    align-items: baseline;
    gap: 4px;
    min-height: 20px;
}

.reward-label {
    color: #94a3b8;
    font-size: 12px;
}

.reward-value {
    color: #b8860b;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
}

.full-field {
    width: 100%;
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

    .row {
        padding: 12px 14px;
    }
}
</style>
