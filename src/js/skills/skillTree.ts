import { Skill, getSkillById } from './skillData';
import { PlayerStats } from '../playerStats';

export interface SkillTreeState {
    unlockedSkills: Set<string>;
}

export class SkillTree {
    state: SkillTreeState;

    constructor() {
        this.state = {
            unlockedSkills: new Set()
        };
    }

    canUnlock(skill: Skill, availablePoints: number): { allowed: boolean; reason?: string } {
        if (this.state.unlockedSkills.has(skill.id)) {
            return { allowed: false, reason: 'Already unlocked' };
        }

        if (availablePoints < skill.tier) {
            return { allowed: false, reason: `Need ${skill.tier} skill points` };
        }

        if (skill.prerequisite && !this.state.unlockedSkills.has(skill.prerequisite)) {
            const prereq = getSkillById(skill.prerequisite);
            return { allowed: false, reason: `Requires: ${prereq?.name}` };
        }

        return { allowed: true };
    }

    unlock(skill: Skill, playerStats: PlayerStats): boolean {
        const check = this.canUnlock(skill, playerStats.skillPoints);
        if (!check.allowed) return false;

        playerStats.skillPoints -= skill.tier;
        this.state.unlockedSkills.add(skill.id);
        playerStats.applySkillModifier(skill.modifier.key, skill.modifier.value);

        return true;
    }

    isUnlocked(skillId: string): boolean {
        return this.state.unlockedSkills.has(skillId);
    }

    getUnlockedCount(): number {
        return this.state.unlockedSkills.size;
    }

    serialize(): string[] {
        return Array.from(this.state.unlockedSkills);
    }

    deserialize(skillIds: string[], playerStats: PlayerStats): void {
        this.state.unlockedSkills = new Set(skillIds);
        skillIds.forEach(id => {
            const skill = getSkillById(id);
            if (skill) {
                playerStats.applySkillModifier(skill.modifier.key, skill.modifier.value);
            }
        });
    }

    reset(): void {
        this.state.unlockedSkills = new Set();
    }
}
