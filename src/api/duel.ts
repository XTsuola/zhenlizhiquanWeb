import { get, post } from "../utils/request";

export type FactionId = "renzu" | "mozu";
export type RoomStatus = "waiting" | "picking" | "battle" | "over";

export type DuelCard = {
    id: number;
    cost: number;
    name: string;
    att: number;
    life: number;
    effect?: string;
    /** 本轮布阵刚放下，可收回；对手视角看不到 */
    fresh?: boolean;
    faction?: string;
    count?: number;
};

export type DuelPlayerView = {
    userId: string;
    name: string;
    faction?: FactionId | "";
    hp?: number;
    mana?: number;
    maxMana?: number;
    deck?: number;
    handCount?: number;
    hand?: DuelCard[];
    grid?: (DuelCard | null)[];
};

export type DuelEvent = {
    kind: "trade" | "face";
    col: number;
    atkName: string;
    defName?: string;
    damage?: number;
    /** 对撞为 0；打英雄时为进攻座位 */
    attackerSeat: number;
    hitIds: number[];
    text: string;
};

export type DuelView = {
    id: number;
    status: RoomStatus;
    youSeat: number;
    /** 当前回合数，从 1 起；未开战为 0 */
    turn: number;
    round?: number;
    youReady?: boolean;
    enemyReady?: boolean;
    /** 双方同时阵亡时为空 */
    winner: "" | "1" | "2";
    msg: string;
    events?: DuelEvent[];
    /** 交战帧：出击前九宫格，用于展示本轮上阵 */
    revealYou?: (DuelCard | null)[];
    revealEnemy?: (DuelCard | null)[];
    you: DuelPlayerView;
    enemy?: DuelPlayerView;
};

export type FactionPack = {
    id: FactionId;
    name: string;
    tone: string;
    desc: string;
    cards: DuelCard[];
};

export type RoomSummary = {
    id: number;
    status: RoomStatus;
    name1?: string;
    name2?: string;
    player1?: string;
    player2?: string;
};

type ApiOk<T> = { code: number; msg: string; data: T };

export const duelCards = () => get<ApiOk<{ factions: FactionPack[] }>>("/duel/cards");

export const duelNameCheck = (name: string, userId: string) =>
    get<ApiOk<{ ok: boolean; name: string }>>("/duel/name/check", { name, userId });

export const duelRoomList = () => get<ApiOk<RoomSummary[]>>("/duel/room/list");

export const duelRoomCreate = (data: { userId: string; name?: string }) =>
    post<ApiOk<DuelView>>("/duel/room/create", data);

export const duelRoomJoin = (data: { userId: string; name?: string; roomId: number }) =>
    post<ApiOk<DuelView>>("/duel/room/join", data);

export const duelRoomDetail = (id: number, userId: string) =>
    get<ApiOk<DuelView>>("/duel/room/detail", { id, userId });

export const duelPick = (data: { userId: string; roomId: number; faction: FactionId }) =>
    post<ApiOk<DuelView>>("/duel/pick", data);

export const duelPlace = (data: { userId: string; roomId: number; cardId: number; index: number }) =>
    post<ApiOk<DuelView>>("/duel/place", data);

export const duelRecall = (data: { userId: string; roomId: number; index: number }) =>
    post<ApiOk<DuelView>>("/duel/recall", data);

export const duelEnd = (data: { userId: string; roomId: number }) =>
    post<ApiOk<DuelView>>("/duel/end", data);

export const duelResign = (data: { userId: string; roomId: number }) =>
    post<ApiOk<DuelView>>("/duel/resign", data);

export const duelRestart = (data: { userId: string; roomId: number }) =>
    post<ApiOk<DuelView>>("/duel/restart", data);

export function duelWsUrl(userId: string, roomId: number) {
    const base = import.meta.env.VITE_APP_BASE_WS || "ws://127.0.0.1:8002/";
    const root = base.endsWith("/") ? base : `${base}/`;
    return `${root}duel/ws?userId=${encodeURIComponent(userId)}&roomId=${roomId}`;
}
