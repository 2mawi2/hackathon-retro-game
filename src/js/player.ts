import { CANVAS_WIDTH, EquipmentTier, EquipmentTierData, LevelMechanics } from './constants';

export class Player {
    playerNum: number;
    x: number;
    y: number;
    width: number;
    height: number;
    baseSpeed: number;
    speed: number;
    maxHealth: number;
    health: number;
    baseDamage: number;
    damage: number;
    defense: number;
    critChance: number;
    critMultiplier: number;
    facing: number;
    attacking: boolean;
    attackTimer: number;
    attackCooldown: number;
    invincible: boolean;
    invincibleTimer: number;
    knockbackX: number;
    knockbackY: number;
    velocityX: number;
    velocityY: number;
    isGrounded: boolean;
    jumpForce: number;
    gravity: number;
    groundY: number;
    animFrame: number;
    animTimer: number;
    walkCycle: number;
    equipment: {
        sword: EquipmentTierData;
        armor: EquipmentTierData;
        helmet: EquipmentTierData;
        boots: EquipmentTierData;
    };
    exp: number;
    level: number;
    expToNextLevel: number;
    gold: number;
    type: string;
    colors: { primary: string; secondary: string; accent: string };

    constructor(playerNum: number, x: number, y: number) {
        this.playerNum = playerNum;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.baseSpeed = 4;
        this.speed = this.baseSpeed;

        // Stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.baseDamage = 15;
        this.damage = this.baseDamage;
        this.defense = 0;
        this.critChance = 0.1;
        this.critMultiplier = 1.5;

        // State
        this.facing = 1; // 1 = right, -1 = left
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;

        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.jumpForce = -12;
        this.gravity = 0.5;
        this.groundY = y + this.height; // Will be set properly in update

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.walkCycle = 0;

        // Equipment (stored as tier names)
        this.equipment = {
            sword: EquipmentTier.BASIC,
            armor: EquipmentTier.BASIC,
            helmet: EquipmentTier.BASIC,
            boots: EquipmentTier.BASIC
        };

        // Experience and gold
        this.exp = 0;
        this.level = 1;
        this.expToNextLevel = 100;
        this.gold = 0;

        // Player specific visuals
        if (playerNum === 1) {
            this.type = 'knight';
            this.colors = {
                primary: '#c0c0c0',
                secondary: '#888888',
                accent: '#e74c3c' // red plume
            };
        } else {
            this.type = 'robot';
            this.colors = {
                primary: '#3498db',
                secondary: '#2980b9',
                accent: '#2ecc71' // green lights
            };
        }
    }

    calculateStats() {
        // Calculate stats based on equipment
        const swordMult = this.equipment.sword.multiplier;
        const armorMult = this.equipment.armor.multiplier;
        const helmetMult = this.equipment.helmet.multiplier;
        const bootsMult = this.equipment.boots.multiplier;

        this.damage = Math.floor(this.baseDamage * swordMult * (1 + (this.level - 1) * 0.1));
        this.maxHealth = Math.floor(100 * armorMult * (1 + (this.level - 1) * 0.05));
        this.defense = Math.floor(5 * helmetMult);
        this.speed = this.baseSpeed * (0.9 + bootsMult * 0.2);

        // Keep health percentage when upgrading
        const healthPercent = this.health / this.maxHealth;
        this.health = Math.floor(this.maxHealth * healthPercent);
    }

    update(inputState: { left: boolean; right: boolean; up: boolean; attack: boolean }, groundY: number, levelMechanics?: LevelMechanics) {
        this.groundY = groundY;

        // Handle knockback
        if (this.knockbackX !== 0) {
            this.x += this.knockbackX;
            this.knockbackX *= 0.8;
            if (Math.abs(this.knockbackX) < 0.5) this.knockbackX = 0;
        }

        // Horizontal movement with ice physics
        const friction = levelMechanics?.slipperyFloor
            ? (levelMechanics.friction || 0.92)
            : 0.8;

        let targetVelocityX = 0;
        let moving = false;
        if (inputState.left) {
            targetVelocityX = -this.speed;
            this.facing = -1;
            moving = true;
        }
        if (inputState.right) {
            targetVelocityX = this.speed;
            this.facing = 1;
            moving = true;
        }

        // On ice: gradually accelerate/decelerate (sliding feel)
        // Normal: instant velocity change
        if (levelMechanics?.slipperyFloor) {
            this.velocityX = this.velocityX * friction + targetVelocityX * (1 - friction) * 0.5;
        } else {
            this.velocityX = targetVelocityX;
        }

        this.x += this.velocityX;

        // Jump - only when grounded
        if (inputState.up && this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
        }

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        const groundLevel = groundY - this.height;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            this.isGrounded = true;
        }

        // Walk animation (only when moving on ground)
        if (moving && this.isGrounded) {
            this.walkCycle += 0.2;
        } else if (this.isGrounded) {
            this.walkCycle = 0;
        }

        // Bounds checking (horizontal only)
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

        // Attack
        if (inputState.attack && this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackTimer = 20;
            this.attackCooldown = 30;
        }

        // Update timers
        if (this.attacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.attacking = false;
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Animation timer
        this.animTimer++;
        if (this.animTimer >= 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    getAttackHitbox() {
        if (!this.attacking || this.attackTimer < 15) return null;

        const attackWidth = 50;
        const attackHeight = this.height;

        return {
            x: this.facing === 1 ? this.x + this.width : this.x - attackWidth,
            y: this.y,
            width: attackWidth,
            height: attackHeight
        };
    }

    takeDamage(amount, knockbackDir = 0) {
        if (this.invincible) return 0;

        const actualDamage = Math.max(1, amount - this.defense);
        this.health -= actualDamage;
        this.invincible = true;
        this.invincibleTimer = 60;
        this.knockbackX = knockbackDir * 8;

        if (this.health <= 0) {
            this.health = 0;
        }

        return actualDamage;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.level++;
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
            this.calculateStats();
            this.health = this.maxHealth; // Full heal on level up
        }
    }

    addGold(amount) {
        this.gold += amount;
    }

    draw(ctx) {
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
            return;
        }

        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const bounce = Math.sin(this.walkCycle) * 2;

        if (this.type === 'knight') {
            this.drawKnight(ctx, x, y + bounce);
        } else {
            this.drawRobot(ctx, x, y + bounce);
        }
    }

    drawKnight(ctx, x, y) {
        const swordColor = this.equipment.sword.color;
        const armorColor = this.equipment.armor.color;
        const helmetColor = this.equipment.helmet.color;

        // Helmet
        ctx.fillStyle = helmetColor;
        ctx.fillRect(x + 8, y, 24, 20);
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 10, y + 8, 20, 8);

        // Plume
        ctx.fillStyle = this.colors.accent;
        ctx.fillRect(x + 14, y - 10, 12, 12);
        ctx.fillRect(x + 12, y - 6, 16, 4);

        // Body armor
        ctx.fillStyle = armorColor;
        ctx.fillRect(x + 5, y + 20, 30, 25);

        // Armor detail
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 17, y + 22, 6, 20);

        // Legs
        const legOffset = Math.sin(this.walkCycle) * 3;
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 8, y + 45 - legOffset, 10, 15);
        ctx.fillRect(x + 22, y + 45 + legOffset, 10, 15);

        // Sword
        ctx.fillStyle = swordColor;
        if (this.attacking) {
            // Attack swing
            const swingProgress = 1 - (this.attackTimer / 20);
            if (this.facing === 1) {
                ctx.save();
                ctx.translate(x + 35, y + 25);
                ctx.rotate(-Math.PI/2 + swingProgress * Math.PI);
                ctx.fillRect(0, -3, 45, 6);
                // Sword guard
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(-5, -6, 10, 12);
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(x + 5, y + 25);
                ctx.rotate(Math.PI/2 - swingProgress * Math.PI);
                ctx.fillRect(-45, -3, 45, 6);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(-5, -6, 10, 12);
                ctx.restore();
            }
        } else {
            // Idle sword position
            if (this.facing === 1) {
                ctx.fillRect(x + 35, y + 18, 8, 30);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x + 33, y + 15, 12, 6);
            } else {
                ctx.fillRect(x - 3, y + 18, 8, 30);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x - 5, y + 15, 12, 6);
            }
        }
    }

    drawRobot(ctx, x, y) {
        const primaryColor = this.equipment.armor.color;
        const accentColor = this.colors.accent;

        // Antenna
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 15, y - 10, 4, 10);
        ctx.fillStyle = this.attacking ? '#ff0' : '#f00';
        ctx.fillRect(x + 13, y - 14, 8, 6);

        // Head
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x + 5, y, 25, 20);

        // Eyes
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 9, y + 6, 6, 6);
        ctx.fillRect(x + 20, y + 6, 6, 6);

        // Eye glow
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 10, y + 7, 2, 2);
        ctx.fillRect(x + 21, y + 7, 2, 2);

        // Body
        ctx.fillStyle = this.colors.secondary;
        ctx.fillRect(x + 3, y + 20, 29, 24);

        // Chest panel
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 8, y + 24, 19, 16);

        // Chest lights
        ctx.fillStyle = this.attacking ? '#f00' : accentColor;
        ctx.fillRect(x + 11, y + 27, 5, 5);
        ctx.fillRect(x + 19, y + 27, 5, 5);
        ctx.fillRect(x + 15, y + 34, 5, 5);

        // Legs
        const legOffset = Math.sin(this.walkCycle) * 3;
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x + 6, y + 44 - legOffset, 10, 16);
        ctx.fillRect(x + 19, y + 44 + legOffset, 10, 16);

        // Arms/weapon
        ctx.fillStyle = '#555';
        if (this.attacking) {
            if (this.facing === 1) {
                ctx.fillRect(x + 32, y + 22, 25, 10);
                // Laser beam
                ctx.fillStyle = '#ff0';
                ctx.fillRect(x + 57, y + 24, 20, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 57, y + 26, 20, 2);
            } else {
                ctx.fillRect(x - 22, y + 22, 25, 10);
                ctx.fillStyle = '#ff0';
                ctx.fillRect(x - 42, y + 24, 20, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x - 42, y + 26, 20, 2);
            }
        } else {
            if (this.facing === 1) {
                ctx.fillRect(x + 32, y + 24, 8, 16);
            } else {
                ctx.fillRect(x - 5, y + 24, 8, 16);
            }
        }
    }

    reset() {
        this.health = this.maxHealth;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = true;
    }
}
