// Level 3: The Mountains
import { EnemyType } from '../../constants.js';

export const mountains = {
    id: 3,
    name: 'The Mountains',
    background: 'mountains',
    waves: [
        { enemies: [EnemyType.ORC, EnemyType.GOBLIN] },
        { enemies: [EnemyType.ORC, EnemyType.ORC] },
        { enemies: [EnemyType.ORC, EnemyType.SKELETON, EnemyType.SKELETON] }
    ],
    colors: {
        sky: '#85929e',
        skyGradient: '#5d6d7e',
        grass: '#5d6d7e',
        grassLight: '#7f8c8d',
        ground: '#626567'
    },
    mechanics: {
        hazards: [],
        modifiers: {}
    }
};
