<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">管理卡组</h1>
            <div class="actions">
                <a-input-password v-model:value="myObj.password" class="pwd-field" placeholder="管理员密码" allow-clear />
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="toolbar filters-bar">
            <a-select v-model:value="hero" allow-clear placeholder="请选择英雄" class="field">
                <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                    {{ item.label }}
                </a-select-option>
            </a-select>
            <div class="actions">
                <a-button type="primary" :loading="tableLoading" @click="getList">查询</a-button>
                <a-button @click="reset">清空</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :scrollX="tableScrollX" :loading="tableLoading"
                @detail="showModal" @edit="showModal" @delete="deleteOk" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false"
            :width="isNarrow ? '94%' : 720" centered>
            <a-segmented v-model:value="optionType" :options="options" block>
                <template #label="{ value: val, payload = {} }">
                    <div class="seg-label">
                        <template v-if="payload.icon">
                            <a-avatar :src="payload.src" :style="payload.style">
                                <template #icon>
                                    <component :is="payload.icon" />
                                </template>
                                {{ payload.content }}
                            </a-avatar>
                        </template>
                        <template v-else>
                            <a-avatar :src="payload.src" :style="payload.style">
                                {{ payload.content }}
                            </a-avatar>
                        </template>
                        <div>{{ val }}</div>
                    </div>
                </template>
            </a-segmented>
            <div v-if="optionType == '卡组配置'" class="cardList">
                <a-badge v-for="card in cardsImgData" :key="`${card.id}-${card.level}`" :count="card.level"
                    class="card-badge" :numberStyle="getBadgeStyle(card.quality)">
                    <img class="card-thumb" :class="getBgColor(card.quality)" :src="card.img" alt="" />
                </a-badge>
            </div>
            <DetailCard v-if="optionType == '卡组分析'" :cardData="detailCards" />
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose :title="title" :maskClosable="false"
            :width="isNarrow ? '94%' : 720" centered>
            <EditFrequency ref="editFrequencyRef" :cardsData="editData" :cardsLevel="editLevel" :nowStep="nowStep"
                :myObj="myObj" :editType="2" />
            <template #footer>
                <a-button v-if="nowStep != 0" type="primary" @click="nowStep--">上一步</a-button>
                <a-button v-if="nowStep == 1" type="primary" @click="twoStepOk">下一步</a-button>
                <a-button v-else-if="nowStep == 2" type="primary" @click="editOk">生成并保存</a-button>
                <a-button v-else type="primary" @click="oneStepOk">下一步</a-button>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { SettingOutlined, TableOutlined } from "@ant-design/icons-vue";
import { heroTable } from "@/data/heroData/index";
import { frequencyDelete, getFrequencyCardsAll } from "@/api/frequency";
import { CeshiDataType } from "../model/detailFrequency.vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import DetailCard from "../model/detailFrequency.vue";
import EditFrequency from "../model/editFrequency.vue";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
const hero = ref<any>(undefined);
const heroSelect = heroTable.map((e: any) => ({
    label: e.name,
    value: e.id
}));
const isNarrow = ref(window.innerWidth < 576);
const tableScrollX = 720;
const columns = computed(() => [
    { title: "区服", dataIndex: "qu", key: "qu", width: 64 },
    { title: "名称", dataIndex: "name", key: "name", width: 120 },
    { title: "英雄", dataIndex: "heroName", key: "heroName", width: 140 },
    { title: "时间", dataIndex: "time", key: "time", width: 158 },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit", "delete"],
        width: isNarrow.value ? 158 : 168,
        // 手机端取消 fixed，避免挡住横向滑动
        ...(isNarrow.value ? {} : { fixed: "right" as const }),
        align: "center"
    }
]);
const tableLoading = ref(false);
const tableData = ref<any[]>([]);
const cardMenu = ref<any[]>([]);
const title = ref("详细信息");
const visible = ref(false);
const visible2 = ref(false);
const myObj = reactive<any>({
    id: 0,
    heroId: undefined,
    heroLife: undefined,
    name: "",
    qu: undefined,
    password: "",
    cards: []
});
const editFrequencyRef = ref<any>();
const nowStep = ref(0);
const detailData = reactive<any>({ data: [] });
const zhu = ref(0);
const fu = ref(0);
const editData = ref<string[]>([]);
const editLevel = ref<any[]>([]);
const cardsImgData = ref<any[]>([]);
const detailCards = reactive<CeshiDataType>({
    qu: 1,
    name: "",
    hero: { id: 0, name: "", life: 0 },
    cardList: [],
    cardLevel: []
});
const optionType = ref("卡组配置");
const options = ref([
    {
        value: "卡组配置",
        payload: {
            icon: SettingOutlined,
            style: { backgroundColor: "#4a7c9b" }
        }
    },
    {
        value: "卡组分析",
        payload: {
            icon: TableOutlined,
            style: { backgroundColor: "#4a7c9b" }
        }
    }
]);

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function getBgColor(quality: number) {
    if (quality == 2) return "bg_blue";
    if (quality == 3) return "bg_purple";
    if (quality == 4) return "bg_orange";
    return "bg_white";
}

function getBadgeStyle(quality: number) {
    const base = { fontSize: "10px", fontWeight: 700, boxShadow: "none" };
    if (quality == 4) return { ...base, backgroundColor: "#e67e22", color: "#fff" };
    if (quality == 3) return { ...base, backgroundColor: "#8e488e", color: "#fff" };
    if (quality == 2) return { ...base, backgroundColor: "#4f9bc4", color: "#fff" };
    return { ...base, backgroundColor: "#e5e7eb", color: "#374151" };
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getFrequencyCardsAll();
        if (res.data.code == 200) {
            const list = hero.value
                ? res.data.data.filter((e: any) => e.heroId == hero.value)
                : res.data.data;
            tableData.value = list
                .map((e: any) => ({
                    ...e,
                    heroName: heroTable.find((h: any) => h.id == e.heroId)?.name || "-"
                }))
                .sort(
                    (a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()
                );
        }
    } finally {
        tableLoading.value = false;
    }
}

async function showModal(type: number, record: any) {
    nowStep.value = 0;
    if (type == 3) {
        visible.value = true;
        title.value = record.name + "-卡组详情";
        const obj: any = heroTable.find((e: any) => e.id == record.heroId);
        zhu.value = obj.zhu;
        fu.value = obj.fu;
        const { gradeData } = await import("@/data/z_otherData/gradeData");
        const list: any = [
            ...gradeData.filter((e: any) => e.zhenyin == zhu.value),
            ...gradeData.filter((e: any) => e.zhenyin == fu.value)
        ];
        cardMenu.value = list.map((e: any) => ({
            id: e.id,
            name: e.name,
            img: e.img,
            zhenyin: e.zhenyin,
            quality: e.quality
        }));
        cardsImgData.value = [];
        optionType.value = "卡组配置";
        detailData.data = JSON.parse(record.cards);
        for (let i = 0; i < detailData.data.length; i++) {
            const matched = cardMenu.value.find((e: any) => e.name == detailData.data[i].name);
            cardsImgData.value.push({
                id: detailData.data[i].id,
                name: detailData.data[i].name,
                level: detailData.data[i].level,
                quality: matched?.quality,
                img: matched ? IMG_PREFIX + matched.img : ""
            });
        }
        detailCards.qu = record.qu;
        detailCards.name = record.name;
        detailCards.cardList = detailData.data.map((e: any) => e.name);
        detailCards.cardLevel = detailData.data.map((e: any) => e.level);
        detailCards.hero.id = record.heroId;
        detailCards.hero.life = record.heroLife;
    } else if (type == 2) {
        visible2.value = true;
        title.value = "编辑卡组";
        myObj.id = record.id;
        myObj.heroId = record.heroId;
        myObj.heroLife = record.heroLife;
        myObj.name = record.name;
        myObj.qu = record.qu;
        const cards = JSON.parse(record.cards);
        editData.value = cards.map((e: any) => e.name);
        editLevel.value = cards.map((e: any) => e.level);
    }
}

function oneStepOk() {
    const result = editFrequencyRef.value?.oneStepOk();
    if (result) {
        nowStep.value = 1;
        myObj.cards = result;
    }
}

function twoStepOk() {
    const result = editFrequencyRef.value?.twoStepOk();
    if (result) {
        nowStep.value = 2;
        myObj.cards = result;
    }
}

async function editOk() {
    try {
        const result = await editFrequencyRef.value?.saveOk();
        if (result) {
            visible2.value = false;
            nowStep.value = 0;
            getList();
        }
    } catch (_) { }
}

async function deleteOk(id: number) {
    const res = await frequencyDelete({ id, password: myObj.password });
    if (res.data.code == 200) {
        message.success("删除成功");
    } else {
        message.error("删除失败");
    }
    getList();
}

function reset() {
    hero.value = undefined;
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
    flex-wrap: wrap;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filters-bar {
    justify-content: flex-start;
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
    align-items: center;
}

.pwd-field {
    width: 140px;
}

.field {
    width: min(100%, 220px);
}

.table-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
}

.seg-label {
    padding: 4px;
}

.cardList {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-top: 12px;
    margin-bottom: 8px;
}

@media (min-width: 768px) {
    .cardList {
        grid-template-columns: repeat(10, 1fr);
    }
}

.card-badge {
    margin: 0;
    width: 100%;
}

.card-thumb {
    width: 100%;
    aspect-ratio: 1;
    height: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    object-fit: cover;
    display: block;
    padding: 2px;
    box-sizing: border-box;
}

.bg_white {
    background-color: #e5e7eb;
}

.bg_blue {
    background-color: #bae6fd;
}

.bg_purple {
    background-color: #f3baf3;
}

.bg_orange {
    background-color: #fdba74;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }
}
</style>
