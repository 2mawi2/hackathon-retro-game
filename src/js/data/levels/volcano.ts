// Level 5: Dragon's Lair (Volcano)
import { EnemyType } from '../../constants';

export const volcano = {
    id: 5,
    name: "Dragon's Lair",
    background: 'volcano',
    waves: [
        { enemies: [EnemyType.ORC, EnemyType.ORC, EnemyType.SKELETON] },
        { enemies: [EnemyType.DRAGON] },
        { enemies: [EnemyType.DRAGON, EnemyType.ORC] }
    ],
    colors: {
        sky: '#922b21',
        skyGradient: '#641e16',
        grass: '#7b241c',
        grassLight: '#943126',
        ground: '#4a1c1c'
    },
    mechanics: {
        hazards: [],
        modifiers: {}
    }
};
