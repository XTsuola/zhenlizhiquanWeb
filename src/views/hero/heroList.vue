<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄统计</h1>
            <div class="filters">
                <a-input v-model:value="formState.name" allow-clear placeholder="英雄名称" class="field"
                    @pressEnter="search" />
                <a-input v-model:value="formState.agent" allow-clear placeholder="代理人" class="field"
                    @pressEnter="search" />
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" :scrollX="false" :loading="tableLoading"
                @detail="showModal" @frequency="goFrequency" @add="openAddAgent" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false"
            :width="isNarrow ? '92%' : 520" centered>
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose title="添加代理人" :maskClosable="false"
            :width="isNarrow ? '92%' : 480" centered @cancel="closeAddAgent">
            <a-form ref="agentFormRef" :model="agentForm" :label-col="{ span: isNarrow ? 24 : 5 }"
                :wrapper-col="{ span: isNarrow ? 24 : 19 }" :layout="isNarrow ? 'vertical' : 'horizontal'"
                autocomplete="off">
                <a-form-item label="英雄">
                    <a-input :value="agentForm.heroName" disabled />
                </a-form-item>
                <a-form-item label="代理人1" name="agent1" :rules="[{ required: true, message: '请输入代理人1' }]">
                    <a-input v-model:value="agentForm.agent1" allow-clear placeholder="代理人1" :maxlength="20" />
                </a-form-item>
                <a-form-item label="代理人2" name="agent2">
                    <a-input v-model:value="agentForm.agent2" allow-clear placeholder="代理人2（选填）" :maxlength="20" />
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { message } from "ant-design-vue";
import { getHeroList, addAgent } from "@/api/hero";
import { getFrequencyCardsAll } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

interface HeroInfoType {
    id: number;
    name: string;
    zhu: number;
    fu: number;
}

const Detail = defineAsyncComponent(() => import("../model/detailHero.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const isAdmin = !!sessionStorage.getItem("isAdmin");

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

const columns = computed(() => {
    const actionList = isAdmin ? ["skill", "frequency", "add"] : ["skill", "frequency"];
    return [
        { title: "头像", dataIndex: "headImg3", key: "headImg3", width: 64 },
        { title: "名称", dataIndex: "name", key: "name", ellipsis: true },
        { title: "代理人", dataIndex: "agent", key: "agent", width: 88 },
        {
            title: "操作",
            key: "action",
            list: actionList,
            width: isAdmin ? 148 : 100,
            align: "center"
        }
    ];
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
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0 0 10px;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.field {
    width: 100%;
    max-width: 200px;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.table-wrap {
    width: 100%;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1080px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .filters {
        margin-bottom: 12px;
    }
}
</style>
