// Player Renderer - Handles all player drawing
// Animation system will hook into this

export class PlayerRenderer {
    constructor(playerType) {
        this.playerType = playerType; // 'knight' or 'robot'

        // Colors based on type
        if (playerType === 'knight') {
            this.colors = {
                primary: '#c0c0c0',
                secondary: '#888888',
                accent: '#e74c3c'
            };
        } else {
            this.colors = {
                primary: '#3498db',
                secondary: '#2980b9',
                accent: '#2ecc71'
            };
        }

        // Animation state (will be managed by animation system)
        this.animState = 'idle'; // idle, walk, jump, attack, hurt
        this.animFrame = 0;
        this.animTimer = 0;
    }

    // Update animation state based on player state
    updateAnimation(player, deltaTime) {
        this.animTimer++;
        if (this.animTimer >= 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Determine animation state
        if (player.attacking) {
            this.animState = 'attack';
        } else if (!player.isGrounded) {
            this.animState = 'jump';
        } else if (player.walkCycle !== 0) {
            this.animState = 'walk';
        } else {
            this.animState = 'idle';
        }
    }

    draw(ctx, player) {
        // Flash when invincible
        if (player.invincible && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
            return;
        }

        const x = Math.floor(player.x);
        const y = Math.floor(player.y);
        const bounce = Math.sin(player.walkCycle) * 2;

        if (this.playerType === 'knight') {
            this.drawKnight(ctx, x, y + bounce, player);
        } else {
            this.drawRobot(ctx, x, y + bounce, player);
        }
    }

    drawKnight(ctx, x, y, player) {
        const swordColor = player.stats.equipment.sword.color;
        const armorColor = player.stats.equipment.armor.color;
        const helmetColor = player.stats.equipment.helmet.color;

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
        const legOffset = Math.sin(player.walkCycle) * 3;
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 8, y + 45 - legOffset, 10, 15);
        ctx.fillRect(x + 22, y + 45 + legOffset, 10, 15);

        // Sword
        ctx.fillStyle = swordColor;
        if (player.attacking) {
            const swingProgress = 1 - (player.attackTimer / 20);
            if (player.facing === 1) {
                ctx.save();
                ctx.translate(x + 35, y + 25);
                ctx.rotate(-Math.PI/2 + swingProgress * Math.PI);
                ctx.fillRect(0, -3, 45, 6);
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
            if (player.facing === 1) {
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

    drawRobot(ctx, x, y, player) {
        const primaryColor = player.stats.equipment.armor.color;
        const accentColor = this.colors.accent;

        // Antenna
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 15, y - 10, 4, 10);
        ctx.fillStyle = player.attacking ? '#ff0' : '#f00';
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
        ctx.fillStyle = player.attacking ? '#f00' : accentColor;
        ctx.fillRect(x + 11, y + 27, 5, 5);
        ctx.fillRect(x + 19, y + 27, 5, 5);
        ctx.fillRect(x + 15, y + 34, 5, 5);

        // Legs
        const legOffset = Math.sin(player.walkCycle) * 3;
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x + 6, y + 44 - legOffset, 10, 16);
        ctx.fillRect(x + 19, y + 44 + legOffset, 10, 16);

        // Arms/weapon
        ctx.fillStyle = '#555';
        if (player.attacking) {
            if (player.facing === 1) {
                ctx.fillRect(x + 32, y + 22, 25, 10);
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
            if (player.facing === 1) {
                ctx.fillRect(x + 32, y + 24, 8, 16);
            } else {
                ctx.fillRect(x - 5, y + 24, 8, 16);
            }
        }
    }
}
