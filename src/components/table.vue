<template>
    <div class="myTable">
        <div class="table-scroll">
            <a-table :columns="prop.columnsData" :data-source="prop.dataSource" :pagination="false"
                :row-class-name="prop.rowClass ? rowClassName : undefined" :loading="prop.loading"
                :scroll="{ x: 'max-content' }" size="middle" bordered>
                <template #bodyCell="{ column, index, record, text }">
                    <template v-if="column.key === 'index'">
                        {{ index + 1 }}
                    </template>
                    <template v-else-if="column.key === 'headImg'">
                        <img class="cell-img" :src="record.img" alt="" />
                    </template>
                    <template v-else-if="column.key === 'headImg2'">
                        <img class="cell-img cell-img--click" :src="record.img" alt=""
                            @click="emits('detail', 3, record)" />
                    </template>
                    <template v-else-if="column.key === 'headImg3'">
                        <a-badge :count="record.cardsCount" :number-style="{ backgroundColor: 'skyblue' }" show-zero>
                            <img class="cell-img" :src="record.img" alt="" />
                        </a-badge>
                    </template>
                    <template v-else-if="column.key === 'grade'">
                        <div v-if="getGradeName(record.grade) === 'SSS真神'" class="tagBg tagBg--grade">
                            {{ getGradeName(record.grade) }}
                        </div>
                        <a-tag v-else :color="getGradeColor(record.grade)">{{ getGradeName(record.grade) }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'score'">
                        <div v-if="record.score >= 95" class="tagBg tagBg--score">
                            {{ getScoreGradeName(record.score, record.title) }}
                        </div>
                        <a-tag v-else :color="getScoreGradeColor(record.score)">
                            {{ getScoreGradeName(record.score, record.title) }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'tag'">
                        <a-tag v-for="e in record.tag" :key="e" class="tag-item">{{ getTagName(e) }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'skillSign'">
                        <a-tag v-for="item in record.skillSign" :key="item.name" :color="item.color">{{ item.name
                            }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'now'">
                        <div class="stat-cell">
                            <div>人次：{{ record.now[0] }}</div>
                            <div>胜率：{{ formatRate(record.now[1]) }}%</div>
                        </div>
                    </template>
                    <template v-else-if="column.key === 'last'">
                        <div class="stat-cell">
                            <div>人次：{{ record.last[0] }}</div>
                            <div>胜率：{{ formatRate(record.last[1]) }}%</div>
                        </div>
                    </template>
                    <template v-else-if="column.key === 'change'">
                        <div class="stat-cell">
                            <div>人次：{{ formatDiff(record.now[0], record.last[0]) }}</div>
                            <div>胜率：{{ formatDiff(record.now[1], record.last[1], true) }}%</div>
                        </div>
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <div class="action">
                            <template v-for="(item, index2) in getActionList(column)" :key="item">
                                <a-popconfirm v-if="item === 'delete'" title="确定删除该数据吗?" ok-text="确定" cancel-text="取消"
                                    @confirm="emits('delete', record.id)">
                                    <a-button type="link" danger size="small">删除</a-button>
                                </a-popconfirm>
                                <a-button v-else type="link" size="small" @click="onAction(item, record, index)">
                                    {{ actionLabel[item] || item }}
                                </a-button>
                                <a-divider v-if="index2 !== getActionList(column).length - 1" type="vertical" />
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        {{ text }}
                    </template>
                </template>
            </a-table>
        </div>
        <a-pagination v-if="prop.pagination" class="pagination" v-model:current="prop.pagination.currentPage"
            v-model:page-size="prop.pagination.pageSize" :page-size-options="['10', '15', '20', '50', '100']"
            :total="prop.pagination.total" :show-total="(total: number) => `共 ${total} 条`" :show-size-changer="true"
            responsive @change="onPageChange" />
    </div>
</template>

<script lang="ts" setup>
import { tabList } from "@/utils/func";
import { Table as aTable } from "ant-design-vue";

interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}

interface Prop {
    dataSource: any;
    columnsData: any;
    pagination?: Pagination | boolean | any;
    rowClass?: any;
    loading?: boolean;
}

type ActionKey = "grade" | "tag" | "look" | "detail" | "edit" | "skill" | "together" | "level" | "star" | "frequency" | "delete";

const prop = defineProps<Prop>();
const emits = defineEmits(["detail", "edit", "delete", "changePage", "download", "resetPassword", "changeAdmin", "look", "grade", "tag", "frequency", "together", "level", "star"]);
const actionLabel: Record<string, string> = {
    grade: "评级",
    tag: "标签",
    look: "查看",
    detail: "详情",
    edit: "修改",
    skill: "技能",
    together: "共创",
    level: "等级",
    star: "星级",
    frequency: "卡组",
    delete: "删除"
};
const gradeList = [
    { label: "SSS真神", value: 6, color: "#000000" },
    { label: "SS神话", value: 5, color: "#000000" },
    { label: "S顶级", value: 4, color: "#ff0000" },
    { label: "A高级", value: 3, color: "#ff6633" },
    { label: "B能带", value: 2, color: "#8e488e" },
    { label: "C普通", value: 1, color: "#2db7f5" },
    { label: "D垃圾", value: 0, color: "#87d068" }
];
const scoreGradeList = [
    { label: "神话", value: 95, level: "SSS", color: "#000000" },
    { label: "传说", value: 90, level: "SS", color: "#000000" },
    { label: "话痨", value: 85, level: "S", color: "#ff0000" },
    { label: "活跃", value: 80, level: "A", color: "#ff6633" },
    { label: "吐槽", value: 70, level: "B", color: "#8e488e" },
    { label: "冒泡", value: 60, level: "C", color: "#2db7f5" },
    { label: "潜水", value: 0, level: "D", color: "#87d068" }
];

function getActionList(column: any): ActionKey[] {
    return (column?.list || []) as ActionKey[];
}

function onAction(item: ActionKey, record: any, index: number) {
    switch (item) {
        case "grade":
            emits("grade", record);
            break;
        case "tag":
            emits("tag", record);
            break;
        case "look":
            emits("look", record);
            break;
        case "detail":
        case "skill":
            emits("detail", 3, record);
            break;
        case "edit":
            emits("edit", 2, record, index);
            break;
        case "together":
            emits("together", record);
            break;
        case "level":
            emits("level", 1, record);
            break;
        case "star":
            emits("star", 2, record);
            break;
        case "frequency":
            emits("frequency", record);
            break;
    }
}

function onPageChange(page: number, pageSize: number) {
    emits("changePage", page, pageSize);
}

function rowClassName(record: any) {
    if (record.no) {
        const num = record.no % 100;
        if (num === 5 || num === 6) return "orange";
        if (num === 7 || record.shenglv < 0.4) return "purple";
        if (num === 8 || record.shenglv >= 0.6) return "red";
        return "";
    }
    if (record.quality) {
        if (record.quality === 4) return "orange";
        if (record.quality === 3) return "purple";
        if (record.quality === 2) return "blue";
        return "";
    }
    return "";
}

function parseGrade(grade: string) {
    if (!grade) return null;
    try {
        const nowGrade = JSON.parse(grade);
        return gradeList.find((e) => e.value == nowGrade[0]) || null;
    } catch {
        return null;
    }
}

function getGradeName(grade: string) {
    return parseGrade(grade)?.label || "暂无";
}

function getGradeColor(grade: string) {
    return parseGrade(grade)?.color || "#cccccc";
}

function getScoreGrade(score: number) {
    return scoreGradeList.find((e) => score >= e.value) || scoreGradeList[scoreGradeList.length - 1];
}

function getScoreGradeName(score: number, title?: string) {
    const item = getScoreGrade(score);
    return item.level + (title || item.label);
}

function getScoreGradeColor(score: number) {
    return getScoreGrade(score).color;
}

function getTagName(tag: any) {
    return tabList.find((e) => e.value == tag)?.label;
}

function formatRate(value: number) {
    return Number(value || 0).toFixed(2);
}

function formatDiff(now: number, last: number, isRate = false) {
    const diff = now - last;
    const abs = isRate ? Math.abs(diff).toFixed(2) : Math.abs(diff);
    return `${diff >= 0 ? "+" : "-"}${abs}`;
}
</script>

<style lang="less" scoped>
.myTable {
    width: 100%;
}

.table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 10px;
    border: 1px solid #e8ebf0;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.cell-img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    display: block;
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &--click {
        cursor: pointer;

        &:hover {
            transform: scale(1.06);
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14);
        }
    }
}

.action {
    display: inline-flex;
    justify-content: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
    gap: 0;

    :deep(.ant-btn-link) {
        padding-inline: 4px;
        height: auto;
        font-weight: 500;
    }

    :deep(.ant-divider-vertical) {
        margin-inline: 2px;
        border-color: #e5e7eb;
        top: 0;
    }
}

.pagination {
    text-align: right;
    margin-top: 14px;

    @media (max-width: 576px) {
        text-align: center;

        :deep(.ant-pagination-options) {
            display: inline-block;
            margin-top: 8px;
        }
    }
}

.tag-item {
    margin-bottom: 4px;
    border-radius: 4px;
}

.stat-cell {
    line-height: 1.55;
    white-space: nowrap;
    font-size: 13px;
    color: #374151;
}

.tagBg {
    margin: 0;
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

    &--grade {
        width: 60px;
        min-height: 22px;
    }

    &--score {
        width: 88px;
        min-height: 22px;
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

:deep(.orange) {
    background-color: #faf0dc !important;
}

:deep(.purple) {
    background-color: #f6e4f6 !important;
}

:deep(.blue) {
    background-color: #e4f2fb !important;
}

:deep(.red) {
    background-color: #fdeaea !important;
}

:deep(.ant-table) {
    font-size: 13px;
    color: #1f2937;
    background: transparent;
}

:deep(.ant-table-container) {
    border-inline-start: none !important;
    border-top: none !important;
}

:deep(.ant-table-thead > tr > th) {
    background: #f7f8fa !important;
    color: #4b5563;
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid #e8ebf0 !important;
    padding: 10px 12px !important;
}

:deep(.ant-table-tbody > tr > td) {
    vertical-align: middle;
    border-bottom: 1px solid #f0f2f5 !important;
    padding: 10px 12px !important;
}

:deep(.ant-table-tbody > tr:last-child > td) {
    border-bottom: none !important;
}

:deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f8fc !important;
}

:deep(.ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > thead > tr > th),
:deep(.ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > tbody > tr > td) {
    border-inline-end: 1px solid #eef1f5;
}

:deep(.ant-table-cell-row-hover) {
    background: #f5f8fc !important;
}

:deep(.ant-tag) {
    border-radius: 4px;
    margin-inline-end: 4px;
}

@media (prefers-reduced-motion: reduce) {
    .tagBg {
        animation: none;
        background: #aa8b3b;
    }

    .cell-img {
        transition: none;
    }
}
</style>
