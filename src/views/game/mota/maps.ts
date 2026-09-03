/** 地图编码：0路 1墙 21金门 22银门 3人物 41-49怪 51上楼梯 52下楼梯 61-68道具 */

export interface FloorMeta {
  name: string;
  map: number[][];
}

export const TILE = {
  ROAD: 0,
  WALL: 1,
  PLAYER: 3,
  GOLD_DOOR: 21,
  SILVER_DOOR: 22,
  STAIRS_UP: 51,
  STAIRS_DOWN: 52,
  DEATH: 99,
  BOSS: 49
} as const;

export const MONSTERS: Record<number, { name: string; hp: number; atk: number; def: number }> = {
  41: { name: "史莱姆", hp: 40, atk: 15, def: 4 },
  42: { name: "蝙蝠", hp: 60, atk: 22, def: 7 },
  43: { name: "骷髅兵", hp: 90, atk: 30, def: 12 },
  44: { name: "骷髅将", hp: 130, atk: 36, def: 16 },
  45: { name: "红史莱姆", hp: 170, atk: 46, def: 20 },
  46: { name: "暗黑法师", hp: 210, atk: 56, def: 26 },
  47: { name: "龙人", hp: 270, atk: 64, def: 32 },
  48: { name: "魔将", hp: 340, atk: 74, def: 38 },
  49: { name: "魔王", hp: 550, atk: 95, def: 48 }
};

/**
 * 精修规则：
 * - 奖励房：道具仅贴一门，其余三面墙；门外至少一格路
 * - 上楼主路 ≥2 怪
 * - 楼梯错位；墙约 48%–58%
 */
export const FLOORS: FloorMeta[] = [
  {
    name: "地下一层",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 51, 0, 1],
      [1, 0, 41, 1, 0, 41, 1, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 0, 0, 0, 41, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 41, 1, 0, 0, 22, 63, 1, 1],
      [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 1, 21, 64, 1, 41, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 42, 0, 1],
      [1, 67, 0, 68, 0, 3, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: "地下二层",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 21, 65, 1, 0, 1],
      [1, 0, 1, 43, 1, 0, 1, 1, 1, 0, 1],
      [1, 41, 0, 0, 1, 0, 44, 0, 1, 51, 1],
      [1, 1, 1, 1, 0, 0, 0, 1, 42, 0, 1],
      [1, 22, 63, 1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 41, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 41, 1, 1, 1],
      [1, 52, 0, 1, 0, 0, 0, 0, 22, 68, 1],
      [1, 0, 67, 1, 0, 0, 64, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 0, 62, 1, 1]
    ]
  },
  {
    name: "地下三层",
    map: [
      [1, 1, 1, 1, 1, 1, 51, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 0, 0, 1, 43, 0, 1],
      [1, 0, 44, 1, 0, 42, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 0, 0, 22, 63, 1, 1],
      [1, 21, 67, 1, 1, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 45, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 42, 1, 21, 64, 1],
      [1, 1, 0, 1, 1, 1, 46, 0, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 62, 1],
      [1, 0, 68, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 52, 1, 1, 1, 66, 1, 1]
    ]
  },
  {
    name: "地下四层",
    map: [
      [1, 1, 51, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 45, 1],
      [1, 0, 22, 63, 1, 0, 0, 1, 43, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 21, 64, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 44, 0, 22, 67, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 45, 1, 0, 0, 52],
      [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 68, 1, 0, 0, 21, 65, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 66, 1, 1]
    ]
  },
  {
    name: "地下五层",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 52, 1, 0, 0, 0, 21, 65, 1],
      [1, 0, 0, 1, 1, 47, 0, 1, 1, 1, 1],
      [1, 1, 22, 63, 1, 0, 1, 0, 44, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 45, 0, 22, 64, 1, 1],
      [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
      [1, 0, 67, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 46, 1, 1, 51, 0, 1],
      [1, 0, 68, 0, 0, 0, 0, 0, 0, 62, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 66, 1, 1]
    ]
  },
  {
    name: "地下六层",
    map: [
      [1, 1, 1, 1, 51, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 1, 0, 48, 0, 1, 1],
      [1, 0, 44, 1, 0, 0, 0, 1, 0, 46, 1],
      [1, 1, 1, 1, 1, 0, 22, 63, 1, 0, 1],
      [1, 21, 65, 1, 0, 47, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 22, 64, 1, 1],
      [1, 0, 67, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 45, 1, 0, 62, 1],
      [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 68, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 52, 1, 1]
    ]
  },
  {
    name: "深渊之厅",
    map: [
      [1, 1, 1, 52, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 0, 0, 1, 48, 0, 1],
      [1, 0, 47, 0, 0, 0, 0, 1, 0, 1, 1],
      [1, 1, 1, 0, 1, 1, 22, 63, 1, 0, 1],
      [1, 21, 65, 1, 0, 46, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 22, 64, 1, 1],
      [1, 0, 67, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 48, 0, 1, 0, 62, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 51],
      [1, 0, 68, 0, 0, 21, 66, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: "王座之间",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 52, 1, 0, 67, 0, 1],
      [1, 0, 22, 63, 1, 0, 0, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 0, 48, 0, 0, 0, 1],
      [1, 21, 65, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 1, 0, 49, 0, 0, 21, 64, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 22, 68, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 62, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    ]
  }
];

export function cloneMap(map: number[][]) {
  return map.map((row) => [...row]);
}

export function createInitialFloorGrids(): number[][][] {
  return FLOORS.map((floor, index) => {
    const map = cloneMap(floor.map);
    if (index !== 0) {
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
          if (map[i][j] === TILE.PLAYER) map[i][j] = TILE.ROAD;
        }
      }
    }
    return map;
  });
}

export function findTile(map: number[][], tile: number) {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === tile) return { x: i, y: j };
    }
  }
  return null;
}

export function clearPlayer(map: number[][]) {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === TILE.PLAYER) map[i][j] = TILE.ROAD;
    }
  }
}

const SPAWN_DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
] as const;

function isWalkable(cell: number) {
  return cell === TILE.ROAD;
}

function findAdjacentRoad(map: number[][], sx: number, sy: number) {
  for (const [dx, dy] of SPAWN_DIRS) {
    const x = sx + dx;
    const y = sy + dy;
    if (x >= 0 && y >= 0 && x < map.length && y < map[0].length && isWalkable(map[x][y])) {
      return { x, y };
    }
  }
  return null;
}

export function getEnterSpawn(map: number[][], enterVia: "up" | "down") {
  const stair = enterVia === "up" ? TILE.STAIRS_DOWN : TILE.STAIRS_UP;
  const stairPos = findTile(map, stair);
  if (!stairPos) return null;
  return findAdjacentRoad(map, stairPos.x, stairPos.y) ?? stairPos;
}

export function calcBattleCost(
  atk: number,
  def: number,
  hp: number,
  monsterId: number
): { win: boolean; cost: number; name: string } | null {
  const monster = MONSTERS[monsterId];
  if (!monster) return null;
  const playerDamage = Math.max(atk - monster.def, 1);
  const monsterDamage = Math.max(monster.atk - def, 1);
  const rounds = Math.ceil(monster.hp / playerDamage);
  const cost = monsterDamage * Math.max(rounds - 1, 0);
  return { win: hp > cost, cost, name: monster.name };
}
