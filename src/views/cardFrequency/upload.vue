<template>
    <div class="page">
        <div class="toolbar">
            <div class="filters">
                <a-select v-model:value="myObj.heroId" allow-clear show-search :filter-option="filterOption"
                    placeholder="请选择英雄" class="field">
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="actions">
                <a-button type="primary" @click="showCardMenu">添加卡组</a-button>
                <a-button @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
            <p class="hint">添加成功后可在英雄查询中查看</p>
        </div>
        <div v-if="detailCardsFlag" class="preview">
            <DetailCard :cardData="detailCards" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="配置卡组" :maskClosable="false"
            :width="isNarrow ? '94%' : 720" centered>
            <EditFrequency ref="editFrequencyRef" :cardsData="cardsData" :nowStep="nowStep" :myObj="myObj"
                :editType="1" />
            <template #footer>
                <a-button v-if="nowStep != 0" type="primary" @click="nowStep--">上一步</a-button>
                <a-button v-if="nowStep == 1" type="primary" @click="twoStepOk">下一步</a-button>
                <a-button v-else-if="nowStep == 2" type="primary" @click="saveOk">生成并保存</a-button>
                <a-button v-else type="primary" @click="oneStepOk">下一步</a-button>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { heroTable } from "@/data/heroData/index";
import { CeshiDataType } from "../model/detailFrequency.vue";
import DetailCard from "../model/detailFrequency.vue";
import EditFrequency from "../model/editFrequency.vue";
import router from "@/router";

const detailCardsFlag = ref(false);
const detailCards = reactive<CeshiDataType>({
    qu: 1,
    name: "",
    hero: { id: 0, name: "", life: 0 },
    cardList: [],
    cardLevel: []
});
const visible = ref(false);
const editFrequencyRef = ref<any>();
const nowStep = ref(0);
const heroSelect = ref<{ label: string; value: number }[]>([]);
const cardsData = ref<string[]>([]);
const isNarrow = ref(window.innerWidth < 576);
const myObj = reactive<any>({
    heroId: undefined,
    heroLife: undefined,
    name: "",
    qu: undefined,
    cards: []
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function filterOption(input: string, option: any) {
    return String(option?.label ?? option?.children ?? "").includes(input);
}

function getHeroData() {
    heroSelect.value = heroTable.map((e: any) => ({
        label: e.name,
        value: e.id
    }));
}

function showCardMenu() {
    if (!myObj.heroId) {
        message.error("请选择英雄！");
        return;
    }
    visible.value = true;
    cardsData.value = [];
    nowStep.value = 0;
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

async function saveOk() {
    try {
        const result = await editFrequencyRef.value?.saveOk();
        if (result) {
            visible.value = false;
            nowStep.value = 0;
            detailCardsFlag.value = true;
            detailCards.qu = result.qu;
            detailCards.name = result.name;
            detailCards.cardList = result.cards.map((e: any) => e.name);
            detailCards.cardLevel = result.cards.map((e: any) => e.level);
            detailCards.hero.id = result.heroId;
            detailCards.hero.life = result.heroLife;
        }
    } catch (_) { }
}

function reset() {
    myObj.heroId = undefined;
    myObj.cards = [];
    nowStep.value = 0;
    detailCardsFlag.value = false;
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getHeroData();
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
    margin-bottom: 10px;
}

.field {
    width: 100%;
    max-width: 280px;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.hint {
    margin: 10px 0 0;
    font-size: 12px;
    color: #6b7280;
}

.preview {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
