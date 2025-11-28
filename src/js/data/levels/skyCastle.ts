// Level 6: Sky Citadel (Sky Castle)
// Penultimate challenge with wind gusts - Double Jump shines here
import { EnemyType, LevelData } from '../../constants';

export const skyCastle: LevelData = {
    id: 6,
    name: 'Sky Citadel',
    background: 'skyCastle',
    waves: [
        // Wave 1: Introduction to wind + flying theme
        { enemies: [EnemyType.GOBLIN, EnemyType.GOBLIN] },
        // Wave 2: Mix of ground and "aerial" (skeletons jump high)
        { enemies: [EnemyType.SKELETON, EnemyType.GOBLIN, EnemyType.SKELETON] },
        // Wave 3: Serious challenge
        { enemies: [EnemyType.SKELETON, EnemyType.SKELETON, EnemyType.ORC] },
        // Wave 4: Pre-boss warmup - Dragon + support
        { enemies: [EnemyType.DRAGON, EnemyType.SKELETON, EnemyType.SKELETON] },
        // Wave 5: Final wave - intense
        { enemies: [EnemyType.DRAGON, EnemyType.ORC, EnemyType.GOBLIN, EnemyType.GOBLIN] }
    ],
    colors: {
        sky: '#87CEEB',         // Bright sky blue
        skyGradient: '#E0F4FF', // Light horizon
        grass: '#DAA520',       // Golden castle stone
        grassLight: '#FFD700',  // Gold highlights
        ground: '#8B7355'       // Castle foundation
    },
    mechanics: {
        hazards: ['windGusts'],
        modifiers: {},
        windGusts: true,
        windInterval: 240,  // 4 seconds between gusts
        windForce: 4        // Strong push
    }
};
