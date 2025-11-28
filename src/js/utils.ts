// Utility functions

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function checkCollision(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

export function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
    return Math.floor(randomRange(min, max + 1));
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Simple particle class for effects
export class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
    size: number;

    constructor(x: number, y: number, vx: number, vy: number, color: string, life = 30) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = randomRange(2, 6);
    }

    update(delta = 1): boolean {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.vy += 0.2 * delta; // gravity
        this.life -= delta;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Damage number floating text
export class DamageNumber {
    x: number;
    y: number;
    damage: number | string;
    color: string;
    life: number;
    vy: number;

    constructor(x: number, y: number, damage: number | string, color = '#fff') {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        this.life = 60;
        this.vy = -2;
    }

    update(delta = 1): boolean {
        this.y += this.vy * delta;
        this.vy *= Math.pow(0.95, delta);
        this.life -= delta;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const alpha = this.life / 60;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        const text = typeof this.damage === 'number' ? Math.floor(this.damage).toString() : this.damage;
        ctx.fillText(text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
