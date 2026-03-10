<template>
    <div class="qingshu">
        <div class="bottom10">
            <div>牌堆区域：</div>
            <div v-if="gameStatus" class="areaCard">
                <div class="cardBox" v-for="_ in cardPile">
                    <img :src="img0" />
                </div>
            </div>
            <div v-else class="areaCard">
                <div class="cardBox" v-for="(item, _) in cardPile">
                    <img v-if="item == 1" :src="img1" />
                    <img v-if="item == 2" :src="img2" />
                    <img v-if="item == 3" :src="img3" />
                    <img v-if="item == 4" :src="img4" />
                    <img v-if="item == 5" :src="img5" />
                    <img v-if="item == 6" :src="img6" />
                    <img v-if="item == 7" :src="img7" />
                    <img v-if="item == 8" :src="img8" />
                </div>
            </div>
        </div>
        <div class="bottom10">
            <div>干扰区域：</div>
            <div v-if="gameStatus" class="areaCard">
                <div class="cardBox" v-for="(item, index) in disPile" @click="getNowCard(item, index)">
                    <img :src="img0" />
                </div>
            </div>
            <div v-else class="areaCard">
                <div class="cardBox" v-for="(item, _) in disPile">
                    <img v-if="item == 1" :src="img1" />
                    <img v-if="item == 2" :src="img2" />
                    <img v-if="item == 3" :src="img3" />
                    <img v-if="item == 4" :src="img4" />
                    <img v-if="item == 5" :src="img5" />
                    <img v-if="item == 6" :src="img6" />
                    <img v-if="item == 7" :src="img7" />
                    <img v-if="item == 8" :src="img8" />
                </div>
            </div>
        </div>
        <div class="bottom8">
            <span>游戏状态：{{ gameStatus ? (round % 2 == 0 ? roundName2 + "的回合" : roundName1 + "的回合") : "游戏结束" }}</span>
        </div>
        <div class="container bottom20">
            <div class="container_left">
                <div style="margin-bottom: 5px;">我的昵称： {{ myName }}</div>
                <div style="margin-bottom: 5px;">我的状态： <a-tag :color="statusList[myStatus].color">{{
                    statusList[myStatus].name }}</a-tag>
                </div>
                <div>我的手牌：</div>
                <div
                    style="display: flex;justify-content: flex-start;align-items: center; padding: 8px 0;min-height: 101px;width: 100%;flex-wrap: wrap;">
                    <div class="cardBox"
                        :class="nowIndex == index && myHandCards.length > 1 ? 'borderRed' : 'borderGrey'"
                        v-for="(item, index) in myHandCards" @click="getNowCard(item, index)">
                        <img v-if="item == 1" :src="img1" />
                        <img v-if="item == 2" :src="img2" />
                        <img v-if="item == 3" :src="img3" />
                        <img v-if="item == 4" :src="img4" />
                        <img v-if="item == 5" :src="img5" />
                        <img v-if="item == 6" :src="img6" />
                        <img v-if="item == 7" :src="img7" />
                        <img v-if="item == 8" :src="img8" />
                    </div>
                </div>
                <div>我的弃牌：</div>
                <div
                    style="display: flex;justify-content: flex-start;align-items: center;padding: 8px 0;min-height: 101px;width: 100%;flex-wrap: wrap;margin-bottom: 20px;">
                    <div class="cardBox" v-for="(item, _) in myDisCards">
                        <img v-if="item == 1" :src="img1" />
                        <img v-if="item == 2" :src="img2" />
                        <img v-if="item == 3" :src="img3" />
                        <img v-if="item == 4" :src="img4" />
                        <img v-if="item == 5" :src="img5" />
                        <img v-if="item == 6" :src="img6" />
                        <img v-if="item == 7" :src="img7" />
                        <img v-if="item == 8" :src="img8" />
                    </div>
                </div>
                <div class="myBtn">
                    <a-button style="margin-right: 10px;" type="primary" @click="getNewCard()"
                        :disabled="myHandCards.length > 1 || round % 2 == myId - 1">摸牌</a-button>
                    <a-button type="primary" @click="panduan()" :disabled="myHandCards.length < 2">出牌</a-button>
                </div>

            </div>
            <div class="container_right">
                <div style="margin-bottom: 5px;">对手昵称： {{ yourName }}</div>
                <div style="margin-bottom: 5px;">对手状态： <a-tag :color="statusList[yourStatus].color">{{
                    statusList[yourStatus].name }}</a-tag>
                </div>
                <div>对手手牌：</div>
                <div v-if="gameStatus"
                    style="display: flex;justify-content: flex-start;align-items: center;padding: 8px 0;min-height: 101px;width: 100%;flex-wrap: wrap;">
                    <div class="cardBox" v-for="_ in yourHandCards">
                        <img :src="img0" />
                    </div>
                </div>
                <div v-else
                    style="display: flex;justify-content: flex-start;align-items: center;padding: 8px 0;min-height: 101px;width: 100%;flex-wrap: wrap;">
                    <div class="cardBox" v-for="(item, _) in yourHandCards">
                        <img v-if="item == 1" :src="img1" />
                        <img v-if="item == 2" :src="img2" />
                        <img v-if="item == 3" :src="img3" />
                        <img v-if="item == 4" :src="img4" />
                        <img v-if="item == 5" :src="img5" />
                        <img v-if="item == 6" :src="img6" />
                        <img v-if="item == 7" :src="img7" />
                        <img v-if="item == 8" :src="img8" />
                    </div>
                </div>
                <div>对手弃牌：</div>
                <div
                    style="display: flex;justify-content: flex-start;align-items: center;padding: 8px 0;min-height: 101px;width: 100%;flex-wrap: wrap;margin-bottom: 20px;">
                    <div class="cardBox" v-for="(item, index) in yourDisCards">
                        <img v-if="item == 1" :src="img1" />
                        <img v-if="item == 2" :src="img2" />
                        <img v-if="item == 3" :src="img3" />
                        <img v-if="item == 4" :src="img4" />
                        <img v-if="item == 5" :src="img5" />
                        <img v-if="item == 6" :src="img6" />
                        <img v-if="item == 7" :src="img7" />
                        <img v-if="item == 8" :src="img8" />
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom20">
            <a-button type="primary" @click="reset">重置游戏</a-button>
        </div>
        <div>
            <a-button @click="showRule = true">规则</a-button>
        </div>
        <a-modal v-model:open="showRule" destroyOnClose title="游戏规则" :maskClosable="false">
            <div class="rule_title">{{ qingshuBase.backgroundTitle }}</div>
            <div>{{ qingshuBase.background }}</div>
            <div class="rule_title">{{ qingshuBase.roleTitle }}</div>
            <div v-for="value in qingshuBase.roleIntroduce">{{ value }}</div>
            <template #footer>
                <a-button key="back" @click="showRule = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal width="240" v-model:open="visible" destroyOnClose :maskClosable="false" centered>
            <div>
                <div style="margin-bottom: 10px;">我猜测的牌是：</div>
                <div
                    style="display: flex;justify-content: flex-start;align-items: center;min-height: 100px;width: 100%;flex-wrap: wrap;">
                    <div class="cardBox" :class="yourPai == 2 ? 'borderRed' : ''" @click="yourPai = 2"> <img
                            :src="img2" />
                    </div>
                    <div class="cardBox" :class="yourPai == 3 ? 'borderRed' : ''" @click="yourPai = 3"><img
                            :src="img3" /></div>
                    <div class="cardBox" :class="yourPai == 4 ? 'borderRed' : ''" @click="yourPai = 4"><img
                            :src="img4" /></div>
                    <div class="cardBox" :class="yourPai == 5 ? 'borderRed' : ''" @click="yourPai = 5"><img
                            :src="img5" /></div>
                    <div class="cardBox" :class="yourPai == 6 ? 'borderRed' : ''" @click="yourPai = 6"><img
                            :src="img6" /></div>
                    <div class="cardBox" :class="yourPai == 7 ? 'borderRed' : ''" @click="yourPai = 7"><img
                            :src="img7" /></div>
                    <div class="cardBox" :class="yourPai == 8 ? 'borderRed' : ''" @click="yourPai = 8"><img
                            :src="img8" /></div>
                </div>
            </div>
            <template #footer>
                <a-button key="back" @click="visible = false">取消</a-button>
                <a-button key="submit" type="primary" :loading="loading" @click="disNowCard">确定</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useWebSocket } from "@/utils/useWebsocket";
import { qingshuBase } from "@/utils/func";
import { getGameMap } from "@/api/qingshu";
import { message } from "ant-design-vue";

const img0 = ref<any>(new URL("@/assets/qingshu/0.png", import.meta.url));
const img1 = ref<any>(new URL("@/assets/qingshu/1.png", import.meta.url));
const img2 = ref<any>(new URL("@/assets/qingshu/2.png", import.meta.url));
const img3 = ref<any>(new URL("@/assets/qingshu/3.png", import.meta.url));
const img4 = ref<any>(new URL("@/assets/qingshu/4.png", import.meta.url));
const img5 = ref<any>(new URL("@/assets/qingshu/5.png", import.meta.url));
const img6 = ref<any>(new URL("@/assets/qingshu/6.png", import.meta.url));
const img7 = ref<any>(new URL("@/assets/qingshu/7.png", import.meta.url));
const img8 = ref<any>(new URL("@/assets/qingshu/8.png", import.meta.url));
const myId = ref(-1);
const nowIndex = ref(-1);
const nowPai = ref(0);
myId.value = sessionStorage.getItem("userId") ? JSON.parse(sessionStorage.getItem("userId") as string) : -1;
const { sendMessage, closeWS } = useWebSocket(`${import.meta.env.VITE_APP_BASE_WS}ws?userId=${myId.value}`,
    {
        onmessage: (msg: any) => {
            if (msg) {
                const data = JSON.parse(msg);
                if (data.msg == "摸牌成功") {
                    getList();
                } else if (data.msg == "重置成功") {
                    getList();
                    gameStatus.value = true;
                    nowIndex.value = yourPai.value = -1;
                    nowPai.value = 0;
                } else if (data.msg == "出牌成功") {
                    getList();
                    nowIndex.value = -1;
                    nowPai.value = 0;
                    visible.value = loading.value = false;
                } else {
                    if (data.code == 202) {
                        message.info("你对手的手牌是：" + qingshuBase.role[parseInt(data.msg) - 1].name);
                    }
                }
            }
        },
    }
);
const statusList = [{
    name: "未开始",
    status: 0,
    color: "#ccc",
}, {
    name: "存活",
    status: 1,
    color: "#87d068",
}, {
    name: "淘汰",
    status: 2,
    color: "#f50",
}, {
    name: "保护",
    status: 3,
    color: "#2db7f5",
}];
const loading = ref(false);
const visible = ref(false);
const gameStatus = ref(true);
const showRule = ref(false);
const cardPile = ref<number[]>([]);
const disPile = ref<number[]>([]);
const myHandCards = ref<number[]>([]);
const myDisCards = ref<number[]>([]);
const myStatus = ref<number>(1);
const myName = ref("");
const yourHandCards = ref<number[]>([]);
const yourDisCards = ref<number[]>([]);
const yourStatus = ref<number>(1);
const yourPai = ref(-1);
const yourName = ref("");
const round = ref(1);
const roundName1 = ref("");
const roundName2 = ref("");

async function getList() {
    const res = await getGameMap();
    if (res.status == 200) {
        cardPile.value = res.data.data.cardPile;
        disPile.value = res.data.data.disPile;
        round.value = res.data.data.round;
        myHandCards.value = res.data.data.userData[myId.value == 1 ? 0 : 1].handCards;
        myDisCards.value = res.data.data.userData[myId.value == 1 ? 0 : 1].disCards;
        myStatus.value = res.data.data.userData[myId.value == 1 ? 0 : 1].status;
        myName.value = res.data.data.userData[myId.value == 1 ? 0 : 1].userName;
        yourHandCards.value = res.data.data.userData[myId.value == 1 ? 1 : 0].handCards;
        yourDisCards.value = res.data.data.userData[myId.value == 1 ? 1 : 0].disCards;
        yourStatus.value = res.data.data.userData[myId.value == 1 ? 1 : 0].status;
        yourName.value = res.data.data.userData[myId.value == 1 ? 1 : 0].userName;
        roundName1.value = res.data.data.userData[0].userName;
        roundName2.value = res.data.data.userData[1].userName;
        if (res.data.data.msg && res.data.data.status == 2) {
            gameStatus.value = false;
            message.error(res.data.data.msg);
        }
    }
}

async function reset() {
    const command = {
        type: 9,
        userId: myId.value
    }
    sendMessage(command);
}

async function getNewCard() {
    if (!gameStatus.value) {
        message.error("游戏结束！");
        return
    }
    const command = {
        type: 1,
        userId: myId.value
    };
    sendMessage(command);
}

function panduan() {
    yourPai.value = -1;
    if (nowIndex.value == -1) {
        message.error("请选择牌");
        return
    }
    if (nowPai.value == 8) {
        message.error("公主不能被打出");
        return
    }
    if (myHandCards.value[nowIndex.value == 0 ? 1 : 0] == 7) {
        if (nowPai.value == 5 || nowPai.value == 6) {
            message.error("你必须打出女伯爵");
            return
        }
    }
    if (nowPai.value == 1) {
        visible.value = true;
        return
    }
    disNowCard();
}

async function disNowCard() {
    loading.value = true;
    const command = {
        type: 2,
        userId: myId.value,
        pai: nowPai.value,
        yourPai: yourPai.value,
        index: nowIndex.value
    }
    sendMessage(command);
}

function getNowCard(pai: number, index: number) {
    if (myHandCards.value.length == 2 || yourHandCards.value.length == 2) {
        nowIndex.value = index;
        nowPai.value = pai;
    }
}

onMounted(() => {
    getList();
})

onBeforeUnmount(() => {
    closeWS();
});

</script>
<style lang="less" scoped>
.qingshu {
    padding: 20px;

    .container {
        display: flex;
        justify-content: space-between;
        border: 1px solid #cccccc;
        min-height: 400px;

        .container_left {
            position: relative;
            padding: 10px;
            width: 50%;
            border-right: 1px solid #cccccc;
        }

        .container_right {
            position: relative;
            padding: 10px;
            width: 50%;
        }
    }

    .myBtn {
        position: absolute;
        right: 5px;
        bottom: 5px;
    }
}

.bold {
    font-weight: bold;
}

.bottom8 {
    margin-bottom: 8px;
}

.bottom20 {
    margin-bottom: 20px;
}

.rule_title {
    margin-top: 15px;
    font-size: 16px;
    font-weight: bold;
}

.cardBox {
    margin-right: 10px;
    margin-bottom: 8px;
    cursor: pointer;
    min-width: 57.5x;

    img {
        height: 85px;
        width: 57.5px;
    }
}

.areaCard {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0;
    min-height: 101px;
    width: 100%;
    flex-wrap: wrap;
}

.borderGrey {
    border: 1px solid #ccc;
}

.borderRed {
    border: 1px solid red;
}
</style>