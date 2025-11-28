// Game constants
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// Game states
export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    SHOP: 'shop',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
} as const;

export type GameStateType = typeof GameState[keyof typeof GameState];

// Colors
export const Colors = {
    SKY: '#87ceeb',
    GRASS: '#27ae60',
    GRASS_LIGHT: '#2ecc71',
    DIRT: '#8b4513',
    DIRT_LIGHT: '#a0522d',
    GOLD: '#ffd700',
    RED: '#e74c3c',
    WHITE: '#ffffff',
    BLACK: '#000000'
} as const;

// Equipment types
export const EquipmentType = {
    SWORD: 'sword',
    ARMOR: 'armor',
    HELMET: 'helmet',
    BOOTS: 'boots'
} as const;

export type EquipmentTypeKey = typeof EquipmentType[keyof typeof EquipmentType];

// Equipment tier interface
export interface EquipmentTierData {
    name: string;
    color: string;
    multiplier: number;
}

// Equipment tiers
export const EquipmentTier: Record<string, EquipmentTierData> = {
    BASIC: { name: 'Basic', color: '#95a5a6', multiplier: 1 },
    IRON: { name: 'Iron', color: '#7f8c8d', multiplier: 1.25 },
    STEEL: { name: 'Steel', color: '#bdc3c7', multiplier: 1.5 },
    GOLD: { name: 'Gold', color: '#f1c40f', multiplier: 1.75 },
    DIAMOND: { name: 'Diamond', color: '#3498db', multiplier: 2 },
    LEGENDARY: { name: 'Legendary', color: '#9b59b6', multiplier: 2.5 }
};

// Enemy types
export const EnemyType = {
    SLIME: 'slime',
    GOBLIN: 'goblin',
    SKELETON: 'skeleton',
    ORC: 'orc',
    DRAGON: 'dragon',
    BOSS_DRAGON: 'boss_dragon'
} as const;

export type EnemyTypeKey = typeof EnemyType[keyof typeof EnemyType];

// Level mechanics interface
export interface LevelMechanics {
    hazards: string[];
    modifiers: Record<string, unknown>;
    slipperyFloor?: boolean;
    friction?: number;
    windGusts?: boolean;
    windInterval?: number;
    windForce?: number;
}

// Level colors interface
export interface LevelColors {
    sky: string;
    skyGradient: string;
    grass: string;
    grassLight: string;
    ground: string;
}

// Wave interface
export interface Wave {
    enemies: EnemyTypeKey[];
}

// Level interface
export interface LevelData {
    id: number;
    name: string;
    background: string;
    waves: Wave[];
    colors: LevelColors;
    mechanics?: LevelMechanics;
}
