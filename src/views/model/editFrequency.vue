<template>
    <div class="editFrequency">
        <a-steps class="steps" :current="nowStep" size="small" :items="[
            { title: '选择卡牌' },
            { title: '配置等级' },
            { title: '生成卡组' }
        ]" />
        <div v-if="prop.nowStep == 0" class="step-panel">
            <div class="cardList">
                <div class="card" v-for="value in imgData" :key="value.id + value.name" @click="addCardOk(value)">
                    <a-tooltip>
                        <template #title>{{ value.name }}</template>
                        <img :class="getBgColor(value.quality)" :src="value.img" :alt="value.name" />
                    </a-tooltip>
                </div>
            </div>
            <div class="tags">
                <a-tag v-for="(tag, index) in cardsData" :key="index" class="tag" @close.prevent="handleClose(index)"
                    :color="getColor(tag)" closable>
                    {{ tag }}
                </a-tag>
            </div>
        </div>
        <div v-if="prop.nowStep == 1" class="step-panel">
            <div v-for="obj in myObj.cards" :key="obj.id" class="field-row">
                <span class="field-label field-label--wide">{{ obj.name }}</span>
                <a-input-number v-model:value="obj.level" :precision="0" :min="1" :max="24" placeholder="等级"
                    addon-after="级" style="width: 100%" />
            </div>
        </div>
        <div v-if="prop.nowStep == 2" class="step-panel">
            <div class="field-row">
                <span class="field-label">你的名字</span>
                <a-input v-model:value="myObj.name" placeholder="名字" />
            </div>
            <div class="field-row">
                <span class="field-label">你的区服</span>
                <a-input-number style="width: 100%" v-model:value="myObj.qu" :precision="0" placeholder="区服" />
            </div>
            <div class="field-row">
                <span class="field-label">英雄血量</span>
                <a-input-number style="width: 100%" v-model:value="myObj.heroLife" :precision="0" :min="1" :max="319"
                    placeholder="血量" />
            </div>
            <div v-if="prop.editType == 2" class="field-row">
                <span class="field-label">你的密码</span>
                <a-input v-model:value="myObj.password" placeholder="管理员密码" />
            </div>
            <div v-if="prop.editType == 3" class="field-row">
                <span class="field-label">临时密码</span>
                <a-input v-model:value="myObj.password" placeholder="临时密码" />
            </div>
            <div class="deck-label">你的卡组</div>
            <div class="deck">
                <a-badge v-for="card in cardsImgData" :key="card.id" :count="card.level" class="deck-item"
                    :numberStyle="{ fontSize: '10px' }">
                    <img class="deck-img" :src="card.img" :alt="card.name" />
                </a-badge>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onBeforeMount } from "vue";
import { message } from "ant-design-vue";
import { heroTable } from "@/data/heroData/index";
import { formatDate } from "@/utils/func";
import { frequencyAdd, FrequencyAddType, frequencyUpdate, frequencyUpdateTemp, FrequencyUpdateType } from "@/api/frequency";

const prop = defineProps<{
    cardsData: string[];
    cardsLevel?: number[] | any;
    nowStep: number;
    myObj: any;
    editType: number; // 1:新增、2:管理员修改、3:用户临时修改
}>();
const zhu = ref(0);
const fu = ref(0);
const cardMenu = ref<any[]>([]);
const imgData = ref<any[]>([]);
const cardsData = ref<string[]>([]);
const cardsImgData = ref<any[]>([]);
cardsData.value = prop.cardsData;
const myObj = reactive<any>({
    id: prop.myObj.id,
    heroId: prop.myObj.heroId,
    heroLife: prop.myObj.heroLife,
    name: prop.myObj.name,
    qu: prop.myObj.qu,
    cards: prop.myObj.cards,
    password: prop.myObj.password
});

async function getBaseData() {
    imgData.value = [];
    const { gradeData } = await import("@/data/z_otherData/gradeData");
    const obj: any = heroTable.find((e: any) => e.id == prop.myObj.heroId);
    zhu.value = obj.zhu;
    fu.value = obj.fu;
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
    for (let i = 0; i < cardMenu.value.length; i++) {
        imgData.value.push({
            id: cardMenu.value[i].id,
            name: cardMenu.value[i].name,
            quality: cardMenu.value[i].quality,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + cardMenu.value[i].img
        });
    }
}

function getColor(name: string) {
    const ind = cardMenu.value.findIndex((e: any) => e.name == name);
    if (ind < 0) return "blue";
    const quality = cardMenu.value[ind].quality;
    if (quality == 4) return "orange";
    if (quality == 3) return "purple";
    return "blue";
}

function getBgColor(quality: number) {
    if (quality == 2) return "bg_blue";
    if (quality == 3) return "bg_purple";
    if (quality == 4) return "bg_orange";
    return "bg_white";
}

function handleClose(ind: number) {
    cardsData.value.splice(ind, 1);
    if (prop.editType == 2 || prop.editType == 3) {
        prop.cardsLevel.splice(ind, 1);
    }
}

function getCardsImg() {
    cardsImgData.value = [];
    for (let i = 0; i < myObj.cards.length; i++) {
        const found = cardMenu.value.find((e: any) => e.name == myObj.cards[i].name);
        if (!found) continue;
        cardsImgData.value.push({
            id: myObj.cards[i].id,
            name: myObj.cards[i].name,
            level: myObj.cards[i].level,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + found.img
        });
    }
}

function addCardOk(obj: any) {
    if (cardsData.value.length < 30) {
        const cnt: any = new Map();
        let fuCount = 0;
        const tempData = [...cardsData.value, obj.name];
        for (let i = 0; i < tempData.length; i++) {
            const ind = cardMenu.value.findIndex((e: any) => e.name == tempData[i]);
            const card = cardMenu.value[ind];
            if (cnt.get(card.name)) {
                const o: any = cnt.get(card.name);
                o.count++;
                if (o.quality == 4) {
                    if (o.count > 1) {
                        message.error("卡组橙卡不能超过1张！");
                        return false;
                    }
                } else if (o.count > 3) {
                    message.error("卡组重复卡不能超过3张！");
                    return false;
                }
                cnt.set(card.name, o);
            } else {
                cnt.set(card.name, { quality: card.quality, count: 1 });
            }
            if (card.zhenyin != zhu.value) {
                fuCount++;
                if (fuCount > 15) {
                    message.error("副种族不能超过15张！");
                    return false;
                }
            }
        }
        cardsData.value.push(obj.name);
        if (prop.editType == 2 || prop.editType == 3) {
            prop.cardsLevel.push(null);
        }
    } else {
        message.error("卡组已满");
    }
}

function oneStepOk() {
    if (cardsData.value.length < 30) {
        message.error("卡组未满30张！");
        return false;
    }
    if (prop.editType == 1) {
        myObj.cards = cardsData.value.map((e: any, index: number) => ({
            id: index + 1,
            name: e,
            level: undefined
        }));
    } else if (prop.editType == 2 || prop.editType == 3) {
        myObj.cards = cardsData.value.map((e: any, index: number) => ({
            id: index + 1,
            name: e,
            level: prop.cardsLevel[index]
        }));
    }
    return myObj.cards;
}

function twoStepOk() {
    for (let i = 0; i < myObj.cards.length; i++) {
        if (!myObj.cards[i].level) {
            message.error("请输入所有的等级！");
            return false;
        }
    }
    getCardsImg();
    return myObj.cards;
}

async function saveOk() {
    if (myObj.name == "") {
        message.error("请输入名字！");
        return false;
    } else if (myObj.qu == undefined) {
        message.error("请输入区服！");
        return false;
    } else if (myObj.heroLife == undefined) {
        message.error("请输入英雄血量！");
        return false;
    }
    if (prop.editType == 1) {
        const params: FrequencyAddType = {
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date())
        };
        const res = await frequencyAdd(params);
        if (res.status == 200) {
            message.success("新增成功");
            return myObj;
        }
        return false;
    } else if (prop.editType == 2) {
        if (myObj.password == "") {
            message.error("请输入管理员密码！");
            return false;
        }
        const params: FrequencyUpdateType = {
            id: myObj.id,
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date()),
            password: myObj.password
        };
        const res = await frequencyUpdate(params);
        if (res.status == 200) {
            message.success("操作成功");
            return true;
        }
        message.error("管理员密码错误");
        return false;
    } else if (prop.editType == 3) {
        if (myObj.password == "") {
            message.error("请输入临时密码！");
            return false;
        }
        const params: FrequencyUpdateType = {
            id: myObj.id,
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date()),
            password: myObj.password
        };
        const res = await frequencyUpdateTemp(params);
        if (res.status == 200) {
            message.success("操作成功");
            return true;
        }
        message.error("临时密码错误");
        return false;
    }
}

onBeforeMount(async () => {
    await getBaseData();
    getCardsImg();
});

defineExpose({
    oneStepOk,
    twoStepOk,
    saveOk
});
</script>
<style lang="less" scoped>
.editFrequency {
    .steps {
        margin-bottom: 12px;
    }

    .step-panel {
        margin-bottom: 10px;
    }

    .cardList {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 10px;

        .card {
            width: 44px;
            height: 44px;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;

            img {
                height: 100%;
                width: 100%;
                object-fit: cover;
                display: block;
                padding: 2px;
                box-sizing: border-box;
            }
        }
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .tag {
        margin: 0;
    }

    .field-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .field-label {
        width: 88px;
        flex-shrink: 0;
        font-size: 13px;
        color: #6b7280;

        &--wide {
            width: 140px;
            color: #374151;
        }
    }

    .deck-label {
        margin-bottom: 8px;
        font-size: 13px;
        color: #6b7280;
    }

    .deck {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .deck-item {
        margin: 0;
    }

    .deck-img {
        width: 40px;
        height: 40px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        object-fit: cover;
        background: #fff;
    }
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
</style>
