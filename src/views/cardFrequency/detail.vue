<template>
    <div class="cardDetail">
        <div class="header">
            <div class="title">
                <div style="font-weight: bold;margin-bottom: 8px;">{{ head }}-卡牌详情</div>
                <div>
                    <a-button type="primary" style="margin-right: 10px;" @click="goFrequencyList">卡牌频率</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData" @detail="showModal" @edit="showModal"></MyTabel>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
            <a-segmented v-model:value="optionType" :options="options">
                <template #label="{ value: val, payload = {} }">
                    <div style="padding: 4px 4px">
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
                <a-badge :count="card.level" v-for="card in cardsImgData" style="margin: 4px;"
                    :numberStyle="{ fontSize: '10px' }">
                    <img style="width: 40px;height: 40px;border: 2px solid #cccccc;border-radius: 4px;" :src="card.img"
                        @click="showCardDetail(card)" />
                </a-badge>
            </div>
            <DetailFrequency v-if="optionType == '卡组分析'" :cardData="detailCards"></DetailFrequency>
            <div style="font-size: 12px;margin-top: 8px;">（注1：点击图标可查看详情）</div>
            <div style="font-size: 12px;margin-top: 8px;">（注2：修改卡组需要问管理员要临时密码）</div>
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose title="编辑卡组" :maskClosable="false">
            <EditFrequency ref="editFrequencyRef" :cardsData="editData" :cardsLevel="editLevel" :nowStep="nowStep"
                :myObj="myObj" :editType="3">
            </EditFrequency>
            <template #footer>
                <a-button v-if="nowStep != 0" key="back" type="primary" @click="nowStep--">上一步</a-button>
                <a-button v-if="nowStep == 1" key="two" type="primary" @click="twoStepOk">下一步</a-button>
                <a-button v-else-if="nowStep == 2" key="three" type="primary" @click="editOk">生成并保存</a-button>
                <a-button v-else key="one" type="primary" @click="oneStepOk">下一步</a-button>
                <a-button key="back" @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { gradeData } from "@/data/z_otherData/gradeData";
import { getFrequencyCardsDetail } from "@/api/frequency";
import { SettingOutlined, TableOutlined } from '@ant-design/icons-vue';
import { CeshiDataType } from "../model/detailFrequency.vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import DetailFrequency from "../model/detailFrequency.vue";
import EditFrequency from "../model/editFrequency.vue";

const heroInfo: any = JSON.parse(sessionStorage.getItem("heroInfo") as string);
const columns = ref<any>([
    {
        title: "区服",
        dataIndex: "qu",
        key: "qu",
        width: 60,
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit"],
        width: 80
    },
]);
const tableData = ref<any>([]);
const cardMenu = ref<any>([]);
const head = ref("英雄");
const title = ref("详细信息");
const visible = ref(false);
const visible2 = ref(false);
const editFrequencyRef = ref<any>();
const nowLevel = ref(22);
const detailData = reactive<any>({
    data: []
});
const cardsImgData = ref<any>([]);
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
const optionType = ref("卡组配置");
const options = ref([
    {
        value: '卡组配置',
        payload: {
            icon: SettingOutlined,
            style: { backgroundColor: '#f56a00' },
        },
    },
    {
        value: '卡组分析',
        payload: {
            icon: TableOutlined,
            style: { backgroundColor: '#f56a00' },
        },
    },
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
const zhu = ref(0);
const fu = ref(0);
const editData = ref<string[]>([]);
const editLevel = ref<any>([]);
const nowStep = ref(0);
const password = ref("");

async function getList() {
    const res = await getFrequencyCardsDetail(heroInfo.id);
    if (res.data.code == 200) {
        tableData.value = res.data.data;
        getOriginalData();
    }
}

function showModal(type: number, record: any) {
    cardsImgData.value = [];
    optionType.value = "卡组配置"
    if (type == 3) {
        visible.value = true;
        title.value = record.name + "-卡组详情";
        detailData.data = JSON.parse(record.cards);
        for (let i = 0; i < detailData.data.length; i++) {
            cardsImgData.value.push({
                id: detailData.data[i].id,
                cardId: cardMenu.value.find((e: any) => e.name == detailData.data[i].name).id,
                name: detailData.data[i].name,
                level: detailData.data[i].level,
                img: cardMenu.value.find((e: any) => e.name == detailData.data[i].name).img
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
        editData.value = JSON.parse(record.cards).map((e: any) => e.name);
        editLevel.value = JSON.parse(record.cards).map((e: any) => e.level);
    }
}

function showCardDetail(data: any) {
    visible2.value = true;
    const obj: any = gradeData.find((e: any) => e.id == data.cardId);
    nowDetail.id = obj.id;
    nowDetail.name = obj.name;
    nowDetail.zhenyin = obj.zhenyin;
    nowDetail.quality = obj.quality;
    nowDetail.cost = obj.cost;
    nowDetail.type = obj.type;
    nowDetail.img = import.meta.env.VITE_APP_BASE_URL + "cardImg" + obj.img;
    nowDetail.grade = obj.grade;
    nowDetail.data = obj.data;
    nowLevel.value = data.level;
}

async function getOriginalData() {
    const list: any = [...gradeData.filter((e: any) => e.zhenyin == heroInfo.zhu), ...gradeData.filter((e: any) => e.zhenyin == heroInfo.fu)];
    cardMenu.value = list.map((e: any) => {
        return {
            id: e.id,
            name: e.name,
            quality: e.quality,
            cost: e.cost,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + e.img,
            zhenyin: e.zhenyin,
        }
    })
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
    head.value = heroInfo.name;
    getList();
})

</script>
<style lang="less" scoped>
.header {
    padding: 10px;
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cardList {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 15px;
    margin-bottom: 8px;
}
</style>