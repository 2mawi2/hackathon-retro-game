import { CANVAS_WIDTH, EnemyType } from './constants';
import { randomInt, distance } from './utils';

class Enemy {
    x: number;
    y: number;
    type: string;
    facing: number;
    attackTimer: number;
    attackCooldown: number;
    animFrame: number;
    animTimer: number;
    knockbackX: number;
    dead: boolean;
    deathTimer: number;
    width: number = 0;
    height: number = 0;
    maxHealth: number = 0;
    health: number = 0;
    damage: number = 0;
    speed: number = 0;
    exp: number = 0;
    gold: number = 0;
    color: string = '';
    baseColor: string = '';
    canFly: boolean = false;
    isBoss: boolean = false;
    levelBackground: string = '';

    constructor(x: number, y: number, type: string, levelBackground: string = '') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.levelBackground = levelBackground;
        this.facing = -1;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.knockbackX = 0;
        this.dead = false;
        this.deathTimer = 0;

        this.setupStats();
    }

    getColorForLevel(baseColor: string): string {
        if (this.levelBackground === 'iceCave') {
            // Return ice-themed color variant
            const iceColors: Record<string, string> = {
                '#2ecc71': '#87CEEB',  // Slime green → ice blue
                '#27ae60': '#5DADE2',  // Goblin green → frost blue
                '#1e8449': '#F0F8FF'   // Orc dark green → white (Yeti)
            };
            return iceColors[baseColor] || baseColor;
        }
        return baseColor;
    }

    setupStats() {
        switch (this.type) {
            case EnemyType.SLIME:
                this.width = 30;
                this.height = 25;
                this.maxHealth = 30;
                this.damage = 5;
                this.speed = 1;
                this.exp = 15;
                this.gold = randomInt(5, 15);
                this.baseColor = '#2ecc71';
                this.color = this.getColorForLevel(this.baseColor);
                break;

            case EnemyType.GOBLIN:
                this.width = 35;
                this.height = 45;
                this.maxHealth = 50;
                this.damage = 10;
                this.speed = 2;
                this.exp = 25;
                this.gold = randomInt(10, 25);
                this.baseColor = '#27ae60';
                this.color = this.getColorForLevel(this.baseColor);
                break;

            case EnemyType.SKELETON:
                this.width = 35;
                this.height = 55;
                this.maxHealth = 70;
                this.damage = 15;
                this.speed = 1.5;
                this.exp = 40;
                this.gold = randomInt(20, 40);
                this.baseColor = '#ecf0f1';
                this.color = this.getColorForLevel(this.baseColor);
                break;

            case EnemyType.ORC:
                this.width = 50;
                this.height = 65;
                this.maxHealth = 120;
                this.damage = 20;
                this.speed = 1.2;
                this.exp = 60;
                this.gold = randomInt(30, 60);
                this.baseColor = '#1e8449';
                this.color = this.getColorForLevel(this.baseColor);
                break;

            case EnemyType.DRAGON:
                this.width = 80;
                this.height = 70;
                this.maxHealth = 200;
                this.damage = 25;
                this.speed = 1.5;
                this.exp = 100;
                this.gold = randomInt(50, 100);
                this.baseColor = '#c0392b';
                this.color = this.getColorForLevel(this.baseColor);
                this.canFly = true;
                break;

            case EnemyType.BOSS_DRAGON:
                this.width = 140;
                this.height = 110;
                this.maxHealth = 500;
                this.damage = 35;
                this.speed = 1;
                this.exp = 300;
                this.gold = randomInt(200, 400);
                this.baseColor = '#8e44ad';
                this.color = this.getColorForLevel(this.baseColor);
                this.canFly = true;
                this.isBoss = true;
                break;
        }

        this.health = this.maxHealth;
    }

    update(players, groundY, projectiles) {
        if (this.dead) {
            this.deathTimer++;
            return this.deathTimer < 30;
        }

        // Handle knockback
        if (this.knockbackX !== 0) {
            this.x += this.knockbackX;
            this.knockbackX *= 0.85;
            if (Math.abs(this.knockbackX) < 0.5) this.knockbackX = 0;
        }

        // Find closest player
        let closestPlayer = null;
        let closestDist = Infinity;

        for (const player of players) {
            if (player.health <= 0) continue;
            const dist = distance(this.x, this.y, player.x, player.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestPlayer = player;
            }
        }

        if (closestPlayer) {
            // Face the player
            this.facing = closestPlayer.x < this.x ? -1 : 1;

            // Move towards player
            if (closestDist > 60) {
                this.x += this.facing * this.speed;
            }

            // Attack if close
            if (closestDist < 80 && this.attackCooldown <= 0) {
                this.attackTimer = 30;
                this.attackCooldown = 60 + randomInt(0, 30);

                // Dragon fire breath
                if (this.type === EnemyType.DRAGON || this.type === EnemyType.BOSS_DRAGON) {
                    projectiles.push(new Fireball(
                        this.x + (this.facing === 1 ? this.width : 0),
                        this.y + this.height / 2,
                        this.facing * 5,
                        this.damage
                    ));
                }
            }
        }

        // Bounds
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

        if (!this.canFly) {
            this.y = groundY - this.height;
        } else {
            // Flying enemies hover
            this.y = groundY - this.height - 30 + Math.sin(Date.now() / 500) * 10;
        }

        // Update timers
        if (this.attackTimer > 0) this.attackTimer--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Animation
        this.animTimer++;
        if (this.animTimer >= 15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }

        return true;
    }

    takeDamage(amount, knockbackDir = 0) {
        this.health -= amount;
        this.knockbackX = knockbackDir * 6;

        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }

        return this.dead;
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);

        // Death animation
        if (this.dead) {
            ctx.globalAlpha = 1 - this.deathTimer / 30;
        }

        switch (this.type) {
            case EnemyType.SLIME:
                this.drawSlime(ctx, x, y);
                break;
            case EnemyType.GOBLIN:
                this.drawGoblin(ctx, x, y);
                break;
            case EnemyType.SKELETON:
                this.drawSkeleton(ctx, x, y);
                break;
            case EnemyType.ORC:
                this.drawOrc(ctx, x, y);
                break;
            case EnemyType.DRAGON:
            case EnemyType.BOSS_DRAGON:
                this.drawDragon(ctx, x, y);
                break;
        }

        ctx.globalAlpha = 1;

        // Health bar
        if (!this.dead) {
            this.drawHealthBar(ctx, x, y);
        }
    }

    drawHealthBar(ctx, x, y) {
        const barWidth = this.width;
        const barHeight = 6;
        const barY = y - 12;

        ctx.fillStyle = '#333';
        ctx.fillRect(x, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(x + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2);
    }

    drawSlime(ctx, x, y) {
        const squish = 1 + Math.sin(this.animTimer / 5) * 0.1;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            x + this.width / 2,
            y + this.height - 5,
            this.width / 2 * squish,
            this.height / 2 / squish,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 8, y + 5, 6, 6);
        ctx.fillRect(x + 18, y + 5, 6, 6);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 7, 3, 3);
        ctx.fillRect(x + 20, y + 7, 3, 3);
    }

    drawGoblin(ctx, x, y) {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 5, y + 15, 25, 20);

        // Head
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 3, y, 29, 18);

        // Ears
        ctx.fillRect(x - 3, y + 2, 8, 10);
        ctx.fillRect(x + 30, y + 2, 8, 10);

        // Eyes
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 8, y + 6, 6, 5);
        ctx.fillRect(x + 21, y + 6, 6, 5);

        // Legs
        const legOff = this.animFrame * 3;
        ctx.fillStyle = '#1e8449';
        ctx.fillRect(x + 8, y + 35 - legOff, 8, 10);
        ctx.fillRect(x + 19, y + 35 + legOff, 8, 10);

        // Weapon
        if (this.attackTimer > 0) {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.facing === 1 ? x + 30 : x - 15, y + 15, 15, 5);
        }
    }

    drawSkeleton(ctx, x, y) {
        // Skull
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 5, y, 25, 22);

        // Eye sockets
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 9, y + 6, 7, 8);
        ctx.fillRect(x + 19, y + 6, 7, 8);

        // Eye glow
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 11, y + 8, 3, 4);
        ctx.fillRect(x + 21, y + 8, 3, 4);

        // Jaw
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 10, y + 16, 15, 6);

        // Ribcage
        ctx.fillRect(x + 10, y + 24, 15, 18);
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 12, y + 26 + i * 5, 11, 2);
        }

        // Arms
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 2, y + 24, 6, 20);
        ctx.fillRect(x + 27, y + 24, 6, 20);

        // Legs
        ctx.fillRect(x + 10, y + 42, 6, 13);
        ctx.fillRect(x + 19, y + 42, 6, 13);

        // Sword
        ctx.fillStyle = '#7f8c8d';
        if (this.attackTimer > 0) {
            ctx.fillRect(this.facing === 1 ? x + 33 : x - 15, y + 20, 20, 4);
        } else {
            ctx.fillRect(x + 33, y + 25, 4, 20);
        }
    }

    drawOrc(ctx, x, y) {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 5, y + 25, 40, 28);

        // Head
        ctx.fillRect(x + 10, y, 30, 28);

        // Tusks
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 12, y + 20, 4, 8);
        ctx.fillRect(x + 34, y + 20, 4, 8);

        // Eyes
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + 16, y + 8, 8, 6);
        ctx.fillRect(x + 26, y + 8, 8, 6);

        // Arms
        ctx.fillStyle = this.color;
        ctx.fillRect(x - 3, y + 25, 10, 25);
        ctx.fillRect(x + 43, y + 25, 10, 25);

        // Legs
        const legOff = this.animFrame * 4;
        ctx.fillRect(x + 10, y + 53 - legOff, 12, 12);
        ctx.fillRect(x + 28, y + 53 + legOff, 12, 12);

        // Club
        ctx.fillStyle = '#8b4513';
        if (this.attackTimer > 0) {
            ctx.fillRect(this.facing === 1 ? x + 50 : x - 25, y + 20, 25, 10);
        } else {
            ctx.fillRect(x + 50, y + 30, 8, 25);
        }
    }

    drawDragon(ctx, x, y) {
        const w = this.width;
        const h = this.height;

        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.5);

        // Belly
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + w * 0.25, y + h * 0.4, w * 0.35, h * 0.35);

        // Head
        ctx.fillStyle = this.color;
        const headX = this.facing === 1 ? x + w * 0.6 : x;
        ctx.fillRect(headX, y + h * 0.15, w * 0.4, h * 0.4);

        // Eye
        ctx.fillStyle = '#fff';
        ctx.fillRect(headX + w * 0.1, y + h * 0.22, w * 0.12, h * 0.12);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(headX + w * 0.12, y + h * 0.25, w * 0.06, h * 0.06);

        // Mouth/fire
        if (this.attackTimer > 15) {
            ctx.fillStyle = '#f39c12';
            const fireX = this.facing === 1 ? headX + w * 0.35 : headX - w * 0.2;
            ctx.fillRect(fireX, y + h * 0.35, w * 0.25, h * 0.15);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(fireX + w * 0.05, y + h * 0.38, w * 0.15, h * 0.08);
        }

        // Wings
        ctx.fillStyle = this.isBoss ? '#6c3483' : '#922b21';
        const wingY = y + h * 0.1 + Math.sin(Date.now() / 200) * 5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.3);
        ctx.lineTo(x + w * 0.1, wingY);
        ctx.lineTo(x + w * 0.5, y + h * 0.25);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.3);
        ctx.lineTo(x + w * 0.9, wingY);
        ctx.lineTo(x + w * 0.7, y + h * 0.25);
        ctx.fill();

        // Tail
        ctx.fillStyle = this.color;
        const tailX = this.facing === 1 ? x : x + w * 0.8;
        ctx.fillRect(tailX, y + h * 0.5, w * 0.25, h * 0.15);

        // Legs
        ctx.fillRect(x + w * 0.2, y + h * 0.75, w * 0.15, h * 0.25);
        ctx.fillRect(x + w * 0.55, y + h * 0.75, w * 0.15, h * 0.25);

        // Boss crown
        if (this.isBoss) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(headX + w * 0.05, y, w * 0.3, h * 0.12);
            ctx.fillRect(headX + w * 0.08, y - h * 0.08, w * 0.06, h * 0.1);
            ctx.fillRect(headX + w * 0.17, y - h * 0.1, w * 0.06, h * 0.12);
            ctx.fillRect(headX + w * 0.26, y - h * 0.08, w * 0.06, h * 0.1);
        }
    }
}

class Fireball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    damage: number;
    life: number;

    constructor(x: number, y: number, vx: number, damage: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = 0;
        this.width = 25;
        this.height = 20;
        this.damage = damage;
        this.life = 120;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        return this.life > 0 && this.x > -50 && this.x < CANVAS_WIDTH + 50;
    }

    draw(ctx) {
        // Outer flame
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner flame
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/3, this.height/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/5, this.height/5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

export { Enemy, Fireball, EnemyType };
