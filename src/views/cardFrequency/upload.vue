<template>
    <div class="cardsUpload">
        <div class="search_select">
            <a-select style="min-width:160px;margin-right: 15px;" v-model:value="myObj.heroId" placeholder="请选择英雄">
                <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
            <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
            <a-button @click="goBack">返回</a-button>
        </div>
        <a-button style="font-weight: bold; margin-bottom: 8px;" type="primary" @click="showCardMenu">添加卡组</a-button>
        <span style="font-size: 12px;margin-left: 8px;">（添加成功去英雄查询中查看）</span>
        <div v-if="detailCardsFlag" style="margin-top: 20px;">
            <DetailCard :cardData="detailCards"></DetailCard>
        </div>
        <a-modal v-model:open="visible" destroyOnClose title="配置卡组" :maskClosable="false">
            <EditFrequency ref="editFrequencyRef" :cardsData="cardsData" :nowStep="nowStep" :myObj="myObj"
                :editType="1">
            </EditFrequency>
            <template #footer>
                <a-button v-if="nowStep != 0" key="back" type="primary" @click="nowStep--">上一步</a-button>
                <a-button v-if="nowStep == 1" key="two" type="primary" @click="twoStepOk">下一步</a-button>
                <a-button v-else-if="nowStep == 2" key="three" type="primary" @click="saveOk">生成并保存</a-button>
                <a-button v-else key="one" type="primary" @click="oneStepOk">下一步</a-button>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
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
    hero: {
        id: 0,
        name: "",
        life: 0
    },
    cardList: [],
    cardLevel: []
});
const visible = ref(false);
const editFrequencyRef = ref<any>();
const nowStep = ref(0);
const heroSelect = ref<any>([]);
const cardsData = ref<string[]>([]);
const myObj = reactive<any>({
    heroId: undefined,
    heroLife: undefined,
    name: "",
    qu: undefined,
    cards: []
});

async function getHeroData() {
    heroSelect.value = heroTable.map((e: any) => {
        return {
            label: e.name,
            value: e.id,
        }
    });
}

function showCardMenu() {
    if (!myObj.heroId) {
        message.error("请选择英雄！");
        return false;
    }
    visible.value = true;
    cardsData.value = [];
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
    getHeroData();
})

</script>
<style lang="less" scoped>
.cardsUpload {
    padding: 5px;

    .search_select {
        margin-bottom: 15px;
    }
}
</style>