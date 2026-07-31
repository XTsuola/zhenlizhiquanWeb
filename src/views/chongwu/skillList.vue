<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="formState.sign" allow-clear placeholder="标签" class="field" show-search
                    :filter-option="filterOption">
                    <a-select-option v-for="item in skillSign" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="data" :loading="tableLoading" @detail="showModal" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
            <div class="detail-name">技能名称：{{ detailData.name }}</div>
            <div class="detail-tags">
                <a-tag v-for="(item, idx) in detailData.data" :key="idx" class="detail-tag"
                    :color="levelList[item.level]">
                    {{ item.value }}
                </a-tag>
            </div>
            <template #footer>
                <a-button @click="cancel">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const skillSign = [
    { label: "回血", value: "回血", color: "#ffa500" },
    { label: "洞察", value: "洞察", color: "#800080" },
    { label: "护甲", value: "护甲", color: "#000000" },
    { label: "传承", value: "传承", color: "#9bc505" },
    { label: "召唤", value: "召唤", color: "#808080" },
    { label: "亡语", value: "亡语", color: "#000000" },
    { label: "直伤", value: "直伤", color: "#c01b10" },
    { label: "坠落伤害", value: "坠落伤害", color: "#c01b10" },
    { label: "投射伤害", value: "投射伤害", color: "#c01b10" },
    { label: "冰封", value: "冰封", color: "#03a1c9" },
    { label: "攻击+", value: "攻击+", color: "#c01b10" },
    { label: "生命+", value: "生命+", color: "#008000" },
    { label: "攻击-", value: "攻击-", color: "#c01b10" },
    { label: "生命-", value: "生命-", color: "#008000" },
    { label: "协战", value: "协战", color: "#ffa500" },
    { label: "魔防", value: "魔防", color: "#800080" },
    { label: "神佑", value: "神佑", color: "#9bc505" },
    { label: "魔免", value: "魔免", color: "#800080" },
    { label: "魂歌", value: "魂歌", color: "#ffa500" },
    { label: "磐龙", value: "磐龙", color: "#804400" },
    { label: "回命", value: "回命", color: "#c01b10" },
    { label: "践踏", value: "践踏", color: "#804400" },
    { label: "先攻", value: "先攻", color: "#ffa500" },
    { label: "穿透", value: "穿透", color: "#800080" },
    { label: "隐形", value: "隐形", color: "#800080" },
    { label: "禁疗", value: "禁疗", color: "#c01b10" },
    { label: "禁止攻击", value: "禁止攻击", color: "#808080" }
];
const skillColorMap = Object.fromEntries(skillSign.map((item) => [item.label, item.color]));
const levelList = ["#c0beba", "#808080", "#03a1c9", "#800080", "#ffa500", "#c01b10", "#000000", "#c0c018"];
const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const formState = reactive<{ sign: string | undefined }>({
    sign: undefined
});
const detailData = reactive<{ name: string; data: any[] }>({
    name: "",
    data: []
});
const visible = ref(false);
const data = ref<any[]>([]);
const columns = [
    { title: "名称", dataIndex: "name", key: "name", width: 160 },
    { title: "标签", dataIndex: "skillSign", key: "skillSign" },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 72
    }
];

function filterOption(input: string, option: any) {
    return String(option?.value ?? "").includes(input);
}

function getList() {
    if (formState.sign) {
        data.value = originalData.value.filter((item) =>
            item.skillSign.some((e: any) => e.name === formState.sign)
        );
    } else {
        data.value = originalData.value;
    }
}

function search() {
    getList();
}

function reset() {
    formState.sign = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    detailData.name = record.name;
    detailData.data = record.data;
    visible.value = true;
}

function cancel() {
    visible.value = false;
}

async function loadSkillData() {
    tableLoading.value = true;
    try {
        const { chongwuSkill } = await import("@/data/chongwuData/z_skill");
        originalData.value = chongwuSkill.map((e: any) => ({
            name: e.name,
            skillSign: e.type.map((v: string) => ({
                name: v,
                color: skillColorMap[v] || "#808080"
            })),
            data: e.data
        }));
        getList();
    } finally {
        tableLoading.value = false;
    }
}

onMounted(() => {
    loadSkillData();
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
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
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
}

.field {
    width: 100%;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.detail-name {
    font-weight: 700;
    margin-bottom: 8px;
    color: #1f2937;
}

.detail-tags {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}

.detail-tag {
    margin: 0 !important;
    white-space: normal;
    max-width: 100%;
    height: auto;
    line-height: 1.5;
    padding: 4px 8px;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .filters {
        grid-template-columns: minmax(0, 280px);
        margin-bottom: 12px;
    }
}
</style>
