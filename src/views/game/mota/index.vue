<template>
  <div class="mota-page">
    <header class="top-bar">
      <div class="brand">
        <span class="brand-icon">⚔</span>
        <div>
          <h1 class="title">魔塔</h1>
          <p class="subtitle">共 {{ FLOORS.length }} 层 · 收集钥匙探索 · 击败魔王通关</p>
        </div>
      </div>
      <div class="top-actions">
        <a-button size="small" @click="goAdmin">管理后台</a-button>
        <a-button size="small" type="primary" @click="goHome">首页</a-button>
      </div>
    </header>

    <section class="floor-overview">
      <button type="button" class="floor-overview-toggle" @click="mapsOverviewOpen = !mapsOverviewOpen">
        <span>全层地图</span>
        <span class="floor-overview-toggle-meta">{{ FLOORS.length }} 层 · 当前第 {{ floor + 1 }} 层</span>
        <span class="floor-overview-chevron" :class="{ open: mapsOverviewOpen }">▾</span>
      </button>
      <div v-show="mapsOverviewOpen" class="floor-overview-grid">
        <article
          v-for="(meta, i) in FLOORS"
          :key="'floor-map-' + i"
          class="floor-mini"
          :class="{
            active: i === floor,
            visited: visitedFloors.includes(i) && i !== floor
          }"
        >
          <header class="floor-mini-head">
            <span class="floor-mini-num">{{ i + 1 }}</span>
            <span class="floor-mini-name">{{ meta.name }}</span>
          </header>
          <div
            class="floor-mini-board"
            :style="{ '--mini-cell': overviewCellSize + 'px' }"
          >
            <div v-for="(row, ri) in floorGrids[i]" :key="'mr-' + i + '-' + ri" class="floor-mini-row">
              <div
                v-for="(cell, ci) in row"
                :key="'mc-' + i + '-' + ri + '-' + ci"
                class="floor-mini-cell"
                :class="cellClass(cell)"
              />
            </div>
          </div>
        </article>
      </div>
    </section>

    <div class="layout">
      <aside class="side-panel">
        <div class="floor-card">
          <span class="floor-label">当前楼层</span>
          <strong class="floor-num">{{ floor + 1 }} / {{ FLOORS.length }}</strong>
                    <span class="floor-name">{{ FLOORS[floor].name }}</span>
                </div>

        <div class="progress-track">
          <div v-for="(_, i) in FLOORS" :key="i" class="progress-dot"
            :class="{ active: i === floor, done: visitedFloors.includes(i) && i !== floor }" />
        </div>

        <div class="stat-card">
          <div class="stat-row hp-row">
            <span>生命</span>
            <span class="stat-val">{{ hp }}</span>
          </div>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: hpPercent + '%' }" />
          </div>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-key">攻击</span>
              <span class="stat-val">{{ attack }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-key">防御</span>
              <span class="stat-val">{{ defense }}</span>
            </div>
            <div class="stat-item gold">
              <span class="stat-key">金钥匙</span>
              <span class="stat-val">{{ goldKeys }}</span>
            </div>
            <div class="stat-item silver">
              <span class="stat-key">银钥匙</span>
              <span class="stat-val">{{ silverKeys }}</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn-preview" @click="monsterPreviewOpen = true">
          怪物预览
          <span v-if="floorMonsters.length" class="preview-badge">{{ floorMonsterTotal }}</span>
        </button>

        <button type="button" class="btn-restart" @click="restart">重新开始</button>
        <p class="tip">方向键或右侧按钮移动</p>
      </aside>

      <main class="play-area">
        <transition name="toast">
          <div v-if="toast" class="toast">{{ toast }}</div>
        </transition>

        <div class="board-frame">
          <div class="board" :class="{ dead: isDead, shake: shaking }"
            :style="{ '--cols': gridCols, '--cell': cellSize + 'px' }">
            <div v-for="(row, i) in grid" :key="'r-' + i" class="board-row">
              <div v-for="(cell, j) in row" :key="'c-' + i + '-' + j" class="cell" :class="[
                cellClass(cell),
                { 'cell-battle-target': battle?.show && battle.x === i && battle.y === j }
              ]" />
            </div>

            <div v-if="battle?.show" class="battle-overlay">
              <div class="battle-scene">
                <div class="battle-name">{{ battle.name }}</div>
                <div class="battle-arena">
                  <div class="battle-unit hero" :class="{ atk: battle.heroAtk }">
                    <div class="battle-sprite renwu" />
                  </div>
                  <div class="battle-clash">⚔</div>
                  <div class="battle-unit monster" :class="{ hit: battle.monsterHit, dead: battle.monsterDead }">
                    <div class="battle-sprite" :class="`guaiwu${battle.monsterId - 40}`" />
                  </div>
                </div>
                <transition name="dmg-pop">
                  <div v-if="battle.showDamage" class="battle-damage">-{{ battle.cost }} HP</div>
                </transition>
              </div>
            </div>

            <div v-if="isDead" class="overlay">
              <div class="modal death">
                <span class="modal-icon">💀</span>
                <h2>勇者倒下了</h2>
                <p>生命耗尽，魔塔仍在沉睡……</p>
                <button type="button" class="btn-primary" @click="restart">重新挑战</button>
              </div>
            </div>

            <div v-if="isWin" class="overlay">
              <div class="modal win">
                <span class="modal-icon">🏆</span>
                <h2>通关成功！</h2>
                <p>你击败了魔王，魔塔重归平静。</p>
                <div class="win-stats">
                  <span>剩余生命 {{ hp }}</span>
                  <span>攻击 {{ attack }} · 防御 {{ defense }}</span>
                </div>
                <div class="win-actions">
                  <button type="button" class="btn-grade" @click="goCardGrade">卡牌评级</button>
                  <button type="button" class="btn-primary" @click="restart">再玩一次</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dpad">
          <button type="button" class="dpad-btn dpad-up" aria-label="上" @click="move('up')">▲</button>
          <div class="dpad-mid">
            <button type="button" class="dpad-btn" aria-label="左" @click="move('left')">◀</button>
            <button type="button" class="dpad-btn dpad-center" disabled>●</button>
            <button type="button" class="dpad-btn" aria-label="右" @click="move('right')">▶</button>
          </div>
          <button type="button" class="dpad-btn dpad-down" aria-label="下" @click="move('down')">▼</button>
        </div>
      </main>
    </div>

    <a-modal v-model:open="monsterPreviewOpen" :title="`${FLOORS[floor].name} · 怪物预览`" :footer="null"
      width="min(420px, 92vw)" destroyOnClose class="monster-modal">
      <p class="preview-tip">仅统计当前层尚未击败的怪物 · 按你的攻防计算损耗</p>
      <div v-if="!floorMonsters.length" class="preview-empty">本层怪物已全部清除</div>
      <ul v-else class="monster-list">
        <li v-for="item in floorMonsters" :key="item.id" class="monster-item">
          <div class="monster-icon" :class="`guaiwu${item.id - 40}`" />
          <div class="monster-body">
            <div class="monster-head">
              <span class="monster-name">{{ item.name }}</span>
              <span v-if="item.count > 1" class="monster-count">×{{ item.count }}</span>
              <span class="monster-tag" :class="item.canWin ? 'win' : 'lose'">
                {{ item.canWin ? "可战胜" : "无法战胜" }}
              </span>
            </div>
            <div class="monster-stats">
              <span>生命 {{ item.hp }}</span>
              <span>攻击 {{ item.atk }}</span>
              <span>防御 {{ item.def }}</span>
            </div>
            <div class="monster-cost">
              单次损耗 <strong>{{ item.cost }}</strong> HP
              <template v-if="item.count > 1">
                · 全部 {{ item.totalCost }} HP
              </template>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="floorMonsters.length" class="preview-summary">
        <span>剩余 {{ floorMonsterTotal }} 只</span>
        <span>逐只击破约耗 <strong>{{ floorMonsterCostTotal }}</strong> HP</span>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import router from "@/router";
import { setMotaCleared } from "@/utils/mota";
import {
  FLOORS,
  MONSTERS,
  TILE,
  cloneMap,
  calcBattleCost,
  createInitialFloorGrids,
  clearPlayer,
  getEnterSpawn
} from "./maps";

const INIT = { hp: 250, attack: 18, defense: 12, goldKeys: 1, silverKeys: 2 };

const floorGrids = ref<number[][][]>(createInitialFloorGrids());
const floor = ref(0);
const grid = ref<number[][]>(cloneMap(floorGrids.value[0]));
const visitedFloors = ref<number[]>([0]);
const hp = ref(INIT.hp);
const maxHp = ref(INIT.hp);
const attack = ref(INIT.attack);
const defense = ref(INIT.defense);
const goldKeys = ref(INIT.goldKeys);
const silverKeys = ref(INIT.silverKeys);
const isDead = ref(false);
const isWin = ref(false);
const monsterPreviewOpen = ref(false);
const mapsOverviewOpen = ref(true);
const toast = ref("");
const shaking = ref(false);
const battle = ref<{
  show: boolean;
  monsterId: number;
  x: number;
  y: number;
  name: string;
  cost: number;
  heroAtk: boolean;
  monsterHit: boolean;
  showDamage: boolean;
  monsterDead: boolean;
} | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let battleToken = 0;

const isBattling = computed(() => !!battle.value?.show);

const gridCols = computed(() => grid.value[0]?.length ?? 11);
const cellSize = computed(() => {
  const cols = gridCols.value;
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 420) : 420;
  return Math.floor(Math.min(maxW / cols, 40));
});
const overviewCellSize = computed(() => {
  const cols = FLOORS[0]?.map[0]?.length ?? 11;
  const maxW = typeof window !== "undefined" ? window.innerWidth : 680;
  const colsPerRow = maxW >= 900 ? 4 : maxW >= 560 ? 2 : 1;
  const boardMax = Math.floor((maxW - 48) / colsPerRow - 28);
  return Math.max(7, Math.floor(Math.min(boardMax / cols, 14)));
});
const hpPercent = computed(() => Math.min(100, Math.max(0, (hp.value / maxHp.value) * 100)));

interface FloorMonsterPreview {
  id: number;
  name: string;
  hp: number;
  atk: number;
  def: number;
  count: number;
  cost: number;
  totalCost: number;
  canWin: boolean;
}

const floorMonsters = computed<FloorMonsterPreview[]>(() => {
  const counts = new Map<number, number>();
  for (const row of grid.value) {
    for (const cell of row) {
      if (cell > 40 && cell < 50) {
        counts.set(cell, (counts.get(cell) || 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => {
      const monster = MONSTERS[id];
      const battle = calcBattleCost(attack.value, defense.value, hp.value, id);
      const cost = battle?.cost ?? 0;
      return {
        id,
        name: monster.name,
        hp: monster.hp,
        atk: monster.atk,
        def: monster.def,
        count,
        cost,
        totalCost: cost * count,
        canWin: battle?.win ?? false
      };
    })
    .sort((a, b) => a.id - b.id);
});

const floorMonsterTotal = computed(() =>
  floorMonsters.value.reduce((sum, item) => sum + item.count, 0)
);

const floorMonsterCostTotal = computed(() =>
  floorMonsters.value.reduce((sum, item) => sum + item.totalCost, 0)
);

function showToast(msg: string) {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ""; }, 1800);
}

function flashShake() {
  shaking.value = true;
  setTimeout(() => { shaking.value = false; }, 350);
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function playBattleAnimation(
  monsterId: number,
  x: number,
  y: number,
  cost: number,
  name: string
) {
  const token = ++battleToken;
  const monster = MONSTERS[monsterId];
  const playerDamage = Math.max(attack.value - monster.def, 1);
  const rounds = Math.min(4, Math.ceil(monster.hp / playerDamage));

  battle.value = {
    show: true,
    monsterId,
    x,
    y,
    name,
    cost,
    heroAtk: false,
    monsterHit: false,
    showDamage: false,
    monsterDead: false
  };

  for (let i = 0; i < rounds; i++) {
    if (token !== battleToken || !battle.value) return;
    battle.value.heroAtk = true;
    battle.value.monsterHit = false;
    await sleep(90);
    if (token !== battleToken || !battle.value) return;
    battle.value.heroAtk = false;
    battle.value.monsterHit = true;
    if (i === 0) flashShake();
    await sleep(90);
    if (token !== battleToken || !battle.value) return;
    battle.value.monsterHit = false;
  }

  if (token !== battleToken || !battle.value) return;
  battle.value.monsterDead = true;
  battle.value.showDamage = true;
  await sleep(420);
  if (token === battleToken) battle.value = null;
}

function findPlayer(map: number[][]) {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === TILE.PLAYER) return { x: i, y: j };
    }
  }
  return null;
}

function cellClass(cell: number) {
  if (cell === TILE.ROAD) return "lu";
  if (cell === TILE.WALL) return "qiang";
  if (cell === TILE.GOLD_DOOR) return "men1";
  if (cell === TILE.SILVER_DOOR) return "men2";
  if (cell === TILE.PLAYER) return "renwu";
  if (cell === TILE.STAIRS_UP) return "loti1";
  if (cell === TILE.STAIRS_DOWN) return "loti2";
  if (cell === TILE.DEATH) return "lu";
  if (cell >= 41 && cell < 50) return `guaiwu${cell - 40}`;
  if (cell >= 61 && cell < 70) return `daoju${cell - 60}`;
  return "lu";
}

function applyItem(cell: number) {
  const msgs: Record<number, string> = {
    62: "防御 +10",
    63: "攻击 +10",
    64: "攻击防御 +15",
    65: "生命 +100",
    66: "生命 +50",
    67: "获得金钥匙",
    68: "获得银钥匙"
  };
  if (cell === 62) defense.value += 10;
  else if (cell === 63) attack.value += 10;
  else if (cell === 64) { attack.value += 15; defense.value += 15; }
  else if (cell === 65) { hp.value += 100; maxHp.value += 100; }
  else if (cell === 66) hp.value += 50;
  else if (cell === 67) goldKeys.value++;
  else if (cell === 68) silverKeys.value++;
  if (msgs[cell]) showToast(msgs[cell]);
}

function applyMap(map: number[][]) {
  const next = map.map((row) => [...row]);
  floorGrids.value[floor.value] = next;
  grid.value = next;
}

function markVisited(f: number) {
  if (!visitedFloors.value.includes(f)) {
    visitedFloors.value = [...visitedFloors.value, f];
  }
}

function goToFloor(next: number, enterVia: "up" | "down") {
  const leaving = cloneMap(grid.value);
  clearPlayer(leaving);
  floorGrids.value[floor.value] = leaving;

  floor.value = next;
  markVisited(next);

  const nextMap = cloneMap(floorGrids.value[next]);
  clearPlayer(nextMap);
  const spawn = getEnterSpawn(nextMap, enterVia);
  if (spawn) {
    nextMap[spawn.x][spawn.y] = TILE.PLAYER;
  }
  floorGrids.value[next] = nextMap;
  grid.value = nextMap;
    showToast(`进入 ${FLOORS[next].name}`);
}

async function fightMonster(
  map: number[][],
  pos: { x: number; y: number },
  nx: number,
  ny: number,
  monsterId: number
) {
  const result = calcBattleCost(attack.value, defense.value, hp.value, monsterId);
  if (!result) return;

  if (!result.win) {
    showToast(`无法战胜 ${result.name}！`);
    return;
  }

  await playBattleAnimation(monsterId, nx, ny, result.cost, result.name);

  hp.value -= result.cost;
  map[nx][ny] = TILE.PLAYER;
  map[pos.x][pos.y] = TILE.ROAD;
  showToast(`击败 ${result.name}，生命 -${result.cost}`);
  applyMap(map);

  if (monsterId === TILE.BOSS && floor.value === FLOORS.length - 1) {
    setMotaCleared();
    isWin.value = true;
    return;
  }

  if (hp.value <= 0 && !isWin.value) {
    isDead.value = true;
  }
}

async function move(dir: "up" | "down" | "left" | "right") {
  if (isDead.value || isWin.value || isBattling.value) return;

  const pos = findPlayer(grid.value);
  if (!pos) return;

  let nx = pos.x;
  let ny = pos.y;
  if (dir === "up") nx--;
  else if (dir === "down") nx++;
  else if (dir === "left") ny--;
  else ny++;

  if (nx < 0 || ny < 0 || nx >= grid.value.length || ny >= grid.value[0].length) return;

  const target = grid.value[nx][ny];
  const map = grid.value.map((row) => [...row]);

  if (target === TILE.ROAD) {
    map[nx][ny] = TILE.PLAYER;
    map[pos.x][pos.y] = TILE.ROAD;
  } else if (target === TILE.GOLD_DOOR) {
    if (goldKeys.value <= 0) { showToast("需要金钥匙"); return; }
    map[nx][ny] = TILE.PLAYER;
    map[pos.x][pos.y] = TILE.ROAD;
    goldKeys.value--;
    showToast("打开金门");
  } else if (target === TILE.SILVER_DOOR) {
    if (silverKeys.value <= 0) { showToast("需要银钥匙"); return; }
    map[nx][ny] = TILE.PLAYER;
    map[pos.x][pos.y] = TILE.ROAD;
    silverKeys.value--;
    showToast("打开银门");
  } else if (target === TILE.STAIRS_UP) {
    if (floor.value >= FLOORS.length - 1) return;
    map[pos.x][pos.y] = TILE.ROAD;
    floorGrids.value[floor.value] = map;
    goToFloor(floor.value + 1, "up");
    return;
  } else if (target === TILE.STAIRS_DOWN) {
    if (floor.value <= 0) return;
    map[pos.x][pos.y] = TILE.ROAD;
    floorGrids.value[floor.value] = map;
    goToFloor(floor.value - 1, "down");
    return;
  } else if (target > 40 && target < 50) {
    await fightMonster(map, pos, nx, ny, target);
    return;
  } else if (target > 60 && target < 70) {
    applyItem(target);
    map[nx][ny] = TILE.PLAYER;
    map[pos.x][pos.y] = TILE.ROAD;
  } else {
    return;
  }

  applyMap(map);

  if (hp.value <= 0 && !isWin.value) {
    isDead.value = true;
  }
}

function restart() {
  battleToken++;
  battle.value = null;
  floorGrids.value = createInitialFloorGrids();
  visitedFloors.value = [0];
  floor.value = 0;
  hp.value = INIT.hp;
  maxHp.value = INIT.hp;
  attack.value = INIT.attack;
  defense.value = INIT.defense;
  goldKeys.value = INIT.goldKeys;
  silverKeys.value = INIT.silverKeys;
  isDead.value = false;
  isWin.value = false;
  grid.value = cloneMap(floorGrids.value[0]);
  showToast("游戏已重置");
}

function onDocKeydown(e: KeyboardEvent) {
  const keyMap: Record<string, "up" | "down" | "left" | "right"> = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right"
  };
  const dir = keyMap[e.key];
  if (!dir) return;
  e.preventDefault();
  move(dir);
}

function goAdmin() { router.push("/admin"); }
function goHome() { router.push("/home"); }
function goCardGrade() { router.push("/cardGrade"); }

onMounted(() => document.addEventListener("keydown", onDocKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onDocKeydown);
  if (toastTimer) clearTimeout(toastTimer);
  battleToken++;
  battle.value = null;
});
</script>

<style lang="less" scoped>
.mota-page {
  min-height: 100dvh;
  padding: 12px;
  box-sizing: border-box;
  background: linear-gradient(160deg, #0f0c1a 0%, #1a1530 40%, #0d1117 100%);
  color: #e2e8f0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #f8fafc;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #94a3b8;
}

.top-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  align-items: flex-start;
}

.side-panel {
  width: 168px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floor-card {
  padding: 14px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(167, 139, 250, 0.3);
  text-align: center;
}

.floor-label {
  display: block;
  font-size: 10px;
  color: #a5b4fc;
  letter-spacing: 0.05em;
}

.floor-num {
  display: block;
  margin: 4px 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.floor-name {
    font-size: 12px;
    color: #c4b5fd;
}

.progress-track {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 4px 0;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.2s;

  &.active {
    width: 20px;
    border-radius: 4px;
    background: #a78bfa;
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
  }

  &.done {
    background: #6366f1;
  }
}

.stat-card {
  padding: 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.stat-val {
  font-weight: 700;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.hp-bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: 12px;
}

.hp-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ef4444, #f87171);
  transition: width 0.25s ease;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  padding: 8px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  text-align: center;

  &.gold .stat-val {
    color: #fbbf24;
  }

  &.silver .stat-val {
    color: #cbd5e1;
  }
}

.stat-key {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 2px;
}

.btn-preview {
  position: relative;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.08);
  }

  &:active {
    filter: brightness(0.92);
  }
}

.preview-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #fbbf24;
  color: #422006;
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
}

.btn-restart {
  height: 38px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.08);
  }

  &:active {
    filter: brightness(0.92);
  }
}

.tip {
  margin: 0;
  font-size: 10px;
  color: #64748b;
  text-align: center;
}

.play-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.toast {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(167, 139, 250, 0.4);
  color: #e9d5ff;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

.board-frame {
  padding: 3px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4c1d95, #312e81, #1e1b4b);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.board {
  position: relative;
  padding: 8px;
  border-radius: 14px;
  background: #1c1917;
  transition: filter 0.3s;

  &.dead {
    filter: grayscale(0.5) brightness(0.7);
  }

  &.shake {
    animation: shake 0.35s ease;
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-3px);
  }

  75% {
    transform: translateX(3px);
  }
}

.board-row {
  display: flex;
}

.cell {
  width: var(--cell);
  height: var(--cell);
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
  transition: filter 0.15s, transform 0.15s;

  &.cell-battle-target {
    z-index: 2;
    filter: brightness(1.25);
    animation: battle-target-pulse 0.45s ease-in-out infinite alternate;
  }
}

@keyframes battle-target-pulse {
  from {
    box-shadow: inset 0 0 0 2px rgba(251, 191, 36, 0.35);
  }

  to {
    box-shadow: inset 0 0 0 2px rgba(251, 191, 36, 0.85);
  }
}

.battle-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 14px;
  pointer-events: none;
}

.battle-scene {
  width: min(92%, 220px);
  padding: 12px 10px 10px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(30, 27, 75, 0.96), rgba(15, 23, 42, 0.96));
  border: 1px solid rgba(167, 139, 250, 0.45);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  text-align: center;
}

.battle-name {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fde68a;
  letter-spacing: 0.04em;
}

.battle-arena {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.battle-unit {
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.09s ease, filter 0.09s ease, opacity 0.25s ease;

  &.hero.atk {
    transform: translateX(10px) scale(1.08);
  }

  &.monster.hit {
    transform: translateX(4px) scale(0.92);
    filter: brightness(1.8) sepia(0.35) saturate(4);
    animation: monster-hit 0.09s ease;
  }

  &.monster.dead {
    transform: scale(0.2) rotate(18deg);
    opacity: 0;
  }
}

@keyframes monster-hit {

  0%,
  100% {
    transform: translateX(4px) scale(0.92);
  }

  50% {
    transform: translateX(8px) scale(0.88);
  }
}

.battle-sprite {
  width: 44px;
  height: 44px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
}

.battle-clash {
  font-size: 16px;
  color: #fbbf24;
  animation: clash-spin 0.6s linear infinite;
}

@keyframes clash-spin {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.battle-damage {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 800;
  color: #f87171;
  text-shadow: 0 0 8px rgba(248, 113, 113, 0.55);
  font-variant-numeric: tabular-nums;
}

.dmg-pop-enter-active {
  animation: dmg-pop-in 0.35s ease;
}

.dmg-pop-leave-active {
  transition: opacity 0.15s ease;
}

@keyframes dmg-pop-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.85);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.lu {
  background-image: url("./img/bg.png");
}

.qiang {
  background-image: url("./img/q.png");
}

.men1 {
  background-image: url("./img/m1.png");
}

.men2 {
  background-image: url("./img/m2.png");
}

.renwu {
  background-image: url("./img/rw.png");
}

.loti1 {
  background-image: url("./img/lt1.png");
}

.loti2 {
  background-image: url("./img/lt2.png");
}

.daoju1 {
  background-image: url("./img/bz.png");
}

.daoju2 {
  background-image: url("./img/dun.png");
}

.daoju3 {
  background-image: url("./img/j.png");
}

.daoju4 {
  background-image: url("./img/jl.png");
}

.daoju5 {
  background-image: url("./img/ys1.png");
}

.daoju6 {
  background-image: url("./img/ys2.png");
}

.daoju7 {
  background-image: url("./img/yshi1.png");
}

.daoju8 {
  background-image: url("./img/yshi2.png");
}

.guaiwu1 {
  background-image: url("./img/1.png");
}

.guaiwu2 {
  background-image: url("./img/2.png");
}

.guaiwu3 {
  background-image: url("./img/3.png");
}

.guaiwu4 {
  background-image: url("./img/4.png");
}

.guaiwu5 {
  background-image: url("./img/5.png");
}

.guaiwu6 {
  background-image: url("./img/6.png");
}

.guaiwu7 {
  background-image: url("./img/7.png");
}

.guaiwu8 {
  background-image: url("./img/8.png");
}

.guaiwu9 {
  background-image: url("./img/9.png");
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 14px;
  backdrop-filter: blur(2px);
}

.modal {
  width: min(260px, 85%);
  padding: 24px 20px;
  border-radius: 16px;
  text-align: center;

  &.death {
    background: linear-gradient(160deg, #450a0a, #7f1d1d);
    border: 1px solid rgba(248, 113, 113, 0.3);
  }

  &.win {
    background: linear-gradient(160deg, #422006, #713f12);
    border: 1px solid rgba(251, 191, 36, 0.35);
  }

  h2 {
    margin: 8px 0 6px;
    font-size: 1.15rem;
    color: #fff;
  }

  p {
    margin: 0 0 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
  }
}

.modal-icon {
  font-size: 2rem;
  line-height: 1;
}

.win-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
  font-size: 11px;
  color: #fde68a;
}

.win-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-grade {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f9bc4, #0284c7);
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    filter: brightness(1.06);
  }
}

.btn-primary {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    filter: brightness(1.06);
  }
}

.dpad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dpad-mid {
  display: flex;
  gap: 4px;
}

.dpad-btn {
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #c4b5fd;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:active:not(:disabled) {
    background: rgba(139, 92, 246, 0.35);
    transform: scale(0.94);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
}

@media (min-width: 768px) {
  .mota-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px;
  }

  .layout {
    flex-wrap: nowrap;
    align-items: flex-start;
  }

  .side-panel {
    width: 180px;
  }
}

.floor-overview {
  margin-bottom: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.floor-overview-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.floor-overview-toggle-meta {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.floor-overview-chevron {
  color: #a5b4fc;
  transition: transform 0.2s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.floor-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 10px 12px;
}

.floor-mini {
  padding: 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;

  &.active {
    border-color: rgba(167, 139, 250, 0.75);
    box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.35);
  }

  &.visited {
    border-color: rgba(99, 102, 241, 0.45);
  }
}

.floor-mini-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.floor-mini-num {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.35);
  color: #e0e7ff;
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}

.floor-mini-name {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.floor-mini-board {
  display: inline-block;
  padding: 4px;
  border-radius: 8px;
  background: #1c1917;
}

.floor-mini-row {
  display: flex;
}

.floor-mini-cell {
  width: var(--mini-cell);
  height: var(--mini-cell);
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
}

@media (min-width: 560px) {
  .floor-overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .floor-overview-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.preview-tip {
  margin: 0 0 12px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.preview-empty {
  padding: 28px 12px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 10px;
}

.monster-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow-y: auto;
}

.monster-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.monster-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
  border: 2px solid #cbd5e1;
}

.monster-body {
  flex: 1;
  min-width: 0;
}

.monster-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.monster-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.monster-count {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.monster-tag {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;

  &.win {
    background: #dcfce7;
    color: #15803d;
  }

  &.lose {
    background: #fee2e2;
    color: #b91c1c;
  }
}

.monster-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #475569;
  margin-bottom: 4px;
}

.monster-cost {
  font-size: 11px;
  color: #64748b;

  strong {
    color: #dc2626;
    font-variant-numeric: tabular-nums;
  }
}

.preview-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #eef2ff;
  font-size: 12px;
  color: #4338ca;

  strong {
    font-variant-numeric: tabular-nums;
  }
}
</style>

<style lang="less">
.monster-modal {
  .guaiwu1 {
    background-image: url("./img/1.png");
  }

  .guaiwu2 {
    background-image: url("./img/2.png");
  }

  .guaiwu3 {
    background-image: url("./img/3.png");
  }

  .guaiwu4 {
    background-image: url("./img/4.png");
  }

  .guaiwu5 {
    background-image: url("./img/5.png");
  }

  .guaiwu6 {
    background-image: url("./img/6.png");
  }

  .guaiwu7 {
    background-image: url("./img/7.png");
  }

  .guaiwu8 {
    background-image: url("./img/8.png");
  }

  .guaiwu9 {
    background-image: url("./img/9.png");
  }
}
</style>
