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
};

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
};

// Equipment types
export const EquipmentType = {
    SWORD: 'sword',
    ARMOR: 'armor',
    HELMET: 'helmet',
    BOOTS: 'boots'
};

// Equipment tiers
export const EquipmentTier = {
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
};
