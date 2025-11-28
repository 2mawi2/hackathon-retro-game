import { Enemy, Fireball } from './enemies';
import { randomInt } from './utils';
import type { Player } from './player';
import type { LevelData } from './constants';

// Import levels from separate data files
import { levels } from './data/levels/index';

export class LevelManager {
    currentLevelIndex: number;
    currentWaveIndex: number;
    enemies: Enemy[];
    projectiles: Fireball[];
    waveComplete: boolean;
    waveDelay: number;
    levelComplete: boolean;
    // Wind system
    windTimer: number;
    windActive: boolean;
    windDirection: number;  // 1 = right, -1 = left
    windDuration: number;
    windWarning: boolean;

    constructor() {
        this.currentLevelIndex = 0;
        this.currentWaveIndex = 0;
        this.enemies = [];
        this.projectiles = [];
        this.waveComplete = false;
        this.waveDelay = 0;
        this.levelComplete = false;
        // Wind system init
        this.windTimer = 0;
        this.windActive = false;
        this.windDirection = 1;
        this.windDuration = 0;
        this.windWarning = false;
    }

    get currentLevel(): LevelData {
        return levels[this.currentLevelIndex];
    }

    get currentWave() {
        return this.currentLevel.waves[this.currentWaveIndex];
    }

    get isLastLevel(): boolean {
        return this.currentLevelIndex >= levels.length - 1;
    }

    get isLastWave(): boolean {
        return this.currentWaveIndex >= this.currentLevel.waves.length - 1;
    }

    startLevel(levelIndex: number) {
        this.currentLevelIndex = Math.min(levelIndex, levels.length - 1);
        this.currentWaveIndex = 0;
        this.enemies = [];
        this.projectiles = [];
        this.waveComplete = false;
        this.levelComplete = false;
        // Reset wind system
        this.windTimer = 0;
        this.windActive = false;
        this.windDirection = 1;
        this.windDuration = 0;
        this.windWarning = false;
        this.spawnWave();
    }

    spawnWave() {
        const wave = this.currentWave;
        const groundY = 420;

        wave.enemies.forEach((enemyType, index) => {
            // Spawn enemies from the right side
            const x = 600 + index * 100 + randomInt(-20, 20);
            const enemy = new Enemy(x, groundY - 60, enemyType);
            this.enemies.push(enemy);
        });

        this.waveComplete = false;
    }

    nextWave() {
        this.currentWaveIndex++;
        if (this.currentWaveIndex >= this.currentLevel.waves.length) {
            this.levelComplete = true;
        } else {
            this.spawnWave();
        }
    }

    nextLevel(): boolean {
        if (this.currentLevelIndex < levels.length - 1) {
            this.currentLevelIndex++;
            this.currentWaveIndex = 0;
            this.levelComplete = false;
            return true;
        }
        return false; // Game complete!
    }

    update(players: (Player | null)[]) {
        // Update enemies
        this.enemies = this.enemies.filter(enemy =>
            enemy.update(players, 420, this.projectiles)
        );

        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => proj.update());

        // Wind gust mechanic
        if (this.currentLevel.mechanics?.windGusts) {
            this.updateWind(players);
        }

        // Check if wave is complete
        if (this.enemies.length === 0 && !this.waveComplete) {
            this.waveComplete = true;
            this.waveDelay = 90; // 1.5 second delay before next wave
        }

        // Handle wave transition
        if (this.waveComplete && this.waveDelay > 0) {
            this.waveDelay--;
            if (this.waveDelay <= 0) {
                this.nextWave();
            }
        }
    }

    updateWind(players: (Player | null)[]): void {
        const interval = this.currentLevel.mechanics?.windInterval || 180;
        const force = this.currentLevel.mechanics?.windForce || 3;
        const warningTime = 60;  // 1 second warning

        this.windTimer++;

        // Show warning before wind starts
        if (!this.windActive && this.windTimer >= interval - warningTime) {
            this.windWarning = true;
        }

        // Start new gust
        if (!this.windActive && this.windTimer >= interval) {
            this.windActive = true;
            this.windWarning = false;
            this.windTimer = 0;
            this.windDuration = 60;  // 1 second of wind
            this.windDirection = Math.random() > 0.5 ? 1 : -1;
        }

        // Apply wind force
        if (this.windActive) {
            this.windDuration--;

            players.forEach(player => {
                if (player && player.health > 0) {
                    // Wind pushes player (can be resisted with movement)
                    player.x += this.windDirection * force * 0.5;

                    // Stronger effect if airborne
                    if (!player.isGrounded) {
                        player.x += this.windDirection * force * 0.3;
                    }

                    // Keep player in bounds
                    player.x = Math.max(0, Math.min(800 - player.width, player.x));
                }
            });

            // End gust
            if (this.windDuration <= 0) {
                this.windActive = false;
            }
        }
    }

    drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const colors = this.currentLevel.colors;
        const groundY = 420;

        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
        gradient.addColorStop(0, colors.sky);
        gradient.addColorStop(1, colors.skyGradient);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, groundY);

        // Background elements based on level type
        this.drawBackgroundElements(ctx, width, groundY);

        // Grass
        ctx.fillStyle = colors.grass;
        ctx.fillRect(0, groundY - 20, width, 40);

        // Grass detail
        ctx.fillStyle = colors.grassLight;
        for (let i = 0; i < width; i += 15) {
            ctx.fillRect(i, groundY - 20, 10, 5);
        }

        // Ground
        ctx.fillStyle = colors.ground;
        ctx.fillRect(0, groundY + 20, width, height - groundY);

        // Ground detail
        const groundDetailColor = this.adjustColor(colors.ground, 20);
        ctx.fillStyle = groundDetailColor;
        for (let i = 0; i < width; i += 25) {
            ctx.fillRect(i + 5, groundY + 25, 12, 6);
        }
    }

    drawBackgroundElements(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        const levelBg = this.currentLevel.background;

        switch (levelBg) {
            case 'forest':
                this.drawTrees(ctx, width, groundY);
                this.drawClouds(ctx, width);
                break;
            case 'graveyard':
                this.drawGravestones(ctx, width, groundY);
                this.drawMoon(ctx);
                break;
            case 'mountains':
                this.drawMountains(ctx, width, groundY);
                this.drawClouds(ctx, width);
                break;
            case 'volcano':
                this.drawVolcano(ctx, width, groundY);
                this.drawLava(ctx, width, groundY);
                break;
            case 'castle':
                this.drawCastle(ctx, width, groundY);
                this.drawMoon(ctx);
                break;
            case 'skyCastle':
                this.drawSkyCastle(ctx, width, groundY);
                if (this.windActive) {
                    this.drawWindEffect(ctx, width, groundY);
                }
                if (this.windWarning && !this.windActive) {
                    this.drawWindWarning(ctx, width);
                }
                break;
        }
    }

    drawClouds(ctx: CanvasRenderingContext2D, width: number) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudPositions = [[50, 50], [200, 80], [450, 40], [600, 90], [750, 60]];
        cloudPositions.forEach(([x, y]) => {
            ctx.fillRect(x, y, 60, 25);
            ctx.fillRect(x - 10, y + 10, 80, 20);
        });
    }

    drawTrees(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        const treePositions = [50, 150, 650, 750];
        treePositions.forEach(x => {
            // Trunk
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + 15, groundY - 80, 20, 60);
            // Leaves
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.moveTo(x + 25, groundY - 140);
            ctx.lineTo(x - 10, groundY - 60);
            ctx.lineTo(x + 60, groundY - 60);
            ctx.fill();
        });
    }

    drawGravestones(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        const positions = [80, 200, 350, 500, 680];
        ctx.fillStyle = '#7f8c8d';
        positions.forEach((x, i) => {
            const h = 40 + (i % 3) * 15;
            ctx.fillRect(x, groundY - h - 20, 30, h);
            // Top rounded part
            ctx.beginPath();
            ctx.arc(x + 15, groundY - h - 20, 15, Math.PI, 0);
            ctx.fill();
        });
    }

    drawMoon(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.arc(680, 80, 50, 0, Math.PI * 2);
        ctx.fill();

        // Craters
        ctx.fillStyle = '#e0e0c0';
        ctx.beginPath();
        ctx.arc(670, 70, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(695, 95, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMountains(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        // Far mountains
        ctx.fillStyle = '#5d6d7e';
        ctx.beginPath();
        ctx.moveTo(0, groundY - 20);
        ctx.lineTo(150, groundY - 180);
        ctx.lineTo(300, groundY - 20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(250, groundY - 20);
        ctx.lineTo(450, groundY - 220);
        ctx.lineTo(650, groundY - 20);
        ctx.fill();

        // Snow caps
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(130, groundY - 160);
        ctx.lineTo(150, groundY - 180);
        ctx.lineTo(170, groundY - 160);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(420, groundY - 195);
        ctx.lineTo(450, groundY - 220);
        ctx.lineTo(480, groundY - 195);
        ctx.fill();
    }

    drawVolcano(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        // Volcano
        ctx.fillStyle = '#4a1c1c';
        ctx.beginPath();
        ctx.moveTo(250, groundY - 20);
        ctx.lineTo(400, groundY - 200);
        ctx.lineTo(550, groundY - 20);
        ctx.fill();

        // Crater
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(370, groundY - 190);
        ctx.lineTo(400, groundY - 200);
        ctx.lineTo(430, groundY - 190);
        ctx.lineTo(420, groundY - 170);
        ctx.lineTo(380, groundY - 170);
        ctx.fill();

        // Lava glow
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(400, groundY - 180, 15 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLava(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        // Lava pools
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(100, groundY + 30, 80, 20);
        ctx.fillRect(600, groundY + 35, 100, 15);

        // Bubbles
        ctx.fillStyle = '#f39c12';
        const time = Date.now() / 300;
        ctx.beginPath();
        ctx.arc(130 + Math.sin(time) * 10, groundY + 35, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(650 + Math.cos(time) * 15, groundY + 40, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCastle(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        // Castle silhouette
        ctx.fillStyle = '#1a0a2e';

        // Main towers
        ctx.fillRect(100, groundY - 200, 60, 180);
        ctx.fillRect(640, groundY - 200, 60, 180);

        // Tower tops
        ctx.beginPath();
        ctx.moveTo(100, groundY - 200);
        ctx.lineTo(130, groundY - 250);
        ctx.lineTo(160, groundY - 200);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(640, groundY - 200);
        ctx.lineTo(670, groundY - 250);
        ctx.lineTo(700, groundY - 200);
        ctx.fill();

        // Center structure
        ctx.fillRect(200, groundY - 150, 400, 130);

        // Windows (glowing)
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(120, groundY - 150, 20, 30);
        ctx.fillRect(660, groundY - 150, 20, 30);
        ctx.fillRect(350, groundY - 120, 30, 40);
        ctx.fillRect(420, groundY - 120, 30, 40);

        // Battlements
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = '#1a0a2e';
            ctx.fillRect(200 + i * 40, groundY - 170, 25, 25);
        }
    }

    drawSkyCastle(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        const time = Date.now() / 1000;

        // Distant clouds (parallax background)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const cloudPositions: [number, number][] = [[50, 60], [200, 90], [400, 50], [600, 80], [750, 70]];
        cloudPositions.forEach(([x, y]) => {
            const drift = (Date.now() / 100) % width;
            const cloudX = (x + drift * 0.1) % width;
            ctx.fillRect(cloudX, y, 80, 30);
            ctx.fillRect(cloudX + 10, y - 10, 60, 25);
            ctx.fillRect(cloudX + 20, y + 15, 50, 20);
        });

        // Floating islands in background
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(150, groundY - 100, 60, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#228B22';
        ctx.fillRect(130, groundY - 115, 40, 15);

        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(650, groundY - 150, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Castle towers in distance
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(680, groundY - 250, 40, 150);
        ctx.fillRect(720, groundY - 200, 30, 100);

        // Tower tops (pointed)
        ctx.beginPath();
        ctx.moveTo(680, groundY - 250);
        ctx.lineTo(700, groundY - 290);
        ctx.lineTo(720, groundY - 250);
        ctx.fill();

        // Windows (glowing)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(695, groundY - 220, 10, 15);
        ctx.fillRect(695, groundY - 180, 10, 15);

        // Birds flying
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const birdX = (300 + i * 100 + time * 20) % (width + 50) - 25;
            const birdY = 100 + Math.sin(time + i) * 20 + i * 30;
            ctx.beginPath();
            ctx.moveTo(birdX - 8, birdY);
            ctx.quadraticCurveTo(birdX, birdY - 5, birdX + 8, birdY);
            ctx.stroke();
        }

        // Sun with rays
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(700, 60, 30, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.1;
            ctx.beginPath();
            ctx.moveTo(700 + Math.cos(angle) * 35, 60 + Math.sin(angle) * 35);
            ctx.lineTo(700 + Math.cos(angle) * 55, 60 + Math.sin(angle) * 55);
            ctx.stroke();
        }
    }

    drawWindEffect(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
        // Wind indicator lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;

        const dir = this.windDirection;
        for (let i = 0; i < 20; i++) {
            const startX = dir > 0 ? (i * 40) % width : width - (i * 40) % width;
            const y = 100 + (i * 37) % (groundY - 150);
            const length = 20 + Math.random() * 30;

            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + dir * length, y + Math.sin(Date.now() / 100 + i) * 5);
            ctx.stroke();
        }

        // Floating leaves/debris
        ctx.fillStyle = 'rgba(139, 115, 85, 0.6)';
        for (let i = 0; i < 10; i++) {
            const x = (Date.now() / 10 * dir + i * 80) % (width + 100) - 50;
            const y = 150 + (i * 47) % (groundY - 200);
            const rotation = Date.now() / 200 + i;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillRect(-4, -2, 8, 4);
            ctx.restore();
        }
    }

    drawWindWarning(ctx: CanvasRenderingContext2D, width: number) {
        // Pulsing warning indicator
        const alpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WIND INCOMING!', width / 2, 50);

        // Arrow indicating wind direction (next gust direction is random, so show both)
        ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.lineWidth = 3;

        // Left arrow
        ctx.beginPath();
        ctx.moveTo(width / 2 - 80, 70);
        ctx.lineTo(width / 2 - 100, 70);
        ctx.lineTo(width / 2 - 90, 60);
        ctx.moveTo(width / 2 - 100, 70);
        ctx.lineTo(width / 2 - 90, 80);
        ctx.stroke();

        // Right arrow
        ctx.beginPath();
        ctx.moveTo(width / 2 + 80, 70);
        ctx.lineTo(width / 2 + 100, 70);
        ctx.lineTo(width / 2 + 90, 60);
        ctx.moveTo(width / 2 + 100, 70);
        ctx.lineTo(width / 2 + 90, 80);
        ctx.stroke();
    }

    adjustColor(hex: string, amount: number): string {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.min(255, ((num >> 16) & 255) + amount);
        const g = Math.min(255, ((num >> 8) & 255) + amount);
        const b = Math.min(255, (num & 255) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(ctx));

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));
    }
}
