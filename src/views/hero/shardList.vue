<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">英雄碎片</h1>
                <p class="subtitle">按品质查看升级 / 升星碎片需求</p>
            </div>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div v-if="data.length" class="list">
            <div v-for="item in sortedData" :key="item.id" class="card" :class="`card--q${item.quality}`">
                <div class="card-head">
                    <span class="quality-dot" aria-hidden="true" />
                    <div class="card-meta">
                        <span class="quality-name">{{ qualityLabel(item.quality) }}</span>
                        <span class="quality-hint">{{ qualityHint(item.quality) }}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button type="button" class="action-btn" @click="showModal(1, item)">
                        <span class="action-label">升级</span>
                        <span class="action-desc">等级碎片</span>
                    </button>
                    <button type="button" class="action-btn" @click="showModal(2, item)">
                        <span class="action-label">升星</span>
                        <span class="action-desc">星级碎片</span>
                    </button>
                </div>
            </div>
        </div>
        <a-empty v-else description="暂无数据" />
        <a-modal v-model:open="visible" destroyOnClose :title="levelTitle" :maskClosable="false" :width="modalWidth"
            centered wrap-class-name="shard-modal" :body-style="{ padding: '12px 14px' }">
            <div class="modal-panel" :class="`modal-panel--q${detailData.quality}`">
                <div class="modal-summary">
                    <span>碎片累计 <b>{{ levelSummary.suipianTotal }}</b></span>
                    <span>钻石累计 <b>{{ levelSummary.zuanshiTotal }}</b></span>
                </div>
                <a-table :columns="levelColumns" :data-source="detailData.levelData" :pagination="false" size="small"
                    bordered table-layout="fixed" row-key="name" class="shard-table">
                    <template #bodyCell="{ column, text }">
                        <template v-if="column.key === 'name'">{{ formatStageName(text) }}</template>
                        <template v-else><span class="num">{{ text }}</span></template>
                    </template>
                </a-table>
            </div>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>

        <a-modal v-model:open="visible2" destroyOnClose :title="starTitle" :maskClosable="false" :width="modalWidth"
            centered wrap-class-name="shard-modal" :body-style="{ padding: '12px 14px' }">
            <div class="modal-panel" :class="`modal-panel--q${detailData.quality}`">
                <div class="modal-summary">
                    <span>碎片累计 <b>{{ starSummary.suipianTotal }}</b></span>
                    <span>红石 <b>{{ starSummary.hongTotal }}</b></span>
                    <span>黑石 <b>{{ starSummary.heiTotal }}</b></span>
                    <span>白石 <b>{{ starSummary.baiTotal }}</b></span>
                </div>
                <a-table :columns="starColumns" :data-source="detailData.skillData" :pagination="false" size="small"
                    bordered table-layout="fixed" row-key="name" class="shard-table">
                    <template #bodyCell="{ column, text }">
                        <template v-if="column.key === 'name'">{{ formatStageName(text) }}</template>
                        <template v-else><span class="num">{{ text }}</span></template>
                    </template>
                </a-table>
            </div>
            <template #footer>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { shardData, type ShardQualityData, type ShardStarItem } from "@/data/shardData";
import router from "@/router";

interface ShardListItem extends ShardQualityData {
    id: number;
}

interface DetailDataType {
    id: number;
    quality: number;
    levelData: (ShardQualityData["levelData"][number] & { suipianTotal: number; zuanshiTotal: number })[];
    skillData: {
        name: string;
        suipian: number;
        suipianTotal: number;
        hong: number;
        hei: number;
        bai: number;
    }[];
}

const qualityList = ["白色英雄", "蓝色英雄", "紫色英雄", "橙色英雄"];
const qualityHints = ["基础品质", "精良品质", "史诗品质", "传说品质"];
const data = ref<ShardListItem[]>(
    shardData.map((item) => ({ ...item, id: item.quality }))
);
const visible = ref(false);
const visible2 = ref(false);
const levelTitle = ref("橙色英雄升级碎片需求");
const starTitle = ref("橙色英雄升星碎片需求");
const isNarrow = ref(window.innerWidth < 576);
const detailData = reactive<DetailDataType>({
    id: 0,
    quality: 0,
    levelData: [],
    skillData: []
});

const modalWidth = computed(() => (isNarrow.value ? "calc(100vw - 16px)" : 680));

const levelColumns = computed(() => [
    { title: "阶段", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 52, align: "right" as const },
    { title: "累计", dataIndex: "suipianTotal", key: "suipianTotal", width: 60, align: "right" as const },
    { title: "钻石", dataIndex: "zuanshi", key: "zuanshi", width: 52, align: "right" as const },
    { title: "累计", dataIndex: "zuanshiTotal", key: "zuanshiTotal", width: 64, align: "right" as const }
]);

const starColumns = computed(() => [
    { title: "阶段", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 48, align: "right" as const },
    { title: "累计", dataIndex: "suipianTotal", key: "suipianTotal", width: 52, align: "right" as const },
    { title: "红石", dataIndex: "hong", key: "hong", width: 48, align: "right" as const },
    { title: "黑石", dataIndex: "hei", key: "hei", width: 48, align: "right" as const },
    { title: "白石", dataIndex: "bai", key: "bai", width: 48, align: "right" as const }
]);

const levelSummary = computed(() => {
    const rows = detailData.levelData;
    if (!rows.length) return { suipianTotal: 0, zuanshiTotal: 0 };
    const last = rows[rows.length - 1];
    return { suipianTotal: last.suipianTotal, zuanshiTotal: last.zuanshiTotal };
});

const starSummary = computed(() => {
    const rows = detailData.skillData;
    if (!rows.length) return { suipianTotal: 0, hongTotal: 0, heiTotal: 0, baiTotal: 0 };
    return {
        suipianTotal: rows[rows.length - 1].suipianTotal,
        hongTotal: rows.reduce((sum, row) => sum + row.hong, 0),
        heiTotal: rows.reduce((sum, row) => sum + row.hei, 0),
        baiTotal: rows.reduce((sum, row) => sum + row.bai, 0)
    };
});

const sortedData = computed(() =>
    [...data.value].sort((a, b) => (b.quality || 0) - (a.quality || 0))
);

function qualityLabel(quality: number) {
    return qualityList[quality - 1] || "未知品质";
}

function qualityHint(quality: number) {
    return qualityHints[quality - 1] || "";
}

function formatStageName(name: string) {
    return name
        .replace(/(\d+)->(\d+)级数据/, "$1→$2")
        .replace(/(\d+)->(\d+)星数据/, "$1→$2星")
        .replace(/(.+)->(.+)数据/, "$1→$2");
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function withLevelCumulative(items: ShardQualityData["levelData"]) {
    let suipianTotal = 0;
    let zuanshiTotal = 0;
    return items.map((item) => {
        suipianTotal += item.suipian;
        zuanshiTotal += item.zuanshi;
        return { ...item, suipianTotal, zuanshiTotal };
    });
}

function buildSkillData(skinData: ShardStarItem[]) {
    let suipianTotal = 0;
    return skinData.map((item, index) => {
        suipianTotal += item.suipian;
        const [hong, hei, bai] = item.shitou;
        return {
            name: `${index}->${index + 1}星数据`,
            suipian: item.suipian,
            suipianTotal,
            hong,
            hei,
            bai
        };
    });
}

function showModal(type: number, record: ShardListItem) {
    detailData.id = record.id;
    detailData.quality = record.quality;
    if (type == 1) {
        visible.value = true;
        levelTitle.value = (qualityList[record.quality - 1] || "英雄") + "升级碎片需求";
        detailData.levelData = withLevelCumulative(record.levelData);
    } else {
        visible2.value = true;
        starTitle.value = (qualityList[record.quality - 1] || "英雄") + "升星碎片需求";
        detailData.skillData = buildSkillData(record.skinData);
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
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
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    min-width: 0;
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

.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    --accent: #94a3b8;
    --soft: #f1f5f9;

    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    border-left: 4px solid var(--accent);

    &--q1 {
        --accent: #9ca3af;
        --soft: #f3f4f6;
    }

    &--q2 {
        --accent: #4f9bc4;
        --soft: #eaf6fb;
    }

    &--q3 {
        --accent: #8e488e;
        --soft: #f8edf8;
    }

    &--q4 {
        --accent: #e67e22;
        --soft: #fff3e8;
    }
}

.card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px 8px;
}

.quality-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    flex-shrink: 0;
}

.card-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.quality-name {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
}

.quality-hint {
    font-size: 12px;
    color: #94a3b8;
}

.card-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 12px 12px;
}

.action-btn {
    appearance: none;
    border: 1px solid #e5e7eb;
    background: var(--soft);
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;

    &:hover {
        border-color: var(--accent);
        background: #fff;
    }

    &:active {
        transform: scale(0.98);
    }
}

.action-label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
}

.action-desc {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
}

.modal-panel {
    --accent: #94a3b8;
    --soft: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e8ebf0;
    border-top: 3px solid var(--accent);

    &--q1 {
        --accent: #9ca3af;
        --soft: #f3f4f6;
    }

    &--q2 {
        --accent: #4f9bc4;
        --soft: #eaf6fb;
    }

    &--q3 {
        --accent: #8e488e;
        --soft: #f8edf8;
    }

    &--q4 {
        --accent: #e67e22;
        --soft: #fff3e8;
    }
}

.modal-summary {
    display: flex;
    gap: 10px 16px;
    flex-wrap: wrap;
    margin: 0;
    padding: 8px 10px;
    background: var(--soft);
    border-bottom: 1px solid #e8ebf0;
    font-size: 12px;
    color: #64748b;

    b {
        margin-left: 4px;
        font-size: 14px;
        font-weight: 700;
        color: var(--accent);
        font-variant-numeric: tabular-nums;
    }
}

.shard-table {
    :deep(.ant-table) {
        font-size: 12px;
    }

    :deep(.ant-table-thead > tr > th) {
        background: var(--soft);
        color: #374151;
        font-weight: 600;
        padding: 6px 4px !important;
        font-size: 11px;
        line-height: 1.3;
        white-space: nowrap;
    }

    :deep(.ant-table-tbody > tr > td) {
        padding: 5px 4px !important;
        line-height: 1.35;
    }

    :deep(.ant-table-cell) {
        overflow: hidden;
    }

    .num {
        font-variant-numeric: tabular-nums;
    }
}

:global(.shard-modal .ant-modal) {
    max-width: calc(100vw - 16px);
}

/* color-mix 不支持时的兜底：圆点不加外环也没关系 */
@supports not (background: color-mix(in srgb, red 50%, blue)) {
    .quality-dot {
        box-shadow: none;
    }
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

    .list {
        gap: 12px;
    }

    .card-head {
        padding: 14px 16px 10px;
    }

    .card-actions {
        padding: 0 14px 14px;
        gap: 10px;
    }

    .action-btn {
        padding: 12px 14px;
    }
}
</style>
