// Player Stats - Separated for skill tree modifications
import { EquipmentTier } from './constants.js';

export class PlayerStats {
    constructor() {
        // Base stats
        this.baseHealth = 100;
        this.baseDamage = 15;
        this.baseSpeed = 4;
        this.baseDefense = 0;
        this.baseCritChance = 0.1;
        this.baseCritMultiplier = 1.5;
        this.baseJumpForce = -12;

        // Calculated stats (after equipment + skills)
        this.maxHealth = this.baseHealth;
        this.damage = this.baseDamage;
        this.speed = this.baseSpeed;
        this.defense = this.baseDefense;
        this.critChance = this.baseCritChance;
        this.critMultiplier = this.baseCritMultiplier;
        this.jumpForce = this.baseJumpForce;

        // Skill modifiers (added by skill tree)
        this.skillModifiers = {
            healthMult: 1,
            damageMult: 1,
            speedMult: 1,
            defenseMult: 1,
            critChanceBonus: 0,
            critMultBonus: 0,
            jumpForceMult: 1,
            // Special abilities unlocked by skills
            doubleJump: false,
            dashAbility: false,
            shieldAbility: false,
            lifeSteal: 0,
            attackSpeed: 1
        };

        // Equipment
        this.equipment = {
            sword: EquipmentTier.BASIC,
            armor: EquipmentTier.BASIC,
            helmet: EquipmentTier.BASIC,
            boots: EquipmentTier.BASIC
        };

        // Progression
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.gold = 0;
        this.skillPoints = 0;
    }

    // Recalculate all stats based on equipment, level, and skills
    recalculate() {
        const swordMult = this.equipment.sword.multiplier;
        const armorMult = this.equipment.armor.multiplier;
        const helmetMult = this.equipment.helmet.multiplier;
        const bootsMult = this.equipment.boots.multiplier;

        const levelBonus = 1 + (this.level - 1) * 0.1;

        // Apply equipment + level + skill modifiers
        this.damage = Math.floor(
            this.baseDamage * swordMult * levelBonus * this.skillModifiers.damageMult
        );
        this.maxHealth = Math.floor(
            this.baseHealth * armorMult * (1 + (this.level - 1) * 0.05) * this.skillModifiers.healthMult
        );
        this.defense = Math.floor(
            this.baseDefense + 5 * helmetMult * this.skillModifiers.defenseMult
        );
        this.speed = this.baseSpeed * (0.9 + bootsMult * 0.2) * this.skillModifiers.speedMult;
        this.critChance = this.baseCritChance + this.skillModifiers.critChanceBonus;
        this.critMultiplier = this.baseCritMultiplier + this.skillModifiers.critMultBonus;
        this.jumpForce = this.baseJumpForce * this.skillModifiers.jumpForceMult;
    }

    addExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        while (this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.level++;
            this.skillPoints++; // Grant skill point on level up
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
            leveledUp = true;
        }
        if (leveledUp) {
            this.recalculate();
        }
        return leveledUp;
    }

    addGold(amount) {
        this.gold += amount;
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    // Apply a skill modifier (called by skill tree system)
    applySkillModifier(key, value) {
        if (key in this.skillModifiers) {
            if (typeof this.skillModifiers[key] === 'boolean') {
                this.skillModifiers[key] = value;
            } else {
                this.skillModifiers[key] += value;
            }
            this.recalculate();
        }
    }

    // Reset skill modifiers (for respec)
    resetSkillModifiers() {
        this.skillModifiers = {
            healthMult: 1,
            damageMult: 1,
            speedMult: 1,
            defenseMult: 1,
            critChanceBonus: 0,
            critMultBonus: 0,
            jumpForceMult: 1,
            doubleJump: false,
            dashAbility: false,
            shieldAbility: false,
            lifeSteal: 0,
            attackSpeed: 1
        };
        this.recalculate();
    }
}
