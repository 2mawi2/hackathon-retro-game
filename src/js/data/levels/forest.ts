// Level 1: The Forest
import { EnemyType } from '../../constants';

export const forest = {
    id: 1,
    name: 'The Forest',
    background: 'forest',
    waves: [
        { enemies: [EnemyType.SLIME, EnemyType.SLIME, EnemyType.SLIME] },
        { enemies: [EnemyType.SLIME, EnemyType.SLIME, EnemyType.GOBLIN] },
        { enemies: [EnemyType.GOBLIN, EnemyType.GOBLIN] }
    ],
    colors: {
        sky: '#87ceeb',
        skyGradient: '#5dade2',
        grass: '#27ae60',
        grassLight: '#2ecc71',
        ground: '#8b4513'
    },
    // Optional level-specific mechanics
    mechanics: {
        hazards: [],
        modifiers: {}
    }
};
