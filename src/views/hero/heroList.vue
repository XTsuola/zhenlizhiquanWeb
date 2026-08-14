<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">英雄统计</h1>
                <p class="subtitle">按名称 / 代理人筛选，查看技能与卡组</p>
            </div>
            <div class="filter-bar">
                <div class="filters">
                    <a-input
                        v-model:value="formState.name"
                        allow-clear
                        placeholder="英雄名称"
                        class="field"
                        @pressEnter="search"
                    />
                    <a-input
                        v-model:value="formState.agent"
                        allow-clear
                        placeholder="代理人"
                        class="field"
                        @pressEnter="search"
                    />
                </div>
                <div class="actions">
                    <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                    <a-button @click="reset">清空</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>

        <a-spin :spinning="tableLoading">
            <div v-if="data.length" class="list">
                <div
                    v-for="item in data"
                    :key="item.id"
                    class="card"
                    :class="`card--q${item.quality || 1}`"
                >
                    <div class="card-main">
                        <a-badge
                            :count="item.cardsCount"
                            :number-style="{ backgroundColor: '#4f9bc4' }"
                            :show-zero="true"
                        >
                            <img class="avatar" :src="item.img" :alt="item.name" />
                        </a-badge>
                        <div class="info">
                            <div class="line1">
                                <span class="name">{{ item.name }}</span>
                                <span class="quality-chip">{{ qualityLabel(item.quality) }}</span>
                            </div>
                            <div class="line2">
                                <template v-if="item.agent?.length">
                                    <a-tag
                                        v-for="name in item.agent"
                                        :key="name"
                                        class="agent-tag"
                                        color="processing"
                                    >
                                        {{ name }}
                                    </a-tag>
                                </template>
                                <span v-else class="agent-empty">暂无代理人</span>
                            </div>
                            <div class="line3">
                                <span class="stat">卡组 {{ item.cardsCount }}</span>
                                <div class="ops">
                                    <a-button size="small" @click="showModal(3, item)">技能</a-button>
                                    <a-button size="small" @click="goFrequency(item)">卡组</a-button>
                                    <a-button
                                        v-if="isAdmin"
                                        size="small"
                                        @click="openAddAgent(item)"
                                    >
                                        代理人
                                    </a-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <a-empty v-else description="暂无匹配英雄" />
        </a-spin>

        <a-modal
            v-model:open="visible"
            destroyOnClose
            title="详细信息"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 520"
            centered
        >
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>

        <a-modal
            v-model:open="visible2"
            destroyOnClose
            title="添加代理人"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 480"
            centered
            @cancel="closeAddAgent"
        >
            <a-form
                ref="agentFormRef"
                :model="agentForm"
                :label-col="{ span: isNarrow ? 24 : 5 }"
                :wrapper-col="{ span: isNarrow ? 24 : 19 }"
                :layout="isNarrow ? 'vertical' : 'horizontal'"
                autocomplete="off"
            >
                <a-form-item label="英雄">
                    <a-input :value="agentForm.heroName" disabled />
                </a-form-item>
                <a-form-item label="代理人1" name="agent1" :rules="[{ required: true, message: '请输入代理人1' }]">
                    <a-input v-model:value="agentForm.agent1" allow-clear placeholder="代理人1" :maxlength="20" />
                </a-form-item>
                <a-form-item label="代理人2" name="agent2">
                    <a-input
                        v-model:value="agentForm.agent2"
                        allow-clear
                        placeholder="代理人2（选填）"
                        :maxlength="20"
                    />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" :loading="saving" @click="saveAgent">保存</a-button>
                <a-button @click="closeAddAgent">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { message } from "ant-design-vue";
import { getHeroList, addAgent } from "@/api/hero";
import { getFrequencyCardsAll } from "@/api/frequency";
import router from "@/router";

interface HeroInfoType {
    id: number;
    name: string;
    zhu: number;
    fu: number;
}

const Detail = defineAsyncComponent(() => import("../model/detailHero.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const isAdmin = !!sessionStorage.getItem("isAdmin");
const qualityNames = ["", "白色", "蓝色", "紫色", "橙色"];

function normalizeAgent(agent: unknown): string[] {
    if (Array.isArray(agent)) return agent.map(String).filter(Boolean);
    if (typeof agent === "string" && agent.trim()) {
        try {
            const parsed = JSON.parse(agent);
            if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        } catch {
            return agent.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
        }
    }
    return [];
}

function qualityLabel(quality: number) {
    return qualityNames[quality] || "未知";
}

const tableLoading = ref(false);
const saving = ref(false);
const originalData = ref<any[]>([]);
const cardsData = ref<any[]>([]);
const formState = reactive({ name: "", agent: "" });
const detailData = reactive({
    name: "",
    quality: "",
    zhu: "",
    fu: "",
    skillName: "",
    img: "",
    data: [] as any[]
});
const visible = ref(false);
const visible2 = ref(false);
const data = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const agentFormRef = ref<any>();
const agentForm = reactive({
    heroId: 0,
    heroName: "",
    agent1: "",
    agent2: ""
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        let list = originalData.value;
        const res = await getFrequencyCardsAll();
        if (res.data.code == 200) {
            cardsData.value = res.data.data;
        }
        const name = formState.name.trim();
        const agent = formState.agent.trim();
        if (name) list = list.filter((item) => item.name.includes(name));
        data.value = list
            .map((item) => {
                const agentList = normalizeAgent(item.agent);
                return {
                    ...item,
                    agent: agentList,
                    cardsCount: cardsData.value.filter((e: any) => e.heroId == item.id).length,
                    img: IMG_PREFIX + item.img
                };
            })
            .filter((item) => {
                if (!agent) return true;
                return item.agent.some((a: string) => String(a).includes(agent));
            })
            .sort(
                (a, b) =>
                    (b.quality || 0) - (a.quality || 0) ||
                    b.cardsCount - a.cardsCount ||
                    String(a.name).localeCompare(String(b.name), "zh")
            );
    } finally {
        tableLoading.value = false;
    }
}

function search() {
    getList();
}

function reset() {
    formState.name = formState.agent = "";
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.quality = record.quality;
    detailData.zhu = record.zhu;
    detailData.fu = record.fu;
    detailData.skillName = record.skillName;
    detailData.img = record.img;
    detailData.data = record.data;
    visible.value = true;
}

function goFrequency(record: any) {
    const params: HeroInfoType = {
        id: record.id,
        name: record.name,
        zhu: record.zhu,
        fu: record.fu
    };
    sessionStorage.setItem("heroInfo", JSON.stringify(params));
    router.push("/cardsDetail");
}

function cancel() {
    visible.value = false;
}

function openAddAgent(record: any) {
    const list = normalizeAgent(record.agent);
    agentForm.heroId = record.id;
    agentForm.heroName = record.name;
    agentForm.agent1 = list[0] || "";
    agentForm.agent2 = list[1] || "";
    visible2.value = true;
}

function closeAddAgent() {
    visible2.value = false;
}

async function saveAgent() {
    try {
        await agentFormRef.value?.validate();
    } catch {
        return;
    }
    const agents = [agentForm.agent1.trim(), agentForm.agent2.trim()].filter(Boolean);
    if (!agents.length) {
        message.error("请至少填写一名代理人");
        return;
    }
    saving.value = true;
    try {
        const res = await addAgent({ id: agentForm.heroId, agent: agents });
        if (res.data.code == 200) {
            const row = originalData.value.find((e: any) => e.id == agentForm.heroId);
            if (row) row.agent = agents;
            message.success("代理人已保存");
            visible2.value = false;
            await getList();
        }
    } finally {
        saving.value = false;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getHeroList();
        if (res.status == 200) {
            originalData.value = res.data.data;
        }
        await getList();
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
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    margin-bottom: 10px;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.filters {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    flex: 1 1 220px;
    min-width: 0;
}

.field {
    flex: 1 1 0;
    min-width: 0;
    width: auto;
}

.actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    flex-shrink: 0;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.card {
    --accent: #94a3b8;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-left: 4px solid var(--accent);
    border-radius: 10px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

    &--q1 {
        --accent: #9ca3af;
    }

    &--q2 {
        --accent: #4f9bc4;
    }

    &--q3 {
        --accent: #8e488e;
    }

    &--q4 {
        --accent: #e67e22;
    }
}

.card-main {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.avatar {
    width: 52px;
    height: 52px;
    border-radius: 8px;
    object-fit: cover;
    display: block;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #f3f4f6;
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

.quality-chip {
    flex-shrink: 0;
    padding: 0 7px;
    border-radius: 4px;
    background: #f1f5f9;
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    line-height: 20px;
}

.line2 {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 22px;
    align-items: center;
}

.agent-tag {
    margin: 0;
    border-radius: 4px;
    font-size: 12px;
    line-height: 18px;
    padding: 0 6px;
}

.agent-empty {
    font-size: 12px;
    color: #cbd5e1;
}

.line3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
}

.stat {
    font-size: 12px;
    color: #64748b;
    font-variant-numeric: tabular-nums;
}

.ops {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;

    :deep(.ant-btn) {
        height: 26px;
        padding: 0 8px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        color: #374151;
        background: #fff;

        &:hover {
            color: #4f9bc4;
            border-color: #4f9bc4;
        }
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 760px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .list {
        gap: 10px;
    }

    .card {
        padding: 12px 14px;
    }

    .avatar {
        width: 56px;
        height: 56px;
    }
}
</style>
