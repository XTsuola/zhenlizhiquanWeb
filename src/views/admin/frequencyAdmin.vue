<template>
    <div class="cardDetail">
        <div class="header">
            <div class="title">
                <div style="font-weight: bold; margin-bottom: 8px;">管理卡组</div>
                <div>
                    <a-input style="width: 100px;margin-right: 10px;" v-model:value="myObj.password"
                        placeholder="管理员密码" />
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <div class="search">
            <div class="search_select">
                <a-select v-model:value="hero" style="width: 100%;" placeholder="请选择英雄">
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                        item.label
                    }}</a-select-option>
                </a-select>
            </div>
            <div class="search_btn">
                <a-button style="margin-right: 8px;" type="primary" @click="getList">查询</a-button>
                <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData" @detail="showModal" @edit="showModal"
            @delete="deleteOk"></MyTabel>
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
                    <img style="width: 40px;height: 40px;border: 2px solid #cccccc;border-radius: 4px;"
                        :src="card.img" />
                </a-badge>
            </div>
            <DetailCard v-if="optionType == '卡组分析'" :cardData="detailCards"></DetailCard>
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose :title="title" :maskClosable="false">
            <EditFrequency ref="editFrequencyRef" :cardsData="editData" :cardsLevel="editLevel" :nowStep="nowStep"
                :myObj="myObj" :editType="2">
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
import { message } from "ant-design-vue";
import { SettingOutlined, TableOutlined } from '@ant-design/icons-vue';
import { gradeData } from "@/data/z_otherData/gradeData";
import { heroTable } from "@/data/heroData/index";
import { frequencyDelete, getFrequencyCardsAll } from "@/api/frequency";
import { CeshiDataType } from "../model/detailFrequency.vue";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import DetailCard from "../model/detailFrequency.vue";
import EditFrequency from "../model/editFrequency.vue";

const hero = ref<any>(undefined);
const heroSelect = heroTable.map((e: any) => {
    return {
        label: e.name,
        value: e.id
    }
})
const columns = ref<any>([
    {
        title: "区服",
        dataIndex: "qu",
        key: "qu",
        width: 100,
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "英雄",
        dataIndex: "heroId",
        key: "heroId",
        width: 160,
        customRender: (opt: any) => heroTable.find((e: any) => e.id == opt.value)?.name
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 160
    },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit", "delete"],
        width: 160
    },
]);
const tableData = ref<any>([]);
const cardMenuAll = ref<any>([]);
const cardMenu = ref<any>([]);
const title = ref("详细信息");
const visible = ref(false);
const myObj = reactive<any>({
    id: 0,
    heroId: undefined,
    heroLife: undefined,
    name: "",
    qu: undefined,
    password: "",
    cards: []
});
const visible2 = ref(false);
const imgDataAll = ref<any>([]);
const editFrequencyRef = ref<any>();
const nowStep = ref(0);
const detailData = reactive<any>({
    data: []
});
const zhu = ref(0);
const fu = ref(0);
const editData = ref<string[]>([]);
const editLevel = ref<any>([]);
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

async function getList() {
    const res = await getFrequencyCardsAll();
    if (res.data.code == 200) {
        if (hero.value) {
            tableData.value = res.data.data.filter((e: any) => e.heroId == hero.value);
        } else {
            tableData.value = res.data.data;
        }
        tableData.value.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        getOriginalData();
    }
}

function showModal(type: number, record: any) {
    nowStep.value = 0;
    if (type == 3) {
        visible.value = true;
        title.value = record.name + "-卡组详情";
        const obj: any = heroTable.find((e: any) => e.id == record.heroId);
        zhu.value = obj.zhu;
        fu.value = obj.fu;
        const list: any = [...gradeData.filter((e: any) => e.zhenyin == zhu.value), ...gradeData.filter((e: any) => e.zhenyin == fu.value)];
        cardMenu.value = list.map((e: any) => {
            return {
                id: e.id,
                name: e.name,
                img: e.img,
                zhenyin: e.zhenyin,
                quality: e.quality
            }
        });
        cardsImgData.value = [];
        optionType.value = "卡组配置";
        detailData.data = JSON.parse(record.cards);
        for (let i = 0; i < detailData.data.length; i++) {
            cardsImgData.value.push({
                id: detailData.data[i].id,
                name: detailData.data[i].name,
                level: detailData.data[i].level,
                img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + cardMenu.value.find((e: any) => e.name == detailData.data[i].name).img
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

async function getOriginalData() {
    cardMenuAll.value = gradeData.map((e: any) => {
        return {
            name: e.name,
            quality: e.quality,
            cost: e.cost,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + e.img,
            zhenyin: e.zhenyin,
        }
    });
    imgDataAll.value = [];
    for (let i = 0; i < cardMenuAll.value.length; i++) {
        imgDataAll.value.push({
            id: cardMenuAll.value[i].id,
            name: cardMenuAll.value[i].name,
            quality: cardMenuAll.value[i].quality,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + cardMenuAll.value[i].img
        });
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
    const res = await frequencyDelete({ id: id, password: myObj.password });
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
    getList();
})

</script>
<style lang="less" scoped>
.cardDetail {
    .header {
        padding: 10px;

        .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    .search {
        display: flex;
        justify-content: flex-start;
        flex-wrap: nowrap;
        padding: 5px 10px;
        margin-bottom: 5px;

        .search_input {
            width: 40%;
            margin-right: 10px;
        }

        .search_select {
            width: 40%;
            margin-right: 10px;
        }

        .search_btn {
            display: flex;
            justify-content: flex-start;
            width: 40%;
        }
    }
}

.cardList {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 10px;
    margin-bottom: 8px;
}
</style>