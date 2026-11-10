<template>
    <div class="duel-page">
        <header class="top-bar">
            <div class="brand">
                <h1 class="title">人魔对战</h1>
                <p class="subtitle">同时布阵 · 双方出击后结算</p>
            </div>
            <div class="top-actions">
                <span v-if="userId" class="user-chip">{{ userName }}</span>
                <a-button v-if="userId && screen !== 'login'" size="small" @click="logout">退出登录</a-button>
                <a-button size="small" @click="goBack">返回</a-button>
            </div>
        </header>

        <!-- 登录 -->
        <div v-if="screen === 'login'" class="panel login-panel">
            <h2>登录后开始对战</h2>
            <p class="hint">昵称不可与未结束对局中的玩家重复</p>
            <a-input v-model:value="loginName" class="field" maxlength="16" placeholder="请输入昵称" @pressEnter="doLogin" />
            <a-button type="primary" block :loading="loading" @click="doLogin">进入大厅</a-button>
        </div>

        <!-- 大厅 -->
        <div v-else-if="screen === 'lobby'" class="panel lobby-panel">
            <div class="lobby-head">
                <h2>对战大厅</h2>
                <div class="lobby-actions">
                    <a-button size="small" :loading="loading" @click="refreshRooms">刷新</a-button>
                    <a-button type="primary" size="small" :loading="loading" @click="createRoom">创建房间</a-button>
                </div>
            </div>
            <div class="join-row">
                <a-input-number v-model:value="joinRoomId" :min="1" placeholder="房间号" class="room-input" />
                <a-button type="primary" :loading="loading" @click="joinRoom">加入</a-button>
            </div>
            <a-spin :spinning="loading">
                <div v-if="rooms.length" class="room-list">
                    <button
                        v-for="room in rooms"
                        :key="room.id"
                        type="button"
                        class="room-item"
                        @click="joinRoomById(room.id)"
                    >
                        <strong>#{{ room.id }}</strong>
                        <span>{{ roomLabel(room) }}</span>
                        <em>{{ statusText(room.status) }}</em>
                    </button>
                </div>
                <p v-else class="empty">暂无房间，创建一个吧</p>
            </a-spin>
        </div>

        <!-- 房间：选阵营 / 对战 -->
        <template v-else-if="view">
            <section v-if="view.status === 'waiting' || view.status === 'picking'" class="panel pick-panel">
                <div class="room-tag">房间 #{{ view.id }}</div>
                <p class="hint">{{ view.msg || "请选择阵营" }}</p>
                <div class="seat-row">
                    <div class="seat">
                        <span class="seat-name">{{ view.you.name }}（你）</span>
                        <span class="seat-fac" :style="{ color: factionTone(view.you.faction) }">
                            {{ factionName(view.you.faction) || "未选" }}
                        </span>
                    </div>
                    <div class="seat">
                        <span class="seat-name">{{ view.enemy?.name || "等待对手…" }}</span>
                        <span class="seat-fac" :style="{ color: factionTone(view.enemy?.faction) }">
                            {{ view.enemy ? factionName(view.enemy.faction) || "未选" : "—" }}
                        </span>
                    </div>
                </div>
                <div class="pick-row">
                    <button
                        v-for="f in factions"
                        :key="f.id"
                        type="button"
                        class="pick-card"
                        :class="{ 'pick-card--on': view.you.faction === f.id }"
                        :style="{ '--tone': f.tone }"
                        :disabled="loading || view.status === 'waiting' && !view.enemy"
                        @click="pickFaction(f.id)"
                    >
                        <strong>{{ f.name }}</strong>
                        <span>{{ f.desc }}</span>
                    </button>
                </div>
                <a-button @click="leaveToLobby">返回大厅</a-button>
            </section>

            <section
                v-else
                class="battle"
                :class="{ 'battle--mobile': isMobile, 'battle--combat': combat.active }"
            >
                <div class="arena">
                    <div class="side side--foe" :class="{ 'side--dmg': combat.floatSide === 'enemy' }">
                        <div class="hero-bar">
                            <div class="hero-info">
                                <span class="faction" :style="{ color: factionTone(view.enemy?.faction) }">
                                    {{ factionName(view.enemy?.faction) || "对手" }}
                                </span>
                                <span class="hero-name">{{ view.enemy?.name || "对手" }}</span>
                            </div>
                            <div class="hp-wrap">
                                <div class="hp-bar">
                                    <div class="hp-fill hp-fill--enemy" :style="{ width: enemyHpPct + '%' }" />
                                </div>
                                <strong class="hp-num">{{ displayEnemyHp }}</strong>
                                <span v-if="combat.floatSide === 'enemy' && combat.floatDmg" class="hp-float">
                                    {{ combat.floatDmg }}
                                </span>
                            </div>
                            <div class="meta">
                                <span>法力 {{ enemyManaText }}</span>
                                <span>牌库 {{ view.enemy?.deck ?? 0 }}</span>
                                <span>手牌 {{ enemyHandCount }}</span>
                            </div>
                        </div>
                        <div class="depth-label">
                            <span v-for="(t, ti) in enemyDepthLabels" :key="'ed-' + ti">{{ t }}</span>
                        </div>
                        <div class="grid grid--enemy" :style="{ '--tone': factionTone(view.enemy?.faction) }">
                            <div
                                v-for="i in enemyOrder"
                                :key="'eg-' + i"
                                class="cell"
                                :class="{ 'cell--clash': inCombatCol(i) }"
                            >
                                <div
                                    v-if="enemyGrid[i]"
                                    class="unit"
                                    :class="{
                                        'unit--hit': hitIds.has(enemyGrid[i]!.id),
                                        'unit--strike': hitIds.has(enemyGrid[i]!.id) && combat.kind === 'face',
                                        'unit--new': enemyGrid[i]!.fresh || combat.newIds.has(enemyGrid[i]!.id)
                                    }"
                                >
                                    <span v-if="enemyGrid[i]!.fresh || combat.newIds.has(enemyGrid[i]!.id)" class="unit-new">新</span>
                                    <span class="unit-cost">{{ enemyGrid[i]!.cost }}</span>
                                    <span class="unit-name">{{ enemyGrid[i]!.name }}</span>
                                    <span class="unit-stats">
                                        <b>{{ enemyGrid[i]!.att }}</b>/<b>{{ enemyGrid[i]!.life }}</b>
                                    </span>
                                    <span v-if="enemyGrid[i]!.effect" class="unit-effect">{{ enemyGrid[i]!.effect }}</span>
                                </div>
                                <span v-else class="cell-hint">{{ slotLabel(i) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="vs-col">
                        <div class="vs-mark" :class="{ 'vs-mark--fight': combat.active }">VS</div>
                        <div v-if="currentRound > 0" class="round-badge">第{{ currentRound }}回合</div>
                        <span class="tip">{{ tip }}</span>
                        <div v-if="view.status === 'battle'" class="ready-row">
                            <span :class="{ on: view.youReady }">你{{ view.youReady ? "已出击" : "布阵中" }}</span>
                            <span :class="{ on: view.enemyReady }">对手{{ view.enemyReady ? "已出击" : "布阵中" }}</span>
                        </div>
                        <a-button
                            v-if="view.status === 'battle' && canDeploy"
                            type="primary"
                            :loading="loading"
                            :disabled="busy"
                            @click="endDeploy"
                        >
                            出击
                        </a-button>
                        <a-button
                            v-else-if="view.status === 'battle' && view.youReady"
                            type="primary"
                            disabled
                        >
                            等待对手出击
                        </a-button>
                        <a-button
                            v-if="view.status === 'battle'"
                            danger
                            size="small"
                            :loading="loading"
                            @click="resign"
                        >
                            认输
                        </a-button>
                        <a-button v-if="view.status === 'over'" type="primary" :loading="loading" @click="restartMatch">
                            再来一局
                        </a-button>
                        <a-button size="small" @click="leaveToLobby">离开房间</a-button>
                    </div>

                    <div class="side side--self" :class="{ 'side--dmg': combat.floatSide === 'you' }">
                        <div class="hero-bar">
                            <div class="hero-info">
                                <span class="faction" :style="{ color: factionTone(view.you.faction) }">
                                    {{ factionName(view.you.faction) }}
                                </span>
                                <span class="hero-name">{{ view.you.name }}</span>
                            </div>
                            <div class="hp-wrap">
                                <div class="hp-bar">
                                    <div class="hp-fill" :style="{ width: myHpPct + '%' }" />
                                </div>
                                <strong class="hp-num">{{ displayMyHp }}</strong>
                                <span v-if="combat.floatSide === 'you' && combat.floatDmg" class="hp-float">
                                    {{ combat.floatDmg }}
                                </span>
                            </div>
                            <div class="meta">
                                <span>法力 {{ view.you.mana ?? 0 }}/{{ view.you.maxMana ?? 0 }}</span>
                                <span>牌库 {{ view.you.deck ?? 0 }}</span>
                            </div>
                        </div>
                        <div class="depth-label">
                            <span v-for="(t, ti) in playerDepthLabels" :key="'pd-' + ti">{{ t }}</span>
                        </div>
                        <div class="grid grid--player" :style="{ '--tone': factionTone(view.you.faction) }" @dragover.prevent>
                            <div
                                v-for="i in playerOrder"
                                :key="'pg-' + i"
                                class="cell"
                                :class="{
                                    'cell--drop': dropIndex === i,
                                    'cell--empty': !myGrid[i] && canDeploy,
                                    'cell--clash': inCombatCol(i)
                                }"
                                @dragover.prevent="onDragOver(i, $event)"
                                @dragleave="onDragLeave(i)"
                                @drop.prevent="onDrop(i)"
                            >
                                <div
                                    v-if="myGrid[i]"
                                    class="unit"
                                    :class="{
                                        'unit--hit': hitIds.has(myGrid[i]!.id),
                                        'unit--strike': hitIds.has(myGrid[i]!.id) && combat.kind === 'face',
                                        'unit--fresh': myGrid[i]!.fresh && canDeploy,
                                        'unit--new': myGrid[i]!.fresh || combat.newIds.has(myGrid[i]!.id)
                                    }"
                                    :title="myGrid[i]!.fresh && canDeploy ? '点击收回手牌' : undefined"
                                    @click="recallAt(i)"
                                >
                                    <span v-if="myGrid[i]!.fresh || combat.newIds.has(myGrid[i]!.id)" class="unit-new">新</span>
                                    <span class="unit-cost">{{ myGrid[i]!.cost }}</span>
                                    <span class="unit-name">{{ myGrid[i]!.name }}</span>
                                    <span class="unit-stats">
                                        <b>{{ myGrid[i]!.att }}</b>/<b>{{ myGrid[i]!.life }}</b>
                                    </span>
                                    <span v-if="myGrid[i]!.effect" class="unit-effect">{{ myGrid[i]!.effect }}</span>
                                    <span v-if="myGrid[i]!.fresh && canDeploy" class="unit-recall">收回</span>
                                </div>
                                <span v-else class="cell-hint">{{ slotLabel(i) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="combat.active" class="combat-fx" :class="{ 'combat-fx--summary': combat.showSummary }" aria-hidden="true">
                    <div v-if="combat.banner" class="combat-fx__banner">{{ combat.banner }}</div>
                    <div v-if="combat.showSummary" class="deploy-board">
                        <div class="deploy-col">
                            <h3>你本轮上阵</h3>
                            <div v-if="combat.youDeployed.length" class="deploy-list">
                                <div v-for="item in combat.youDeployed" :key="'yd-' + item.id" class="deploy-item">
                                    <em>{{ item.slot }}</em>
                                    <strong>{{ item.name }}</strong>
                                    <span>{{ item.att }}/{{ item.life }}</span>
                                    <b>{{ item.cost }}费</b>
                                </div>
                            </div>
                            <p v-else class="deploy-empty">本轮未放牌</p>
                        </div>
                        <div class="deploy-col deploy-col--enemy">
                            <h3>对手本轮上阵</h3>
                            <div v-if="combat.enemyDeployed.length" class="deploy-list">
                                <div v-for="item in combat.enemyDeployed" :key="'ed-' + item.id" class="deploy-item">
                                    <em>{{ item.slot }}</em>
                                    <strong>{{ item.name }}</strong>
                                    <span>{{ item.att }}/{{ item.life }}</span>
                                    <b>{{ item.cost }}费</b>
                                </div>
                            </div>
                            <p v-else class="deploy-empty">本轮未放牌</p>
                        </div>
                    </div>
                    <div v-if="combat.kind" class="combat-fx__clash" :class="'combat-fx__clash--' + combat.kind">
                        <div class="combat-chip combat-chip--left">{{ combat.leftName }}</div>
                        <div class="combat-fx__spark">{{ combat.kind === 'trade' ? '⚔' : '➜' }}</div>
                        <div class="combat-chip combat-chip--right">
                            {{ combat.kind === 'trade' ? combat.rightName : '英雄' }}
                        </div>
                    </div>
                    <p v-if="combat.line && !combat.showSummary" class="combat-fx__line">{{ combat.line }}</p>
                </div>

                <div v-if="lastRound && !combat.active" class="round-bar">
                    <div class="round-bar__side">
                        <span class="round-bar__label">你上轮</span>
                        <span v-if="!lastRound.you.length" class="round-bar__empty">空过</span>
                        <span v-for="item in lastRound.you" :key="'ly-' + item.id" class="round-chip">
                            {{ item.slot }}·{{ item.name }}
                        </span>
                    </div>
                    <div class="round-bar__side round-bar__side--enemy">
                        <span class="round-bar__label">对手上轮</span>
                        <span v-if="!lastRound.enemy.length" class="round-bar__empty">空过</span>
                        <span v-for="item in lastRound.enemy" :key="'le-' + item.id" class="round-chip">
                            {{ item.slot }}·{{ item.name }}
                        </span>
                    </div>
                </div>

                <div class="hand-dock">
                    <div class="hand">
                        <div
                            v-for="card in myHand"
                            :key="card.id"
                            class="card"
                            :class="{ 'card--playable': canPlay(card), 'card--dragging': dragCardId === card.id }"
                            :style="{ '--tone': factionTone(view.you.faction) }"
                            :draggable="canPlay(card)"
                            @dragstart="onDragStart(card, $event)"
                            @dragend="onDragEnd"
                            @touchstart.passive="onTouchStart(card, $event)"
                            @touchmove.prevent="onTouchMove($event)"
                            @touchend="onTouchEnd"
                        >
                            <span class="card-cost">{{ card.cost }}</span>
                            <span class="card-name">{{ card.name }}</span>
                            <span class="card-stats">{{ card.att }}/{{ card.life }}</span>
                            <span v-if="card.effect" class="card-effect">{{ card.effect }}</span>
                        </div>
                    </div>
                    <p class="log-line">{{ log }}</p>
                </div>
            </section>
        </template>

        <div v-if="ghost.visible" class="drag-ghost" :style="{ left: ghost.x + 'px', top: ghost.y + 'px' }">
            {{ ghost.name }}
        </div>

        <div v-if="view?.status === 'over' && !combat.active" class="over-mask">
            <div class="over-card">
                <h2>{{ overTitle }}</h2>
                <p>{{ view.msg || overHint }}</p>
                <div class="over-actions">
                    <a-button type="primary" :loading="loading" @click="restartMatch">再来一局</a-button>
                    <a-button @click="leaveToLobby">返回大厅</a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";
import {
    duelCards,
    duelEnd,
    duelNameCheck,
    duelPick,
    duelPlace,
    duelRecall,
    duelResign,
    duelRestart,
    duelRoomCreate,
    duelRoomJoin,
    duelRoomList,
    duelWsUrl,
    type DuelCard,
    type DuelEvent,
    type DuelView,
    type FactionId,
    type FactionPack,
    type RoomSummary
} from "@/api/duel";

const UID_KEY = "duelUserId";
const NAME_KEY = "duelUserName";
const UID_MAP_KEY = "duelUserIdByName";
const MAX_HP = 30;
const MOBILE_MQ = "(max-width: 720px)";

const PLAYER_ORDER_LR = [6, 3, 0, 7, 4, 1, 8, 5, 2];
const ENEMY_ORDER_LR = [0, 3, 6, 1, 4, 7, 2, 5, 8];
const PLAYER_ORDER_TB = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const ENEMY_ORDER_TB = [6, 7, 8, 3, 4, 5, 0, 1, 2];

const FALLBACK_FACTIONS: FactionPack[] = [
    { id: "renzu", name: "人族", tone: "#1a6fa5", desc: "稳健平衡", cards: [] },
    { id: "mozu", name: "魔族", tone: "#c01b10", desc: "高攻低血", cards: [] }
];

type Screen = "login" | "lobby" | "room";

const screen = ref<Screen>("login");
const loading = ref(false);
const busy = ref(false);
const isMobile = ref(false);
const loginName = ref("");
const userId = ref("");
const userName = ref("");
const rooms = ref<RoomSummary[]>([]);
const joinRoomId = ref<number | null>(null);
const factions = ref<FactionPack[]>(FALLBACK_FACTIONS);
const view = ref<DuelView | null>(null);
const log = ref("");
const hitIds = ref<Set<number>>(new Set());
const dragCardId = ref<number | null>(null);
const dropIndex = ref<number | null>(null);
const ghost = ref({ visible: false, x: 0, y: 0, name: "" });

let mq: MediaQueryList | null = null;
let ws: WebSocket | null = null;
let intentionalClose = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let touchCard: DuelCard | null = null;
let playingEvents = false;

const enemyFog = reactive({
    grid: null as (DuelCard | null)[] | null,
    mana: null as number | null,
    maxMana: null as number | null,
    handCount: null as number | null,
    seeded: false
});

type DeployItem = { id: number; name: string; att: number; life: number; cost: number; slot: string; index: number };

const combat = reactive({
    active: false,
    showSummary: false,
    banner: "",
    line: "",
    col: 0,
    kind: "" as "" | "trade" | "face",
    leftName: "",
    rightName: "",
    floatDmg: "",
    floatSide: "" as "" | "you" | "enemy",
    enemySnap: null as (DuelCard | null)[] | null,
    youSnap: null as (DuelCard | null)[] | null,
    finalEnemy: null as DuelView["enemy"] | null,
    youDeployed: [] as DeployItem[],
    enemyDeployed: [] as DeployItem[],
    newIds: new Set<number>(),
    /** 交战动画期间展示的回合（刚打完的那一轮） */
    displayRound: 0
});

const lastRound = ref<{ you: DeployItem[]; enemy: DeployItem[] } | null>(null);
const displayMyHp = ref(MAX_HP);
const displayEnemyHp = ref(MAX_HP);

const myHand = computed(() => view.value?.you.hand || []);
const myGrid = computed(() => {
    if (combat.active && combat.youSnap) return combat.youSnap;
    return view.value?.you.grid || Array(9).fill(null);
});
/** 布阵阶段隐藏对手操作 */
const fogEnemy = computed(() => !!view.value && view.value.status === "battle");
/** 布阵中用冻结快照；交战揭示后用结算场面 */
const enemyGrid = computed(() => {
    if (combat.active && combat.enemySnap) return combat.enemySnap;
    if (fogEnemy.value && enemyFog.grid) return enemyFog.grid;
    return view.value?.enemy?.grid || Array(9).fill(null);
});
const enemyManaText = computed(() => {
    if (combat.active && combat.enemySnap) {
        const e = combat.finalEnemy;
        return `${e?.mana ?? 0}/${e?.maxMana ?? 0}`;
    }
    if (fogEnemy.value && enemyFog.mana != null) {
        return `${enemyFog.mana}/${enemyFog.maxMana}`;
    }
    const e = view.value?.enemy;
    return `${e?.mana ?? 0}/${e?.maxMana ?? 0}`;
});
const enemyHandCount = computed(() => {
    if (combat.active && combat.enemySnap) return combat.finalEnemy?.handCount ?? 0;
    if (fogEnemy.value && enemyFog.handCount != null) return enemyFog.handCount;
    return view.value?.enemy?.handCount ?? 0;
});
/** 对战中且自己尚未结束布阵时可放牌 */
const canDeploy = computed(
    () => !!view.value && view.value.status === "battle" && !view.value.youReady && !combat.active
);

const iWon = computed(() => !!view.value?.winner && view.value.winner === String(view.value.youSeat));
const isDraw = computed(() => !!view.value && view.value.status === "over" && !view.value.winner);
const overTitle = computed(() => (isDraw.value ? "平局" : iWon.value ? "胜利" : "失败"));
const overHint = computed(() =>
    isDraw.value ? "双方同时阵亡" : iWon.value ? "对手生命归零" : "你的生命归零"
);
const myHpPct = computed(() => Math.max(0, (displayMyHp.value / MAX_HP) * 100));
const enemyHpPct = computed(() => Math.max(0, (displayEnemyHp.value / MAX_HP) * 100));
const playerOrder = computed(() => (isMobile.value ? PLAYER_ORDER_TB : PLAYER_ORDER_LR));
const enemyOrder = computed(() => (isMobile.value ? ENEMY_ORDER_TB : ENEMY_ORDER_LR));
const playerDepthLabels = computed(() => (isMobile.value ? ["前", "中", "后"] : ["后", "中", "前"]));
const enemyDepthLabels = computed(() => (isMobile.value ? ["后", "中", "前"] : ["前", "中", "后"]));
const currentRound = computed(() => {
    if (combat.active && combat.displayRound > 0) return combat.displayRound;
    const v = view.value;
    if (!v) return 0;
    return v.round || v.turn || 0;
});

const tip = computed(() => {
    if (!view.value) return "";
    if (combat.active) return combat.line || combat.banner || "交战中…";
    if (view.value.status === "over") return "对战结束";
    const r = currentRound.value > 0 ? `第${currentRound.value}回合 · ` : "";
    if (view.value.youReady && view.value.enemyReady) return `${r}结算中…`;
    if (view.value.youReady) return `${r}已出击，等待对手`;
    if (view.value.enemyReady) return `${r}对手已出击 · 你还可调整后出击`;
    return `${r}同时布阵 · 点单位可收回 · 出击后开战`;
});

function inCombatCol(index: number) {
    return combat.col > 0 && index % 3 === combat.col - 1;
}

/** 前左→后右：1号～9号 */
function slotLabel(index: number) {
    if (index < 0 || index > 8) return "";
    return `${index + 1}号`;
}

function listDeployed(grid?: (DuelCard | null)[] | null): DeployItem[] {
    const out: DeployItem[] = [];
    (grid || []).forEach((u, index) => {
        if (!u?.fresh) return;
        out.push({
            id: u.id,
            name: u.name,
            att: u.att,
            life: u.life,
            cost: u.cost,
            slot: slotLabel(index),
            index
        });
    });
    return out;
}

function syncDisplayHp(data: DuelView) {
    displayMyHp.value = data.you?.hp ?? MAX_HP;
    displayEnemyHp.value = data.enemy?.hp ?? MAX_HP;
}

function resetCombatFx() {
    combat.active = false;
    combat.showSummary = false;
    combat.banner = "";
    combat.line = "";
    combat.col = 0;
    combat.kind = "";
    combat.leftName = "";
    combat.rightName = "";
    combat.floatDmg = "";
    combat.floatSide = "";
    combat.enemySnap = null;
    combat.youSnap = null;
    combat.finalEnemy = null;
    combat.youDeployed = [];
    combat.enemyDeployed = [];
    combat.newIds = new Set();
    combat.displayRound = 0;
}

function cloneGrid(grid?: (DuelCard | null)[] | null) {
    return (grid || Array(9).fill(null)).map((u) => (u ? { ...u } : null));
}

function syncMobile() {
    isMobile.value = !!mq?.matches;
}

function factionTone(id?: string | null) {
    return factions.value.find((f) => f.id === id)?.tone || "#94a3b8";
}

function factionName(id?: string | null) {
    if (!id) return "";
    return factions.value.find((f) => f.id === id)?.name || id;
}

function statusText(s: string) {
    if (s === "waiting") return "等人";
    if (s === "picking") return "选阵营";
    if (s === "battle") return "对战中";
    if (s === "over") return "已结束";
    return s;
}

function roomLabel(room: RoomSummary) {
    const a = room.name1 || "玩家1";
    const b = room.name2 || (room.status === "waiting" ? "空位" : "玩家2");
    return `${a} vs ${b}`;
}

function genUserId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    return `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function readNameIdMap(): Record<string, string> {
    try {
        return JSON.parse(localStorage.getItem(UID_MAP_KEY) || "{}") || {};
    } catch {
        return {};
    }
}

function saveNameId(name: string, id: string) {
    const map = readNameIdMap();
    map[name] = id;
    localStorage.setItem(UID_MAP_KEY, JSON.stringify(map));
}

function resolveUserId(name: string) {
    const map = readNameIdMap();
    if (map[name]) return map[name];
    const sessionId = sessionStorage.getItem(UID_KEY) || "";
    const sessionName = sessionStorage.getItem(NAME_KEY) || "";
    if (sessionId && sessionName === name) return sessionId;
    return genUserId();
}

function restoreSession() {
    const id = sessionStorage.getItem(UID_KEY) || "";
    const name = sessionStorage.getItem(NAME_KEY) || "";
    if (id && name) {
        userId.value = id;
        userName.value = name;
        loginName.value = name;
        saveNameId(name, id);
        screen.value = "lobby";
        return true;
    }
    screen.value = "login";
    return false;
}

async function doLogin() {
    const name = loginName.value.trim();
    if (!name) {
        message.error("昵称不能为空");
        return;
    }
    if (name.length > 16) {
        message.error("昵称最多 16 个字");
        return;
    }
    const id = resolveUserId(name);
    loading.value = true;
    try {
        const res = await duelNameCheck(name, id);
        if (res.data?.code !== 200) {
            message.error(res.data?.msg || "昵称重名");
            return;
        }
    } catch {
        // request 拦截器已提示「昵称重名」
        return;
    } finally {
        loading.value = false;
    }
    saveNameId(name, id);
    sessionStorage.setItem(UID_KEY, id);
    sessionStorage.setItem(NAME_KEY, name);
    userId.value = id;
    userName.value = name;
    screen.value = "lobby";
    message.success(`${name} 登录成功`);
    await Promise.all([loadFactions(), refreshRooms()]);
}

function logout() {
    closeWS();
    view.value = null;
    sessionStorage.removeItem(UID_KEY);
    sessionStorage.removeItem(NAME_KEY);
    userId.value = "";
    userName.value = "";
    loginName.value = "";
    screen.value = "login";
}

async function loadFactions() {
    try {
        const res = await duelCards();
        if (res.data?.code === 200 && res.data.data?.factions?.length) {
            factions.value = res.data.data.factions as FactionPack[];
        }
    } catch {
        /* 用本地兜底 */
    }
}

async function refreshRooms() {
    loading.value = true;
    try {
        const res = await duelRoomList();
        if (res.data?.code === 200) rooms.value = res.data.data || [];
    } finally {
        loading.value = false;
    }
}

function unwrap(res: { data?: { code?: number; msg?: string; data?: DuelView } }) {
    const body = res.data;
    if (!body || body.code !== 200) {
        message.error(body?.msg || "操作失败");
        return null;
    }
    return body.data || null;
}

async function enterRoom(data: DuelView) {
    resetCombatFx();
    resetEnemyFog();
    lastRound.value = null;
    syncEnemyFog(data, true);
    commitView(data, sanitizeMsg(data, data.msg) || data.msg || "");
    screen.value = "room";
    connectWS(data.id);
}

async function createRoom() {
    if (!userId.value) return;
    loading.value = true;
    try {
        const res = await duelRoomCreate({ userId: userId.value, name: userName.value });
        const data = unwrap(res);
        if (data) await enterRoom(data);
    } finally {
        loading.value = false;
    }
}

async function joinRoomById(roomId: number) {
    if (!userId.value || !roomId) return;
    loading.value = true;
    try {
        const res = await duelRoomJoin({ userId: userId.value, name: userName.value, roomId });
        const data = unwrap(res);
        if (data) await enterRoom(data);
    } finally {
        loading.value = false;
    }
}

async function joinRoom() {
    if (!joinRoomId.value) {
        message.error("请输入房间号");
        return;
    }
    await joinRoomById(joinRoomId.value);
}

function leaveToLobby() {
    closeWS();
    view.value = null;
    resetEnemyFog();
    resetCombatFx();
    lastRound.value = null;
    screen.value = "lobby";
    refreshRooms();
}

function connectWS(roomId: number) {
    closeWS(false);
    intentionalClose = false;
    const url = duelWsUrl(userId.value, roomId);
    ws = new WebSocket(url);
    ws.onmessage = (ev) => {
        try {
            const msg = JSON.parse(typeof ev.data === "string" ? ev.data : String(ev.data));
            if (msg.type === "error" || msg.code === 400) {
                message.error(msg.msg || "操作失败");
                return;
            }
            if (msg.data) applyView(msg.data as DuelView, msg.msg);
        } catch {
            /* ignore */
        }
    };
    ws.onclose = () => {
        ws = null;
        if (!intentionalClose && view.value?.id) {
            reconnectTimer = setTimeout(() => connectWS(view.value!.id), 2500);
        }
    };
    ws.onerror = () => {
        try {
            ws?.close();
        } catch {
            /* ignore */
        }
    };
}

function closeWS(markIntentional = true) {
    if (markIntentional) intentionalClose = true;
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    try {
        ws?.close();
    } catch {
        /* ignore */
    }
    ws = null;
}

function sendWs(payload: Record<string, unknown>) {
    if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        return true;
    }
    return false;
}

function leaksEnemyAction(text?: string) {
    return !!text && /对手将|放入.+排|对手放/.test(text);
}

/** 布阵阶段屏蔽会泄露对手操作的提示 */
function sanitizeMsg(data: DuelView, raw?: string) {
    const text = (raw || "").trim();
    if (!text) return "";
    if (data.status === "battle" && !data.events?.length && leaksEnemyAction(text)) {
        if (data.youReady) return "等待对手出击";
        if (data.enemyReady) return "对手已出击，你还可调整后出击";
        return "双方布阵中";
    }
    return text;
}

function resetEnemyFog() {
    enemyFog.grid = null;
    enemyFog.mana = null;
    enemyFog.maxMana = null;
    enemyFog.handCount = null;
    enemyFog.seeded = false;
}

function seedEnemyFog(data: DuelView) {
    const e = data.enemy;
    if (!e) {
        resetEnemyFog();
        return;
    }
    // 只用非 fresh 单位做公开场面（兼容旧后端：首次进房/结算后整板作为公开态）
    const grid = (e.grid || Array(9).fill(null)).map((u) => (u && u.fresh ? null : u ? { ...u } : null));
    enemyFog.grid = grid;
    enemyFog.mana = e.maxMana ?? e.mana ?? 0;
    enemyFog.maxMana = e.maxMana ?? 0;
    enemyFog.handCount = e.handCount ?? 0;
    enemyFog.seeded = true;
}

function syncEnemyFog(data: DuelView, revealed: boolean) {
    if (data.status !== "battle") {
        resetEnemyFog();
        return;
    }
    if (revealed || !enemyFog.seeded) {
        seedEnemyFog(data);
    }
}

function commitView(data: DuelView, safeMsg?: string) {
    const msg = safeMsg || data.msg || "";
    view.value = { ...data, events: [], msg };
    syncDisplayHp(data);
    if (msg) log.value = msg;
}

async function applyView(data: DuelView, fallbackMsg?: string) {
    const events = data.events?.length ? [...data.events] : [];
    const safeMsg = sanitizeMsg(data, data.msg) || sanitizeMsg(data, fallbackMsg);
    if (safeMsg) data = { ...data, msg: safeMsg };

    // 有交战事件：先播过渡动画，再切到结算后场面
    if (events.length) {
        if (playingEvents) return;
        await playCombatSequence(events, data);
        return;
    }

    syncEnemyFog(data, data.status === "over");
    commitView(data, safeMsg);
}

async function playCombatSequence(events: DuelEvent[], finalData: DuelView) {
    playingEvents = true;
    busy.value = true;
    combat.active = true;
    combat.showSummary = false;
    const nextRound = finalData.round || finalData.turn || 0;
    // 未终局时 turn 已是下一回合；刚打完的回合是 next-1
    const foughtRound =
        finalData.status === "over" ? Math.max(1, nextRound) : Math.max(1, nextRound - 1);
    combat.displayRound = foughtRound;
    combat.banner = `第${foughtRound}回合`;
    combat.line = "";
    combat.kind = "";
    combat.col = 0;
    combat.floatDmg = "";
    combat.floatSide = "";
    combat.finalEnemy = finalData.enemy || null;

    const revealYou = finalData.revealYou?.length ? cloneGrid(finalData.revealYou) : cloneGrid(view.value?.you.grid);
    const revealEnemy = finalData.revealEnemy?.length
        ? cloneGrid(finalData.revealEnemy)
        : cloneGrid(finalData.enemy?.grid);
    combat.youSnap = revealYou;
    combat.enemySnap = revealEnemy;
    combat.youDeployed = listDeployed(revealYou);
    combat.enemyDeployed = listDeployed(revealEnemy);
    combat.newIds = new Set([...combat.youDeployed, ...combat.enemyDeployed].map((x) => x.id));
    lastRound.value = { you: [...combat.youDeployed], enemy: [...combat.enemyDeployed] };

    log.value = `第${foughtRound}回合出击，先看双方上阵`;
    await wait(700);

    combat.banner = `第${foughtRound}回合上阵`;
    combat.showSummary = true;
    await wait(2200);
    combat.showSummary = false;
    combat.banner = "";
    log.value = `第${foughtRound}回合交战`;
    await wait(350);

    const youSeat = view.value?.youSeat ?? finalData.youSeat;
    let hpYou = displayMyHp.value;
    let hpEnemy = displayEnemyHp.value;

    for (const ev of events) {
        combat.col = ev.col;
        combat.kind = ev.kind;
        combat.line = ev.text;
        combat.leftName = ev.atkName;
        combat.rightName = ev.defName || "";
        combat.floatDmg = "";
        combat.floatSide = "";
        log.value = ev.text;
        flashHit(ev.hitIds || [], 680);

        if (ev.kind === "face" && ev.damage) {
            const hitYou = ev.attackerSeat !== 0 && ev.attackerSeat !== youSeat;
            combat.floatSide = hitYou ? "you" : "enemy";
            combat.floatDmg = `-${ev.damage}`;
            await wait(300);
            if (hitYou) {
                hpYou = Math.max(0, hpYou - ev.damage);
                displayMyHp.value = hpYou;
            } else {
                hpEnemy = Math.max(0, hpEnemy - ev.damage);
                displayEnemyHp.value = hpEnemy;
            }
            await wait(560);
        } else {
            await wait(820);
        }

        combat.kind = "";
        combat.leftName = "";
        combat.rightName = "";
        combat.floatDmg = "";
        combat.floatSide = "";
        combat.col = 0;
        await wait(200);
    }

    if (finalData.status === "over") {
        combat.banner = "战斗结束";
        combat.displayRound = foughtRound;
    } else {
        combat.displayRound = nextRound;
        combat.banner = `第${nextRound}回合`;
    }
    combat.line = finalData.msg || "";
    await wait(700);

    syncEnemyFog(finalData, true);
    commitView(finalData, finalData.msg);
    seedEnemyFog(finalData);
    resetCombatFx();
    busy.value = false;
    playingEvents = false;
}

function flashHit(ids: number[], ms = 420) {
    const next = new Set(hitIds.value);
    ids.forEach((id) => next.add(id));
    hitIds.value = next;
    setTimeout(() => {
        const clear = new Set(hitIds.value);
        ids.forEach((id) => clear.delete(id));
        hitIds.value = clear;
    }, ms);
}

function wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

async function pickFaction(faction: FactionId) {
    if (!view.value || !userId.value) return;
    loading.value = true;
    try {
        if (sendWs({ type: "pick", faction })) return;
        const res = await duelPick({ userId: userId.value, roomId: view.value.id, faction });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

function canPlay(card: DuelCard) {
    const v = view.value;
    if (!v || !canDeploy.value || busy.value || loading.value) return false;
    return (v.you.mana ?? 0) >= card.cost;
}

function onDragStart(card: DuelCard, e: DragEvent) {
    if (!canPlay(card)) {
        e.preventDefault();
        return;
    }
    dragCardId.value = card.id;
    e.dataTransfer?.setData("text/plain", String(card.id));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}

function onDragEnd() {
    dragCardId.value = null;
    dropIndex.value = null;
}

function onDragOver(index: number, e: DragEvent) {
    if (!canDropAt(index)) return;
    dropIndex.value = index;
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function canDropAt(index: number) {
    return canDeploy.value && !busy.value && !!view.value && !myGrid.value[index] && dragCardId.value != null;
}

function onDragLeave(index: number) {
    if (dropIndex.value === index) dropIndex.value = null;
}

async function onDrop(index: number) {
    const id = dragCardId.value;
    dragCardId.value = null;
    dropIndex.value = null;
    if (id == null) return;
    await placeAt(id, index);
}

function onTouchStart(card: DuelCard, e: TouchEvent) {
    if (!canPlay(card)) return;
    touchCard = card;
    dragCardId.value = card.id;
    const t = e.touches[0];
    ghost.value = { visible: true, x: t.clientX - 36, y: t.clientY - 48, name: card.name };
}

function onTouchMove(e: TouchEvent) {
    if (!touchCard) return;
    const t = e.touches[0];
    ghost.value = { ...ghost.value, visible: true, x: t.clientX - 36, y: t.clientY - 48 };
    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
    const cell = el?.closest(".grid--player .cell") as HTMLElement | null;
    if (!cell) {
        dropIndex.value = null;
        return;
    }
    const cells = [...document.querySelectorAll(".grid--player .cell")];
    const disp = cells.indexOf(cell);
    const idx = disp >= 0 ? playerOrder.value[disp] : -1;
    dropIndex.value = idx >= 0 && !myGrid.value[idx] ? idx : null;
}

async function onTouchEnd() {
    ghost.value.visible = false;
    const idx = dropIndex.value;
    const card = touchCard;
    touchCard = null;
    dragCardId.value = null;
    dropIndex.value = null;
    if (card && idx != null) await placeAt(card.id, idx);
}

async function placeAt(cardId: number, index: number) {
    const v = view.value;
    if (!v || !userId.value || myGrid.value[index]) return;
    const card = myHand.value.find((c) => c.id === cardId);
    if (!card || !canPlay(card)) return;
    loading.value = true;
    try {
        if (sendWs({ type: "place", cardId, index })) return;
        const res = await duelPlace({ userId: userId.value, roomId: v.id, cardId, index });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

async function recallAt(index: number) {
    const v = view.value;
    const unit = myGrid.value[index];
    if (!v || !userId.value || !canDeploy.value || !unit?.fresh || busy.value) return;
    loading.value = true;
    try {
        if (sendWs({ type: "recall", index })) return;
        const res = await duelRecall({ userId: userId.value, roomId: v.id, index });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

async function endDeploy() {
    const v = view.value;
    if (!v || !userId.value || !canDeploy.value || busy.value) return;
    loading.value = true;
    try {
        if (sendWs({ type: "end" })) return;
        const res = await duelEnd({ userId: userId.value, roomId: v.id });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

async function resign() {
    const v = view.value;
    if (!v || !userId.value || v.status !== "battle") return;
    loading.value = true;
    try {
        if (sendWs({ type: "resign" })) return;
        const res = await duelResign({ userId: userId.value, roomId: v.id });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

async function restartMatch() {
    const v = view.value;
    if (!v || !userId.value || v.status !== "over") return;
    loading.value = true;
    try {
        if (sendWs({ type: "restart" })) return;
        const res = await duelRestart({ userId: userId.value, roomId: v.id });
        const data = unwrap(res);
        if (data) await applyView(data);
    } finally {
        loading.value = false;
    }
}

function goBack() {
    closeWS();
    router.go(-1);
}

onMounted(async () => {
    mq = window.matchMedia(MOBILE_MQ);
    syncMobile();
    mq.addEventListener("change", syncMobile);
    if (restoreSession()) {
        await Promise.all([loadFactions(), refreshRooms()]);
    }
});

onUnmounted(() => {
    mq?.removeEventListener("change", syncMobile);
    closeWS();
});
</script>

<style lang="less" scoped>
.duel-page {
    --bg: #10151c;
    --panel: #1a222d;
    --line: #2c3848;
    --ink: #e8eef6;
    --muted: #8b9bb0;

    min-height: 100dvh;
    padding: 12px;
    box-sizing: border-box;
    background:
        radial-gradient(ellipse 50% 40% at 15% 40%, rgba(26, 111, 165, 0.16), transparent 55%),
        radial-gradient(ellipse 50% 40% at 85% 40%, rgba(192, 27, 16, 0.12), transparent 55%),
        var(--bg);
    color: var(--ink);
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    user-select: none;
    display: flex;
    flex-direction: column;
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
}

.title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
}

.subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--muted);
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-chip {
    font-size: 12px;
    color: #cbd5e1;
    padding: 4px 10px;
    border-radius: 999px;
    background: #243041;
}

.panel {
    max-width: 560px;
    width: 100%;
    margin: 24px auto;
    padding: 20px;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid var(--line);
    box-sizing: border-box;
}

.login-panel,
.pick-panel {
    text-align: center;

    h2 {
        margin: 0 0 8px;
    }
}

.hint {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--muted);
}

.field {
    margin-bottom: 12px;
}

.lobby-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    h2 {
        margin: 0;
        font-size: 1.1rem;
    }
}

.lobby-actions {
    display: flex;
    gap: 8px;
}

.join-row {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}

.room-input {
    flex: 1;
}

.room-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.room-item {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: #121821;
    color: var(--ink);
    cursor: pointer;
    text-align: left;

    em {
        font-style: normal;
        font-size: 12px;
        color: var(--muted);
    }

    &:hover {
        border-color: #1a6fa5;
    }
}

.empty {
    text-align: center;
    color: var(--muted);
    font-size: 13px;
}

.room-tag {
    font-size: 13px;
    font-weight: 700;
    color: #7dd3fc;
    margin-bottom: 8px;
}

.seat-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
}

.seat {
    padding: 12px;
    border-radius: 10px;
    background: #121821;
    border: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.seat-name {
    font-weight: 700;
}

.seat-fac {
    font-size: 12px;
}

.pick-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}

.pick-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 12px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: #121821;
    color: var(--ink);
    cursor: pointer;

    strong {
        font-size: 1.1rem;
        color: var(--tone);
    }

    span {
        font-size: 12px;
        color: var(--muted);
    }

    &--on {
        border-color: var(--tone);
        box-shadow: 0 0 0 1px var(--tone);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.battle {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
}

.arena {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: stretch;
    min-height: 0;
}

.side--self {
    order: 1;
}

.side--foe {
    order: 3;
}

.side {
    background: rgba(26, 34, 45, 0.94);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.hero-bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.hero-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.faction {
    font-size: 12px;
    font-weight: 700;
}

.hero-name {
    font-size: 15px;
    font-weight: 800;
}

.hp-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
}

.hp-bar {
    flex: 1;
    height: 10px;
    border-radius: 999px;
    background: #243041;
    overflow: hidden;
}

.hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #1a6fa5, #3aa0d8);
    transition: width 0.55s ease;

    &--enemy {
        background: linear-gradient(90deg, #8b1a14, #c01b10);
    }
}

.hp-num {
    min-width: 28px;
    font-variant-numeric: tabular-nums;
}

.hp-float {
    position: absolute;
    right: 0;
    top: -18px;
    font-size: 18px;
    font-weight: 900;
    color: #f87171;
    animation: dmg-float 0.75s ease-out forwards;
    pointer-events: none;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
}

.side--dmg {
    animation: side-shake 0.35s ease;
}

.meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    color: var(--muted);
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.depth-label {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-align: center;
}

.grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
    min-height: 220px;
}

.cell {
    position: relative;
    border-radius: 12px;
    border: 1.5px dashed #3a4a5e;
    background: rgba(15, 20, 28, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;

    &--empty {
        border-color: color-mix(in srgb, var(--tone) 35%, #3a4a5e);
    }

    &--clash {
        border-style: solid;
        border-color: #fbbf24;
        background: rgba(251, 191, 36, 0.12);
        animation: col-pulse 0.45s ease;
    }

    &--drop {
        border-style: solid;
        border-color: var(--tone);
        background: color-mix(in srgb, var(--tone) 18%, transparent);
        transform: scale(1.03);
    }
}

.cell-hint {
    font-size: 12px;
    color: #4b5c72;
    font-weight: 600;
}

.unit {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: 2px solid color-mix(in srgb, var(--tone) 75%, #fff 5%);
    background: linear-gradient(165deg, #2a3544, #161d27);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    box-sizing: border-box;

    &--hit {
        box-shadow: 0 0 0 2px #f87171, inset 0 0 12px rgba(248, 113, 113, 0.35);
        animation: unit-hit 0.45s ease;
    }

    &--strike {
        animation: unit-strike 0.55s ease;
    }

    &--fresh {
        cursor: pointer;
        outline: 1px dashed color-mix(in srgb, var(--tone) 70%, #fff 20%);
        outline-offset: -3px;
    }

    &--new {
        box-shadow: 0 0 0 2px #fbbf24, inset 0 0 10px rgba(251, 191, 36, 0.2);
    }
}

.unit-new {
    position: absolute;
    left: 2px;
    top: 2px;
    z-index: 1;
    font-size: 9px;
    font-weight: 800;
    line-height: 1;
    padding: 2px 3px;
    border-radius: 4px;
    background: #fbbf24;
    color: #1a1508;
}

.unit-effect {
    max-width: 100%;
    padding: 0 2px;
    font-size: 9px;
    line-height: 1.2;
    color: #fbbf24;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.unit-recall {
    position: absolute;
    right: 2px;
    bottom: 2px;
    font-size: 9px;
    line-height: 1;
    padding: 2px 3px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.55);
    color: #cbd5e1;
}

.unit-cost {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 11px;
    font-weight: 800;
    color: #7dd3fc;
}

.unit-name {
    font-size: 13px;
    font-weight: 800;
}

.unit-stats {
    font-size: 12px;
    font-variant-numeric: tabular-nums;

    b:first-child {
        color: #fca5a5;
    }

    b:last-child {
        color: #86efac;
    }
}

.vs-col {
    order: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 4px;
    min-width: 96px;
}

.vs-mark {
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #64748b;

    &--fight {
        color: #fbbf24;
        animation: vs-pulse 0.9s ease infinite;
    }
}

.round-badge {
    font-size: 13px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid #3b4d63;
    background: rgba(30, 41, 54, 0.95);
    color: #fbbf24;
    letter-spacing: 0.04em;
}

.tip {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    max-width: 120px;
    line-height: 1.35;
}

.ready-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: var(--muted);
    text-align: center;

    span.on {
        color: #7dd3a7;
        font-weight: 600;
    }
}

.hand-dock {
    flex-shrink: 0;
    background: rgba(26, 34, 45, 0.94);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 10px 12px 12px;
}

.hand {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    min-height: 96px;
}

.card {
    position: relative;
    width: 70px;
    height: 92px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--tone) 50%, #334);
    background: linear-gradient(170deg, #2a3544, #18202a);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0.5;
    cursor: grab;
    touch-action: none;

    &--playable {
        opacity: 1;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--tone) 70%, transparent);
    }

    &--dragging {
        opacity: 0.35;
    }
}

.card-cost {
    position: absolute;
    top: 6px;
    left: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #0ea5e9;
    color: #041018;
    font-size: 12px;
    font-weight: 800;
    display: grid;
    place-items: center;
}

.card-name {
    font-size: 13px;
    font-weight: 700;
    margin-top: 8px;
}

.card-stats {
    font-size: 12px;
    color: #cbd5e1;
    font-variant-numeric: tabular-nums;
}

.card-effect {
    max-width: 100%;
    padding: 0 4px;
    font-size: 10px;
    line-height: 1.2;
    color: #fbbf24;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.drag-ghost {
    position: fixed;
    z-index: 30;
    pointer-events: none;
    width: 72px;
    height: 40px;
    border-radius: 8px;
    background: #1a6fa5;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: grid;
    place-items: center;
}

.log-line {
    margin: 8px 0 0;
    text-align: center;
    font-size: 13px;
    color: var(--muted);
    min-height: 20px;
}

.battle--combat {
    position: relative;
}

.battle--combat .hand-dock {
    opacity: 0.35;
    pointer-events: none;
}

.combat-fx {
    position: absolute;
    inset: 0;
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(8, 12, 18, 0.28), rgba(8, 12, 18, 0.55));

    &--summary {
        background: rgba(8, 12, 18, 0.72);
    }
}

.deploy-board {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: min(560px, calc(100% - 24px));
    padding: 14px;
    border-radius: 16px;
    border: 1px solid #334155;
    background: rgba(15, 23, 32, 0.94);
    animation: clash-in 0.35s ease;
}

.deploy-col {
    min-width: 0;

    h3 {
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 800;
        color: #93c5fd;
    }

    &--enemy h3 {
        color: #fca5a5;
    }
}

.deploy-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.deploy-item {
    display: grid;
    grid-template-columns: 40px 1fr auto auto;
    gap: 6px;
    align-items: center;
    padding: 7px 8px;
    border-radius: 8px;
    background: rgba(30, 41, 54, 0.95);
    border: 1px solid #2c3a4c;
    font-size: 12px;

    em {
        font-style: normal;
        color: #94a3b8;
        font-size: 11px;
    }

    strong {
        font-weight: 800;
        color: #f1f5f9;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        color: #cbd5e1;
        font-variant-numeric: tabular-nums;
    }

    b {
        font-weight: 700;
        color: #fbbf24;
        font-size: 11px;
    }
}

.deploy-empty {
    margin: 0;
    color: #64748b;
    font-size: 13px;
}

.round-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: rgba(26, 34, 45, 0.9);
}

.round-bar__side {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-width: 0;
}

.round-bar__label {
    font-size: 11px;
    font-weight: 800;
    color: #93c5fd;
    margin-right: 2px;
}

.round-bar__side--enemy .round-bar__label {
    color: #fca5a5;
}

.round-bar__empty {
    font-size: 11px;
    color: #64748b;
}

.round-chip {
    font-size: 11px;
    padding: 3px 7px;
    border-radius: 999px;
    background: #243041;
    border: 1px solid #334155;
    color: #e2e8f0;
}

.combat-fx__banner {
    font-size: clamp(1.6rem, 5vw, 2.4rem);
    font-weight: 900;
    letter-spacing: 0.2em;
    color: #f8fafc;
    text-shadow: 0 0 24px rgba(251, 191, 36, 0.55), 0 2px 10px rgba(0, 0, 0, 0.7);
    animation: banner-in 0.55s ease;
}

.combat-fx__clash {
    display: flex;
    align-items: center;
    gap: 14px;
    animation: clash-in 0.35s ease;
}

.combat-fx__clash--trade .combat-chip--left {
    animation: chip-left 0.55s ease;
}

.combat-fx__clash--trade .combat-chip--right {
    animation: chip-right 0.55s ease;
}

.combat-fx__clash--face .combat-chip--left {
    animation: chip-charge 0.55s ease;
}

.combat-chip {
    min-width: 72px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 2px solid #94a3b8;
    background: linear-gradient(165deg, #2a3544, #161d27);
    color: #e8eef6;
    font-weight: 800;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.combat-fx__spark {
    font-size: 1.4rem;
    color: #fbbf24;
    animation: spark-pop 0.45s ease;
}

.combat-fx__line {
    margin: 0;
    max-width: min(420px, 86vw);
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(15, 20, 28, 0.82);
    border: 1px solid #334155;
    color: #e2e8f0;
    font-size: 13px;
    text-align: center;
}

@keyframes banner-in {
    from {
        opacity: 0;
        transform: scale(0.7) translateY(12px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes clash-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes chip-left {
    0% {
        transform: translateX(-40px) scale(0.9);
        opacity: 0.4;
    }
    55% {
        transform: translateX(6px) scale(1.05);
    }
    100% {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}

@keyframes chip-right {
    0% {
        transform: translateX(40px) scale(0.9);
        opacity: 0.4;
    }
    55% {
        transform: translateX(-6px) scale(1.05);
    }
    100% {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}

@keyframes chip-charge {
    0% {
        transform: translateX(-28px) scale(0.92);
    }
    60% {
        transform: translateX(10px) scale(1.08);
    }
    100% {
        transform: translateX(0) scale(1);
    }
}

@keyframes spark-pop {
    0% {
        transform: scale(0.4);
        opacity: 0;
    }
    60% {
        transform: scale(1.3);
        opacity: 1;
    }
    100% {
        transform: scale(1);
    }
}

@keyframes dmg-float {
    0% {
        opacity: 0;
        transform: translateY(8px) scale(0.8);
    }
    30% {
        opacity: 1;
        transform: translateY(0) scale(1.15);
    }
    100% {
        opacity: 0;
        transform: translateY(-22px) scale(1);
    }
}

@keyframes side-shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-4px);
    }
    75% {
        transform: translateX(4px);
    }
}

@keyframes col-pulse {
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.04);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes unit-hit {
    0%,
    100% {
        transform: translate(0, 0);
    }
    30% {
        transform: translate(-3px, 2px);
    }
    60% {
        transform: translate(3px, -2px);
    }
}

@keyframes unit-strike {
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.12) translateY(-4px);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes vs-pulse {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.85;
    }
    50% {
        transform: scale(1.12);
        opacity: 1;
    }
}

.over-mask {
    position: fixed;
    inset: 0;
    background: rgba(8, 10, 14, 0.72);
    display: grid;
    place-items: center;
    z-index: 40;
}

.over-card {
    width: min(360px, calc(100vw - 32px));
    padding: 28px 24px;
    border-radius: 16px;
    background: #1a222d;
    border: 1px solid #2a3544;
    text-align: center;

    h2 {
        margin: 0 0 8px;
        font-size: 1.5rem;
    }

    p {
        margin: 0 0 18px;
        color: var(--muted);
    }
}

.over-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

@media (max-width: 720px) {
    .arena {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 8px;
    }

    .side--foe {
        order: 1;
    }

    .vs-col {
        order: 2;
        flex-direction: row;
        flex-wrap: wrap;
        min-width: 0;
        padding: 4px 0;
        gap: 8px;
    }

    .side--self {
        order: 3;
    }

    .depth-label {
        display: none;
    }

    .tip {
        max-width: none;
    }

    .grid {
        min-height: 0;
        width: min(100%, 300px);
        margin: 0 auto;
        aspect-ratio: 1;
    }

    .deploy-board {
        grid-template-columns: 1fr;
        max-height: 46vh;
        overflow: auto;
    }

    .round-bar {
        grid-template-columns: 1fr;
    }
}
</style>
