import { EnemyType } from './constants.js';
import { Enemy } from './enemies.js';
import { randomInt } from './utils.js';

// Level configurations
export const levels = [
    {
        id: 1,
        name: 'The Forest',
        background: 'forest',
        waves: [
            { enemies: [EnemyType.SLIME, EnemyType.SLIME, EnemyType.SLIME] },
            { enemies: [EnemyType.SLIME, EnemyType.SLIME, EnemyType.GOBLIN] },
            { enemies: [EnemyType.GOBLIN, EnemyType.GOBLIN] }
        ],
        colors: {
            sky: '#87ceeb',
            skyGradient: '#5dade2',
            grass: '#27ae60',
            grassLight: '#2ecc71',
            ground: '#8b4513'
        }
    },
    {
        id: 2,
        name: 'The Graveyard',
        background: 'graveyard',
        waves: [
            { enemies: [EnemyType.SKELETON, EnemyType.SKELETON] },
            { enemies: [EnemyType.SKELETON, EnemyType.GOBLIN, EnemyType.GOBLIN] },
            { enemies: [EnemyType.SKELETON, EnemyType.SKELETON, EnemyType.SKELETON] }
        ],
        colors: {
            sky: '#2c3e50',
            skyGradient: '#1a252f',
            grass: '#1e3d2f',
            grassLight: '#2d5a45',
            ground: '#4a4a4a'
        }
    },
    {
        id: 3,
        name: 'The Mountains',
        background: 'mountains',
        waves: [
            { enemies: [EnemyType.ORC, EnemyType.GOBLIN] },
            { enemies: [EnemyType.ORC, EnemyType.ORC] },
            { enemies: [EnemyType.ORC, EnemyType.SKELETON, EnemyType.SKELETON] }
        ],
        colors: {
            sky: '#85929e',
            skyGradient: '#5d6d7e',
            grass: '#5d6d7e',
            grassLight: '#7f8c8d',
            ground: '#626567'
        }
    },
    {
        id: 4,
        name: 'Dragon\'s Lair',
        background: 'volcano',
        waves: [
            { enemies: [EnemyType.ORC, EnemyType.ORC, EnemyType.SKELETON] },
            { enemies: [EnemyType.DRAGON] },
            { enemies: [EnemyType.DRAGON, EnemyType.ORC] }
        ],
        colors: {
            sky: '#922b21',
            skyGradient: '#641e16',
            grass: '#7b241c',
            grassLight: '#943126',
            ground: '#4a1c1c'
        }
    },
    {
        id: 5,
        name: 'The Final Battle',
        background: 'castle',
        waves: [
            { enemies: [EnemyType.DRAGON, EnemyType.ORC, EnemyType.ORC] },
            { enemies: [EnemyType.DRAGON, EnemyType.DRAGON] },
            { enemies: [EnemyType.BOSS_DRAGON] }
        ],
        colors: {
            sky: '#4a235a',
            skyGradient: '#1a0a2e',
            grass: '#512e5f',
            grassLight: '#6c3483',
            ground: '#2e1a47'
        }
    }
];

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentWaveIndex = 0;
        this.enemies = [];
        this.projectiles = [];
        this.waveComplete = false;
        this.waveDelay = 0;
        this.levelComplete = false;
    }

    get currentLevel() {
        return levels[this.currentLevelIndex];
    }

    get currentWave() {
        return this.currentLevel.waves[this.currentWaveIndex];
    }

    get isLastLevel() {
        return this.currentLevelIndex >= levels.length - 1;
    }

    get isLastWave() {
        return this.currentWaveIndex >= this.currentLevel.waves.length - 1;
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = Math.min(levelIndex, levels.length - 1);
        this.currentWaveIndex = 0;
        this.enemies = [];
        this.projectiles = [];
        this.waveComplete = false;
        this.levelComplete = false;
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

    nextLevel() {
        if (this.currentLevelIndex < levels.length - 1) {
            this.currentLevelIndex++;
            this.currentWaveIndex = 0;
            this.levelComplete = false;
            return true;
        }
        return false; // Game complete!
    }

    update(players) {
        // Update enemies
        this.enemies = this.enemies.filter(enemy =>
            enemy.update(players, 420, this.projectiles)
        );

        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => proj.update());

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

    drawBackground(ctx, width, height) {
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

    drawBackgroundElements(ctx, width, groundY) {
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
        }
    }

    drawClouds(ctx, width) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudPositions = [[50, 50], [200, 80], [450, 40], [600, 90], [750, 60]];
        cloudPositions.forEach(([x, y]) => {
            ctx.fillRect(x, y, 60, 25);
            ctx.fillRect(x - 10, y + 10, 80, 20);
        });
    }

    drawTrees(ctx, width, groundY) {
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

    drawGravestones(ctx, width, groundY) {
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

    drawMoon(ctx) {
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

    drawMountains(ctx, width, groundY) {
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

    drawVolcano(ctx, width, groundY) {
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

    drawLava(ctx, width, groundY) {
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

    drawCastle(ctx, width, groundY) {
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

    adjustColor(hex, amount) {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.min(255, ((num >> 16) & 255) + amount);
        const g = Math.min(255, ((num >> 8) & 255) + amount);
        const b = Math.min(255, (num & 255) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    draw(ctx) {
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(ctx));

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));
    }
}
