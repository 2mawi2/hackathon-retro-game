// Level 2: The Graveyard
import { EnemyType } from '../../constants.js';

export const graveyard = {
    id: 2,
    name: 'The Graveyard',
    background: 'graveyard',
    waves: [
        { enemies: [EnemyType.SKELETON, EnemyType.SKELETON] },
        { enemies: [EnemyType.SKELETON, EnemyType.GOBLIN, EnemyType.GOBLIN] },
        { enemies: [EnemyType.SKELETON, EnemyType.SKELETON, EnemyType.SKELETON] }
    ],
    colors: {
        sky: '#2c3e50',
        skyGradient: '#1a252f',
        grass: '#1e3d2f',
        grassLight: '#2d5a45',
        ground: '#4a4a4a'
    },
    mechanics: {
        hazards: [],
        modifiers: {}
    }
};
