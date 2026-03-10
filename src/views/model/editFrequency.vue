<template>
    <div class="editFrequency">
        <a-steps style="margin-bottom: 10px;" :current="nowStep" size="small" :items="[
            {
                title: '选择卡牌',
            },
            {
                title: '配置等级',
            },
            {
                title: '生成卡组',
            },
        ]"></a-steps>
        <div v-if="prop.nowStep == 0" class="bottom10">
            <div class="cardList">
                <div class="card" v-for="value in imgData" @click="addCardOk(value)">
                    <a-tooltip>
                        <template #title>{{ value.name }}</template>
                        <img style="padding: 3px;" :class="getBgColor(value.quality)" :src="value.img" />
                    </a-tooltip>
                </div>
            </div>
            <template v-for="(tag, index) in cardsData" :key="index">
                <a-tag class="bottom5" @close.prevent="handleClose(index)" :color="getColor(tag)" closable>
                    {{ tag }}
                </a-tag>
            </template>
        </div>
        <div v-if="prop.nowStep == 1" class="bottom10">
            <div v-for="obj in myObj.cards">
                <div class="flex_center" style="margin-bottom: 15px;">
                    <span style="width: 220px;">{{ obj.name }}</span>
                    <a-input-number v-model:value="obj.level" :precision="0" :min=1 :max="22" placeholder="等级"
                        addon-after="级" />
                </div>
            </div>
        </div>
        <div v-if="prop.nowStep == 2">
            <div class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">你的名字：</span>
                <a-input v-model:value="myObj.name" placeholder="名字" />
            </div>
            <div class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">你的区服：</span>
                <a-input-number style="width: 100%;" v-model:value="myObj.qu" :precision="0" placeholder="区服" />
            </div>
            <div class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">英雄血量：</span>
                <a-input-number style="width: 100%;" v-model:value="myObj.heroLife" :precision="0" :min=1 :max="319"
                    placeholder="血量" />
            </div>
            <div v-if="prop.editType == 2" class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">你的密码：</span>
                <a-input v-model:value="myObj.password" placeholder="管理员密码" />
            </div>
            <div v-if="prop.editType == 3" class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">临时密码：</span>
                <a-input v-model:value="myObj.password" placeholder="临时密码" />
            </div>
            <div class="flex_center" style="margin-bottom: 15px;">
                <span style="width: 120px;">你的卡组：</span>
            </div>
            <div style="display: flex;justify-content: flex-start;align-items: center;flex-wrap: wrap;">
                <a-badge :count="card.level" v-for="card in cardsImgData" style="margin: 4px;"
                    :numberStyle="{ fontSize: '10px' }">
                    <img style="width: 40px;height: 40px;border: 2px solid #cccccc;border-radius: 4px;"
                        :src="card.img" />
                </a-badge>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onBeforeMount } from "vue";
import { message } from "ant-design-vue";
import { gradeData } from "@/data/z_otherData/gradeData";
import { heroTable } from "@/data/heroData/index";
import { formatDate } from "@/utils/func";
import { frequencyAdd, FrequencyAddType, frequencyUpdate, frequencyUpdateTemp, FrequencyUpdateType } from "@/api/frequency";

const prop = defineProps<{
    cardsData: string[]
    cardsLevel?: number[] | any
    nowStep: number
    myObj: any
    editType: number // 1:新增、2:管理员修改、3:用户临时修改
}>();

const zhu = ref(0);
const fu = ref(0);
const cardMenu = ref<any>([]);
const imgData = ref<any>([]);
const cardsData = ref<string[]>([]);
const cardsImgData = ref<any>([]);
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

function getBaseData() {
    imgData.value = [];
    const obj: any = heroTable.find((e: any) => e.id == prop.myObj.heroId);
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
    const quality = cardMenu.value[ind].quality;
    if (quality == 4) {
        return "orange";
    } else if (quality == 3) {
        return "purple";
    } else {
        return "blue";
    }
}

function getBgColor(quality: number) {
    if (quality == 2) {
        return "bg_blue";
    } else if (quality == 3) {
        return "bg_purple";
    } else if (quality == 4) {
        return "bg_orange";
    } else {
        return "bg_white";
    }
}

function handleClose(ind: number) {
    cardsData.value.splice(ind, 1);
    if (prop.editType == 2 || prop.editType == 3) {
        prop.cardsLevel.splice(ind, 1);
    }
};

function getCardsImg() {
    cardsImgData.value = [];
    for (let i = 0; i < myObj.cards.length; i++) {
        cardsImgData.value.push({
            id: myObj.cards[i].id,
            name: myObj.cards[i].name,
            level: myObj.cards[i].level,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + cardMenu.value.find((e: any) => e.name == myObj.cards[i].name).img
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
            let obj = cardMenu.value[ind];
            if (cnt.get(obj.name)) {
                const o: any = cnt.get(obj.name);
                o.count++;
                if (o.quality == 4) {
                    if (o.count > 1) {
                        message.error("卡组橙卡不能超过1张！");
                        return false
                    }
                } else {
                    if (o.count > 3) {
                        message.error("卡组重复卡不能超过3张！");
                        return false
                    }
                }
                cnt.set(obj.name, o);
            } else {
                cnt.set(obj.name, { quality: obj.quality, count: 1 });
            }
            if (obj.zhenyin != zhu.value) {
                fuCount++;
                if (fuCount > 15) {
                    message.error("副种族不能超过15张！");
                    return false
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
        myObj.cards = cardsData.value.map((e: any, index: number) => {
            return {
                id: index + 1,
                name: e,
                level: undefined
            };
        })
    } else if (prop.editType == 2 || prop.editType == 3) {
        myObj.cards = cardsData.value.map((e: any, index: number) => {
            return {
                id: index + 1,
                name: e,
                level: prop.cardsLevel[index]
            };
        })
    }
    return myObj.cards;
}

function twoStepOk() {
    for (let i = 0; i < myObj.cards.length; i++) {
        if (myObj.cards[i].level >= 1 && myObj.cards[i].level <= 22) {
            continue;
        } else {
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
        } else {
            return false;
        }
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
        } else {
            message.error("管理员密码错误");
            return false;
        }
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
        } else {
            message.error("临时密码错误");
            return false;
        }
    }
}

onBeforeMount(() => {
    getBaseData();
    getCardsImg();
})

defineExpose({
    oneStepOk,
    twoStepOk,
    saveOk
})

</script>
<style lang="less" scoped>
.editFrequency {
    .cardList {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin-bottom: 5px;

        .card {
            width: 45px;
            height: 45px;
            margin: 1px;

            img {
                height: 100%;
                width: 100%;
            }
        }
    }
}

.bg_white {
    background-color: #cccccc;
}

.bg_blue {
    background-color: skyblue;
}

.bg_purple {
    background-color: #f3baf3;
}

.bg_orange {
    background-color: orange;
}

.bold {
    font-weight: bold;
    margin-bottom: 8px;
}

.bottom5 {
    margin-bottom: 5px;
}

.bottom10 {
    margin-bottom: 10px;
}

.flex_center {
    display: flex;
    justify-self: flex-start;
    align-items: center;
}
</style>