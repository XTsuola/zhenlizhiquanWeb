<template>
    <div class="myTable">
        <a-table :columns="prop.columnsData" :data-source="prop.dataSource" :pagination="false"
            :row-class-name="rowClass ? rowClassName : ''" :loading="loading" bordered>
            <template #bodyCell="{ column, index, record }">
                <span v-if="column.key === 'headImg'" slot="pic">
                    <img style="width: 50px;height: 50px;" :src="record.img" />
                </span>
                <span v-if="column.key === 'headImg2'" slot="pic" @click="emits('detail', 3, record)">
                    <img style="width: 50px;height: 50px;" :src="record.img" />
                </span>
                <span v-if="column.key === 'headImg3'" slot="pic">
                    <a-badge :count="record.cardsCount" :number-style="{ backgroundColor: 'skyblue' }" show-zero>
                        <img style="width: 50px;height: 50px;" :src="record.img" />
                    </a-badge>
                </span>
                <span v-if="column.key === 'grade'">
                    <a-tag :color="getGradeColor(record.grade)">{{ getGradeName(record.grade) }}</a-tag>
                </span>
                <span v-if="column.key === 'tag'">
                    <a-tag v-for="e in record.tag" style="margin-bottom: 5px;">{{ getTagName(e) }}</a-tag>
                </span>
                <span v-if="column.key === 'skillSign'">
                    <a-tag v-for="item in record.skillSign" :color="item.color">{{ item.name
                    }}</a-tag>
                </span>
                <span v-if="column.key === 'now'">
                    <div>人次：</div>
                    <div>{{ record.now[0] }}</div>
                    <div>胜率：</div>
                    <div>{{ record.now[1].toFixed(2) }}%</div>
                </span>
                <span v-if="column.key === 'last'">
                    <div>人次：</div>
                    <div>{{ record.last[0] }}</div>
                    <div>胜率：</div>
                    <div>{{ record.last[1].toFixed(2) }}%</div>
                </span>
                <span v-if="column.key === 'change'">
                    <div>人次：</div>
                    <div>{{ record.now[0] >= record.last[0] ? "+" + (record.now[0] - record.last[0]) : "-" +
                        (record.last[0] - record.now[0]) }}</div>
                    <div>胜率：</div>
                    <div>{{ record.now[1] >= record.last[1] ? "+" + (record.now[1] - record.last[1]).toFixed(2) : "-"
                        +
                        (record.last[1] - record.now[1]).toFixed(2) }}%</div>
                </span>
                <template v-if="column.key === 'action'">
                    <span class="action">
                        <span v-for="(item, index2) in (column as any).list" class="action">
                            <span v-if="item == 'grade'">
                                <span class="pointer" @click="emits('grade', record)">
                                    <a-button type="link" size="small">评级</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'tag'">
                                <span class="pointer" @click="emits('tag', record)">
                                    <a-button type="link" size="small">标签</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'look'">
                                <span class="pointer" @click="emits('look', record)">
                                    <a-button type="link" size="small">查看</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'detail'">
                                <span class="pointer" @click="emits('detail', 3, record)">
                                    <a-button type="link" size="small">详情</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'edit'">
                                <span class="pointer" @click="emits('edit', 2, record, index)">
                                    <a-button type="link" size="small">修改</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'skill'">
                                <span class="pointer" @click="emits('detail', 3, record)">
                                    <a-button type="link" size="small">技能</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'together'">
                                <span class="pointer" @click="emits('together', record)">
                                    <a-button type="link" size="small">共创</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'level'">
                                <span class="pointer" @click="emits('level', 1, record)">
                                    <a-button type="link" size="small">等级</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'star'">
                                <span class="pointer" @click="emits('star', 2, record)">
                                    <a-button type="link" size="small">星级</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'frequency'">
                                <span class="pointer" @click="emits('frequency', record)">
                                    <a-button type="link" size="small">卡组</a-button>
                                </span>
                            </span>
                            <span v-if="item == 'delete'">
                                <a-popconfirm title="确定删除该数据吗?" ok-text="确定" cancel-text="取消"
                                    @confirm=" emits('delete', record.id)">
                                    <a-button type="link" danger size="small">删除</a-button>
                                </a-popconfirm>
                            </span>
                            <a-divider v-if="index2 != (column as any).list.length - 1" type="vertical" />
                        </span>
                    </span>
                </template>
            </template>
        </a-table>
        <a-pagination v-if="prop.pagination" class="pagination" v-model:current="prop.pagination.currentPage"
            v-model:page-size="prop.pagination.pageSize" :pageSizeOptions="['10', '15', '20', '50', '100']"
            :total="prop.pagination.total" :show-total="(total: any) => `共 ${total} 条`"
            @change="emits('changePage', prop.pagination.currentPage, prop.pagination.pageSize)" />
    </div>
</template>
<script lang="ts" setup>
import { tabList } from "@/utils/func";
import { Table as aTable } from "ant-design-vue";

interface Pagination {
    currentPage: number
    pageSize: number
    total: number
}

interface Prop {
    dataSource: any
    columnsData: any
    pagination?: Pagination | boolean | any
    rowClass?: any
    loading?: boolean
}

const prop = defineProps<Prop>();
const emits = defineEmits(["detail", "edit", "delete", "changePage", "download", "resetPassword", "changeAdmin", "look", "grade", "tag", "frequency", "together", "level", "star"]);

function rowClassName(record: any) {
    if (record.no) {
        const num = record.no % 100;
        if (num == 5 || num == 6) {
            return "orange";
        } else if (num == 7 || record.shenglv < 0.4) {
            return "purple";
        } else if (num == 8 || record.shenglv >= 0.6) {
            return "red";
        } else {
            return "";
        }
    } else if (record.quality) {
        const quality = record.quality;
        if (quality == 4) {
            return "orange";
        } else if (quality == 3) {
            return "purple";
        } else if (quality == 2) {
            return "blue";
        } else {
            return "";
        }
    } else {
        return "";
    }
}
const gradeList = [{
    label: "SS真神",
    value: 6,
    color: "#000000"
}, {
    label: "S顶级",
    value: 5,
    color: "#ff0000"
}, {
    label: "A+超级",
    value: 4,
    color: "#ff6633"
}, {
    label: "A高级",
    value: 3,
    color: "#ff6633"
}, {
    label: "B能带",
    value: 2,
    color: "#8e488e"
}, {
    label: "C普通",
    value: 1,
    color: "#2db7f5"
}, {
    label: "D垃圾",
    value: 0,
    color: "#87d068"
}];

function getGradeName(grade: string) {
    if (grade != "") {
        let nowGrade = JSON.parse(grade);
        return gradeList.find(e => e.value == nowGrade[0])?.label;
    } else {
        return "暂无";
    }
}

function getGradeColor(grade: string) {
    if (grade != "") {
        let nowGrade = JSON.parse(grade);
        return gradeList.find(e => e.value == nowGrade[0])?.color;
    } else {
        return "#cccccc";
    }
}

function getTagName(tag: any) {
    return tabList.find(e => e.value == tag)?.label;
}

</script>
<style lang="less" scoped>
.action {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
}

.pointer {
    cursor: pointer;
}

.pagination {
    text-align: right;
    margin-top: 20px;
}

:deep(.orange) {
    background-color: #f7e5c0 !important;
}

:deep(.purple) {
    background-color: #f3baf3 !important;
}

:deep(.blue) {
    background-color: #b2dbf7 !important;
}

:deep(.red) {
    background-color: #fdc5c5 !important;
}
</style>