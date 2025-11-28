// Level 4: Frozen Depths (Ice Cave)
import { EnemyType, LevelData } from '../../constants';

export const iceCave: LevelData = {
    id: 4,
    name: 'Frozen Depths',
    background: 'iceCave',
    waves: [
        // Wave 1: Introduction - easy enemies, learn the ice
        { enemies: [EnemyType.SLIME, EnemyType.SLIME, EnemyType.SLIME] },
        // Wave 2: Ramp up - mixing types
        { enemies: [EnemyType.GOBLIN, EnemyType.SLIME, EnemyType.GOBLIN] },
        // Wave 3: Challenge - faster enemies on ice
        { enemies: [EnemyType.GOBLIN, EnemyType.GOBLIN, EnemyType.SKELETON] },
        // Wave 4: Mini-boss feel - Orc is dangerous on slippery floor
        { enemies: [EnemyType.ORC, EnemyType.GOBLIN, EnemyType.GOBLIN] }
    ],
    colors: {
        sky: '#1a3a5c',        // Deep cold blue
        skyGradient: '#0d1f2d', // Darker cave ceiling
        grass: '#a8d8ea',       // Ice/snow surface
        grassLight: '#d4f1f9',  // Sparkly ice highlights
        ground: '#2d5a7b'       // Frozen stone
    },
    mechanics: {
        hazards: ['slipperyFloor'],
        modifiers: {},
        slipperyFloor: true,
        friction: 0.92  // Lower = more slippery (normal is ~0.8)
    }
};
