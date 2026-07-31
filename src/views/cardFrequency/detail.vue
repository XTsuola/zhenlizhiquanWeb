<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">{{ head }}-卡牌详情</h1>
            <div class="actions">
                <a-button type="primary" @click="goFrequencyList">卡牌频率</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" @detail="showModal"
                @edit="showModal" />
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
                    class="card-badge" :numberStyle="{ fontSize: '10px' }">
                    <img class="card-thumb" :src="card.img" alt="" @click="showCardDetail(card)" />
                </a-badge>
            </div>
            <DetailFrequency v-if="optionType == '卡组分析'" :cardData="detailCards" />
            <p class="note">注1：点击图标可查看详情</p>
            <p class="note">注2：修改卡组需要问管理员要临时密码</p>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose title="编辑卡组" :maskClosable="false"
            :width="isNarrow ? '94%' : 720" centered>
            <EditFrequency ref="editFrequencyRef" :cardsData="editData" :cardsLevel="editLevel" :nowStep="nowStep"
                :myObj="myObj" :editType="3" />
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
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { getFrequencyCardsDetail } from "@/api/frequency";
import { SettingOutlined, TableOutlined } from "@ant-design/icons-vue";
import { CeshiDataType } from "../model/detailFrequency.vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import DetailFrequency from "../model/detailFrequency.vue";
import EditFrequency from "../model/editFrequency.vue";

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
const heroInfo: any = readHeroInfo();
const columns = [
    { title: "区服", dataIndex: "qu", key: "qu", width: 72, ellipsis: true },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 100 },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit"],
        width: 110,
        fixed: "right",
        align: "center"
    }
];
const tableLoading = ref(false);
const tableData = ref<any[]>([]);
const cardMenu = ref<any[]>([]);
const gradeDataCache = ref<any[]>([]);
const head = ref("英雄");
const title = ref("详细信息");
const visible = ref(false);
const visible2 = ref(false);
const editFrequencyRef = ref<any>();
const nowLevel = ref(22);
const detailData = reactive<any>({ data: [] });
const cardsImgData = ref<any[]>([]);
const isNarrow = ref(window.innerWidth < 576);
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
const nowDetail = reactive<any>({
    id: undefined,
    name: "",
    zhenyin: undefined,
    quality: undefined,
    cost: undefined,
    type: undefined,
    img: "",
    grade: "",
    data: []
});
const myObj = reactive<any>({
    id: 0,
    heroId: undefined,
    heroLife: undefined,
    name: "",
    qu: undefined,
    password: "",
    cards: []
});
const editData = ref<string[]>([]);
const editLevel = ref<any[]>([]);
const nowStep = ref(0);

function readHeroInfo() {
    try {
        return JSON.parse(sessionStorage.getItem("heroInfo") || "{}");
    } catch {
        return {};
    }
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function ensureGradeData() {
    if (gradeDataCache.value.length) return gradeDataCache.value;
    const { gradeData } = await import("@/data/z_otherData/gradeData");
    gradeDataCache.value = gradeData;
    return gradeData;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getFrequencyCardsDetail(heroInfo.id);
        if (res.data.code == 200) {
            tableData.value = res.data.data;
            await getOriginalData();
        }
    } finally {
        tableLoading.value = false;
    }
}

async function showModal(type: number, record: any) {
    cardsImgData.value = [];
    optionType.value = "卡组配置";
    nowStep.value = 0;
    if (type == 3) {
        await getOriginalData();
        visible.value = true;
        title.value = record.name + "-卡组详情";
        detailData.data = JSON.parse(record.cards);
        for (const item of detailData.data) {
            const matched = cardMenu.value.find((e: any) => e.name == item.name);
            cardsImgData.value.push({
                id: item.id,
                cardId: matched?.id,
                name: item.name,
                level: item.level,
                img: matched?.img || ""
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

async function showCardDetail(data: any) {
    const gradeData = await ensureGradeData();
    const obj: any = gradeData.find((e: any) => e.id == data.cardId);
    if (!obj) return;
    nowDetail.id = obj.id;
    nowDetail.name = obj.name;
    nowDetail.zhenyin = obj.zhenyin;
    nowDetail.quality = obj.quality;
    nowDetail.cost = obj.cost;
    nowDetail.type = obj.type;
    nowDetail.img = IMG_PREFIX + obj.img;
    nowDetail.grade = obj.grade;
    nowDetail.data = obj.data;
    nowLevel.value = data.level;
    visible2.value = true;
}

async function getOriginalData() {
    const gradeData = await ensureGradeData();
    const list: any[] = [
        ...gradeData.filter((e: any) => e.zhenyin == heroInfo.zhu),
        ...gradeData.filter((e: any) => e.zhenyin == heroInfo.fu)
    ];
    cardMenu.value = list.map((e: any) => ({
        id: e.id,
        name: e.name,
        quality: e.quality,
        cost: e.cost,
        img: IMG_PREFIX + e.img,
        zhenyin: e.zhenyin
    }));
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

function goFrequencyList() {
    router.push("/cardsList");
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    head.value = heroInfo.name || "英雄";
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

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.seg-label {
    padding: 4px;
}

.cardList {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 12px;
    margin-bottom: 8px;
}

.card-badge {
    margin: 4px;
}

.card-thumb {
    width: 40px;
    height: 40px;
    border: 2px solid #cccccc;
    border-radius: 4px;
    object-fit: cover;
    display: block;
    cursor: pointer;
}

.note {
    margin: 8px 0 0;
    font-size: 12px;
    color: #6b7280;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 1100px;
        margin: 0 auto;
    }
}
</style>
