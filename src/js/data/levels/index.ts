// Level Registry - Import all level definitions here
// New levels should be added as separate files and imported here

import { forest } from './forest';
import { graveyard } from './graveyard';
import { mountains } from './mountains';
import { volcano } from './volcano';
import { castle } from './castle';

// Export all levels in order
// To add a new level: 1) Create new file, 2) Import above, 3) Add to array
export const levels = [
    forest,
    graveyard,
    mountains,
    volcano,
    castle
];

// Helper to get level by ID
export function getLevelById(id) {
    return levels.find(l => l.id === id);
}

// Helper to get level by name
export function getLevelByName(name) {
    return levels.find(l => l.name.toLowerCase() === name.toLowerCase());
}
