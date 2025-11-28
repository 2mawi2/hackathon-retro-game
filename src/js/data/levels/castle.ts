// Level 7: The Final Battle (Castle)
import { EnemyType } from '../../constants';

export const castle = {
    id: 7,
    name: 'The Final Battle',
    background: 'castle',
    waves: [
        { enemies: [EnemyType.DRAGON, EnemyType.ORC, EnemyType.ORC] },
        { enemies: [EnemyType.DRAGON, EnemyType.DRAGON] },
        { enemies: [EnemyType.BOSS_DRAGON] }
    ],
    colors: {
        sky: '#4a235a',
        skyGradient: '#1a0a2e',
        grass: '#512e5f',
        grassLight: '#6c3483',
        ground: '#2e1a47'
    },
    mechanics: {
        hazards: [],
        modifiers: {}
    }
};
