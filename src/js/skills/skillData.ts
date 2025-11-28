export type SkillBranch = 'combat' | 'defense' | 'utility';
export type SkillTier = 1 | 2 | 3;

export interface Skill {
    id: string;
    name: string;
    description: string;
    branch: SkillBranch;
    tier: SkillTier;
    prerequisite?: string;
    modifier: {
        key: string;
        value: number | boolean;
    };
    icon: string;
}

export const skills: Skill[] = [
    // === COMBAT BRANCH (Red) ===
    {
        id: 'power_strike',
        name: 'Power Strike',
        description: '+15% damage',
        branch: 'combat',
        tier: 1,
        modifier: { key: 'damageMult', value: 0.15 },
        icon: '⚔️'
    },
    {
        id: 'critical_edge',
        name: 'Critical Edge',
        description: '+10% crit, +0.25x crit damage',
        branch: 'combat',
        tier: 2,
        prerequisite: 'power_strike',
        modifier: { key: 'critChanceBonus', value: 0.10 },
        icon: '💥'
    },
    {
        id: 'berserker',
        name: 'Berserker Rage',
        description: '+40% damage when below 30% HP',
        branch: 'combat',
        tier: 3,
        prerequisite: 'critical_edge',
        modifier: { key: 'berserkerMode', value: true },
        icon: '🔥'
    },

    // === DEFENSE BRANCH (Blue) ===
    {
        id: 'tough_skin',
        name: 'Tough Skin',
        description: '+20% max HP',
        branch: 'defense',
        tier: 1,
        modifier: { key: 'healthMult', value: 0.20 },
        icon: '🛡️'
    },
    {
        id: 'iron_will',
        name: 'Iron Will',
        description: '+30% defense',
        branch: 'defense',
        tier: 2,
        prerequisite: 'tough_skin',
        modifier: { key: 'defenseMult', value: 0.30 },
        icon: '🪨'
    },
    {
        id: 'second_wind',
        name: 'Second Wind',
        description: 'Auto-heal 25% HP once per level when near death',
        branch: 'defense',
        tier: 3,
        prerequisite: 'iron_will',
        modifier: { key: 'secondWind', value: true },
        icon: '💨'
    },

    // === UTILITY BRANCH (Green) ===
    {
        id: 'swift_feet',
        name: 'Swift Feet',
        description: '+15% move speed (helps on ice!)',
        branch: 'utility',
        tier: 1,
        modifier: { key: 'speedMult', value: 0.15 },
        icon: '👟'
    },
    {
        id: 'double_jump',
        name: 'Double Jump',
        description: 'Jump again in mid-air',
        branch: 'utility',
        tier: 2,
        prerequisite: 'swift_feet',
        modifier: { key: 'doubleJump', value: true },
        icon: '🦘'
    },
    {
        id: 'gold_rush',
        name: 'Gold Rush',
        description: '+75% gold from enemies',
        branch: 'utility',
        tier: 3,
        prerequisite: 'double_jump',
        modifier: { key: 'goldMult', value: 0.75 },
        icon: '💰'
    }
];

export function getSkillsByBranch(branch: SkillBranch): Skill[] {
    return skills.filter(s => s.branch === branch).sort((a, b) => a.tier - b.tier);
}

export function getSkillById(id: string): Skill | undefined {
    return skills.find(s => s.id === id);
}
