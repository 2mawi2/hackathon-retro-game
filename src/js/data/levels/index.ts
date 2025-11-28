// Level Registry - Import all level definitions here
// New levels should be added as separate files and imported here

import { forest } from './forest';
import { graveyard } from './graveyard';
import { mountains } from './mountains';
import { volcano } from './volcano';
import { skyCastle } from './skyCastle';
import { castle } from './castle';

// Export all levels in order
// To add a new level: 1) Create new file, 2) Import above, 3) Add to array
export const levels = [
    forest,      // 1 - Tutorial
    graveyard,   // 2 - Night theme
    mountains,   // 3 - Vertical challenge
    volcano,     // 4 - Fire hazards
    skyCastle,   // 5 - Wind mechanic
    castle       // 6 - Final boss
];

// Helper to get level by ID
export function getLevelById(id) {
    return levels.find(l => l.id === id);
}

// Helper to get level by name
export function getLevelByName(name) {
    return levels.find(l => l.name.toLowerCase() === name.toLowerCase());
}
