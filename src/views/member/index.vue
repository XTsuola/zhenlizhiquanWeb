<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">群贡献榜</h1>
            <div class="actions">
                <a-button v-if="isAdmin" type="primary" @click="showModal(1)">新增</a-button>
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
                                <div v-if="item.score >= 95" class="tagBg tagBg--score">
                                    {{ getScoreGradeName(item.score, item.title) }}
                                </div>
                                <a-tag v-else class="score-tag" :color="getScoreGradeColor(item.score)">
                                    {{ getScoreGradeName(item.score, item.title) }}
                                </a-tag>
                            </div>
                            <div class="line2">
                                <span class="donation">贡献 {{ formatNum(item.donation) }}</span>
                                <div v-if="isAdmin" class="ops">
                                    <a-button type="link" size="small" @click="showModal(2, item)">修改</a-button>
                                    <a-popconfirm title="确定删除该数据吗?" ok-text="确定" cancel-text="取消"
                                        @confirm="deleteOk(item.id)">
                                        <a-button type="link" danger size="small">删除</a-button>
                                    </a-popconfirm>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <a-empty v-else description="暂无数据" />
        </a-spin>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false"
            :width="isNarrow ? '92%' : 480" centered>
            <a-form ref="formRef" :model="addData" :label-col="{ span: isNarrow ? 24 : 5 }"
                :wrapper-col="{ span: isNarrow ? 24 : 19 }" :layout="isNarrow ? 'vertical' : 'horizontal'"
                autocomplete="off">
                <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称!' }]">
                    <a-input v-model:value="addData.name" placeholder="请输入名称" />
                </a-form-item>
                <a-form-item label="贡献" name="donation" :rules="[{ required: true, message: '请输入贡献!' }]">
                    <a-input-number v-model:value="addData.donation" class="full-field" :min="0" :precision="2" />
                </a-form-item>
                <a-form-item label="奖励" name="donation" :rules="[{ required: true, message: '请输入奖励!' }]">
                    <a-input-number v-model:value="addData.reward" class="full-field" :min="0" :precision="2" />
                </a-form-item>
                <a-form-item label="评分" name="score" :rules="[{ required: true, message: '请输入评分!' }]">
                    <a-input-number v-model:value="addData.score" class="full-field" :min="0" :max="100"
                        :precision="1" />
                </a-form-item>
                <a-form-item label="称号">
                    <a-input v-model:value="addData.title" placeholder="选填" />
                </a-form-item>
                <a-form-item label="备注">
                    <a-input v-model:value="addData.remark" placeholder="选填" />
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
import { getMemberList, memberAdd, memberDelete, memberUpdate, type MemberAddType } from "@/api/member";
import router from "@/router";

const isAdmin = !!sessionStorage.getItem("isAdmin");
const visible = ref(false);
const title = ref("新增成员");
const tableLoading = ref(false);
const saving = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<any>();
const isNarrow = ref(window.innerWidth < 576);

const scoreGradeList = [
    { label: "神话", value: 95, level: "SSS", color: "#000000" },
    { label: "传说", value: 90, level: "SS", color: "#000000" },
    { label: "话痨", value: 85, level: "S", color: "#ff0000" },
    { label: "活跃", value: 80, level: "A", color: "#ff6633" },
    { label: "吐槽", value: 70, level: "B", color: "#8e488e" },
    { label: "冒泡", value: 60, level: "C", color: "#2db7f5" },
    { label: "潜水", value: 0, level: "D", color: "#87d068" }
];

const addData = reactive<MemberAddType>({
    name: "",
    donation: 0,
    reward: 0,
    score: null,
    title: "",
    remark: ""
});

function getScoreGrade(score: number) {
    return scoreGradeList.find((e) => score >= e.value) || scoreGradeList[scoreGradeList.length - 1];
}

function getScoreGradeName(score: number, titleText?: string) {
    const item = getScoreGrade(score);
    return `${item.level} / ${titleText || item.label}`;
}

function getScoreGradeColor(score: number) {
    return getScoreGrade(score).color;
}

function formatNum(value: number) {
    return Number(value || 0).toFixed(2);
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getMemberList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal(type: number, record?: any) {
    visible.value = true;
    if (type == 1) {
        title.value = "新增成员";
        addData.id = undefined;
        addData.donation = addData.reward = 0;
        addData.score = null;
        addData.name = addData.title = addData.remark = "";
    } else if (type == 2) {
        title.value = "修改成员";
        addData.id = record.id;
        addData.donation = record.donation;
        addData.reward = record.reward;
        addData.name = record.name;
        addData.score = record.score;
        addData.title = record.title;
        addData.remark = record.remark;
    }
}

async function save() {
    try {
        await formRef.value?.validate();
        saving.value = true;
        if (title.value == "新增成员") {
            const res = await memberAdd(addData);
            if (res.data.code == 200) {
                await getList();
                message.success("新增成功");
            }
        } else {
            const res = await memberUpdate(addData);
            if (res.data.code == 200) {
                await getList();
                message.success("修改成功");
            }
        }
        visible.value = false;
    } catch (_) {
    } finally {
        saving.value = false;
    }
}

async function deleteOk(id: number) {
    const res = await memberDelete(id);
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

.score-tag {
    margin: 0;
    flex-shrink: 0;
    border-radius: 4px;
}

.tagBg {
    margin: 0;
    flex-shrink: 0;
    color: #ffffff;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    border-radius: 6px;
    background: linear-gradient(45deg,
            #111,
            #aa8b3b,
            #ffd700,
            #ff6b35,
            #e6b325,
            #c8a951,
            #111);
    background-size: 600% 600%;
    animation: colorGold 10s ease infinite;
    box-shadow: 0 1px 4px rgba(170, 139, 59, 0.35);

    &--score {
        width: auto;
        max-width: 100%;
        min-height: 22px;
        padding: 0 8px;
        white-space: nowrap;
    }
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

.line2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
}

.donation {
    color: #64748b;
    font-size: 13px;
}

.ops {
    display: inline-flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;

    :deep(.ant-btn-link) {
        padding-inline: 4px;
        height: auto;
    }
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
