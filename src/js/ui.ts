import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import type { LevelManager } from './levels';
import type { Player } from './player';
import type { InputManager } from './input';

// Menu background animation state
interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    twinkleOffset: number;
    layer: number;
}

interface ShootingStar {
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    life: number;
    maxLife: number;
}

interface MagicParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
}

interface Firefly {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    phase: number;
    speed: number;
    brightness: number;
}

export class UI {
    menuSelection: number;
    menuOptions: string[];

    // Background animation state
    private stars: Star[] = [];
    private shootingStars: ShootingStar[] = [];
    private magicParticles: MagicParticle[] = [];
    private fireflies: Firefly[] = [];
    private lastShootingStarTime: number = 0;
    private auroraOffset: number = 0;
    private initialized: boolean = false;

    constructor() {
        this.menuSelection = 0;
        this.menuOptions = ['Start Game', '2 Player Co-op'];
    }

    private initMenuBackground() {
        if (this.initialized) return;
        this.initialized = true;

        // Create multiple layers of stars
        for (let layer = 0; layer < 3; layer++) {
            const count = layer === 0 ? 100 : layer === 1 ? 60 : 30;
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT * 0.7,
                    size: layer === 0 ? 1 : layer === 1 ? 1.5 : 2.5,
                    speed: (layer + 1) * 0.15,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    layer
                });
            }
        }

        // Create fireflies
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * CANVAS_WIDTH;
            const y = CANVAS_HEIGHT * 0.5 + Math.random() * CANVAS_HEIGHT * 0.4;
            this.fireflies.push({
                x, y,
                baseX: x,
                baseY: y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1,
                brightness: Math.random()
            });
        }
    }

    private updateMenuBackground() {
        const now = Date.now();

        // Update stars (parallax movement)
        this.stars.forEach(star => {
            star.x -= star.speed;
            if (star.x < 0) {
                star.x = CANVAS_WIDTH;
                star.y = Math.random() * CANVAS_HEIGHT * 0.7;
            }
        });

        // Spawn shooting stars occasionally
        if (now - this.lastShootingStarTime > 3000 + Math.random() * 4000) {
            if (this.shootingStars.length < 3) {
                this.shootingStars.push({
                    x: Math.random() * CANVAS_WIDTH * 0.5 + CANVAS_WIDTH * 0.25,
                    y: Math.random() * 100,
                    vx: 8 + Math.random() * 4,
                    vy: 3 + Math.random() * 2,
                    length: 50 + Math.random() * 50,
                    life: 60 + Math.random() * 40,
                    maxLife: 60 + Math.random() * 40
                });
                this.lastShootingStarTime = now;
            }
        }

        // Update shooting stars
        this.shootingStars = this.shootingStars.filter(ss => {
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life--;
            return ss.life > 0 && ss.x < CANVAS_WIDTH + 100;
        });

        // Spawn magic particles from castle
        if (Math.random() < 0.1) {
            const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#9b59b6', '#3498db'];
            this.magicParticles.push({
                x: CANVAS_WIDTH * 0.5 + (Math.random() - 0.5) * 100,
                y: CANVAS_HEIGHT * 0.45,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 2,
                size: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 80 + Math.random() * 40,
                maxLife: 80 + Math.random() * 40
            });
        }

        // Update magic particles
        this.magicParticles = this.magicParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.02; // Float upward
            p.vx *= 0.99;
            p.life--;
            return p.life > 0;
        });

        // Update fireflies
        this.fireflies.forEach(ff => {
            ff.phase += 0.02 * ff.speed;
            ff.x = ff.baseX + Math.sin(ff.phase) * 30;
            ff.y = ff.baseY + Math.cos(ff.phase * 0.7) * 20;
            ff.brightness = 0.3 + Math.sin(ff.phase * 3) * 0.35 + 0.35;
        });

        // Update aurora
        this.auroraOffset += 0.005;
    }

    private drawMenuBackground(ctx: CanvasRenderingContext2D) {
        const now = Date.now();

        // Deep space gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#0a0520');
        gradient.addColorStop(0.3, '#0f0c29');
        gradient.addColorStop(0.6, '#1a1040');
        gradient.addColorStop(1, '#0d1b2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw aurora borealis effect
        this.drawAurora(ctx);

        // Draw nebula clouds
        this.drawNebula(ctx, now);

        // Draw stars with twinkling
        this.stars.forEach(star => {
            const twinkle = Math.sin(now / 300 + star.twinkleOffset) * 0.5 + 0.5;
            const alpha = 0.3 + twinkle * 0.7;
            const size = star.size * (0.8 + twinkle * 0.4);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = star.layer === 2 ? '#ffffd0' : '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Add glow to larger stars
            if (star.layer === 2) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.beginPath();
                ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        // Draw shooting stars
        this.shootingStars.forEach(ss => {
            const alpha = ss.life / ss.maxLife;
            const grad = ctx.createLinearGradient(
                ss.x, ss.y,
                ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10)
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10));
            ctx.stroke();

            // Bright head
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Draw distant mountains silhouette
        this.drawMountains(ctx);

        // Draw epic castle silhouette
        this.drawCastle(ctx, now);

        // Draw ground with mist
        this.drawGround(ctx, now);

        // Draw magic particles
        this.magicParticles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Particle glow
            ctx.globalAlpha = alpha * 0.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw fireflies
        this.fireflies.forEach(ff => {
            ctx.globalAlpha = ff.brightness;
            ctx.fillStyle = '#ffff88';
            ctx.beginPath();
            ctx.arc(ff.x, ff.y, 2, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            ctx.globalAlpha = ff.brightness * 0.3;
            const glowGrad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, 15);
            glowGrad.addColorStop(0, 'rgba(255, 255, 100, 0.5)');
            glowGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(ff.x, ff.y, 15, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    private drawAurora(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.15;

        for (let i = 0; i < 3; i++) {
            const yOffset = Math.sin(this.auroraOffset + i * 0.5) * 30;
            const gradient = ctx.createLinearGradient(0, 50 + i * 40 + yOffset, 0, 150 + i * 40 + yOffset);

            if (i === 0) {
                gradient.addColorStop(0, 'rgba(0, 255, 150, 0)');
                gradient.addColorStop(0.5, 'rgba(0, 255, 150, 0.8)');
                gradient.addColorStop(1, 'rgba(0, 255, 150, 0)');
            } else if (i === 1) {
                gradient.addColorStop(0, 'rgba(150, 0, 255, 0)');
                gradient.addColorStop(0.5, 'rgba(150, 0, 255, 0.6)');
                gradient.addColorStop(1, 'rgba(150, 0, 255, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(0, 150, 255, 0)');
                gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.5)');
                gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 80 + i * 30 + yOffset);

            for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
                const waveY = Math.sin(x * 0.01 + this.auroraOffset * 2 + i) * 20;
                ctx.lineTo(x, 100 + i * 30 + yOffset + waveY);
            }

            ctx.lineTo(CANVAS_WIDTH, 200 + i * 30);
            ctx.lineTo(0, 200 + i * 30);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    private drawNebula(ctx: CanvasRenderingContext2D, now: number) {
        // Subtle nebula clouds
        ctx.globalAlpha = 0.08;

        const nebulaColors = ['#ff6b6b', '#9b59b6', '#3498db'];
        nebulaColors.forEach((color, i) => {
            const x = 150 + i * 250 + Math.sin(now / 5000 + i) * 30;
            const y = 100 + Math.cos(now / 4000 + i * 2) * 20;
            const radius = 80 + Math.sin(now / 3000 + i) * 20;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    private drawMountains(ctx: CanvasRenderingContext2D) {
        // Far mountains
        ctx.fillStyle = '#1a1030';
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT * 0.65);
        ctx.lineTo(80, CANVAS_HEIGHT * 0.45);
        ctx.lineTo(150, CANVAS_HEIGHT * 0.55);
        ctx.lineTo(250, CANVAS_HEIGHT * 0.35);
        ctx.lineTo(350, CANVAS_HEIGHT * 0.5);
        ctx.lineTo(450, CANVAS_HEIGHT * 0.4);
        ctx.lineTo(550, CANVAS_HEIGHT * 0.48);
        ctx.lineTo(650, CANVAS_HEIGHT * 0.38);
        ctx.lineTo(750, CANVAS_HEIGHT * 0.52);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT * 0.45);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.lineTo(0, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Closer mountains
        ctx.fillStyle = '#120a20';
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT * 0.7);
        ctx.lineTo(100, CANVAS_HEIGHT * 0.55);
        ctx.lineTo(200, CANVAS_HEIGHT * 0.62);
        ctx.lineTo(300, CANVAS_HEIGHT * 0.5);
        ctx.lineTo(400, CANVAS_HEIGHT * 0.58);
        ctx.lineTo(500, CANVAS_HEIGHT * 0.52);
        ctx.lineTo(600, CANVAS_HEIGHT * 0.6);
        ctx.lineTo(700, CANVAS_HEIGHT * 0.54);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.lineTo(0, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();
    }

    private drawCastle(ctx: CanvasRenderingContext2D, now: number) {
        const baseX = CANVAS_WIDTH * 0.5;
        const baseY = CANVAS_HEIGHT * 0.68;

        ctx.fillStyle = '#0a0515';

        // Main castle body
        ctx.fillRect(baseX - 80, baseY - 100, 160, 100);

        // Central tower (tallest)
        ctx.fillRect(baseX - 25, baseY - 200, 50, 200);

        // Tower top (pointed)
        ctx.beginPath();
        ctx.moveTo(baseX - 30, baseY - 200);
        ctx.lineTo(baseX, baseY - 250);
        ctx.lineTo(baseX + 30, baseY - 200);
        ctx.closePath();
        ctx.fill();

        // Left tower
        ctx.fillRect(baseX - 100, baseY - 140, 35, 140);
        ctx.beginPath();
        ctx.moveTo(baseX - 105, baseY - 140);
        ctx.lineTo(baseX - 82.5, baseY - 175);
        ctx.lineTo(baseX - 60, baseY - 140);
        ctx.closePath();
        ctx.fill();

        // Right tower
        ctx.fillRect(baseX + 65, baseY - 140, 35, 140);
        ctx.beginPath();
        ctx.moveTo(baseX + 60, baseY - 140);
        ctx.lineTo(baseX + 82.5, baseY - 175);
        ctx.lineTo(baseX + 105, baseY - 140);
        ctx.closePath();
        ctx.fill();

        // Far left small tower
        ctx.fillRect(baseX - 130, baseY - 90, 25, 90);
        ctx.beginPath();
        ctx.moveTo(baseX - 135, baseY - 90);
        ctx.lineTo(baseX - 117.5, baseY - 115);
        ctx.lineTo(baseX - 100, baseY - 90);
        ctx.closePath();
        ctx.fill();

        // Far right small tower
        ctx.fillRect(baseX + 105, baseY - 90, 25, 90);
        ctx.beginPath();
        ctx.moveTo(baseX + 100, baseY - 90);
        ctx.lineTo(baseX + 117.5, baseY - 115);
        ctx.lineTo(baseX + 135, baseY - 90);
        ctx.closePath();
        ctx.fill();

        // Castle battlements
        for (let i = -70; i <= 70; i += 20) {
            ctx.fillRect(baseX + i - 7, baseY - 110, 14, 15);
        }

        // Glowing windows
        const windowGlow = 0.5 + Math.sin(now / 500) * 0.3;
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;

        // Central tower windows
        ctx.fillRect(baseX - 8, baseY - 180, 6, 10);
        ctx.fillRect(baseX + 2, baseY - 180, 6, 10);
        ctx.fillRect(baseX - 5, baseY - 150, 10, 15);

        // Side tower windows
        ctx.fillRect(baseX - 90, baseY - 120, 8, 12);
        ctx.fillRect(baseX + 80, baseY - 120, 8, 12);

        // Main hall windows
        for (let i = -50; i <= 30; i += 40) {
            ctx.fillRect(baseX + i, baseY - 70, 12, 20);
        }

        // Gate with glow
        const gateGlow = ctx.createLinearGradient(baseX - 20, baseY - 50, baseX - 20, baseY);
        gateGlow.addColorStop(0, `rgba(255, 150, 50, ${windowGlow * 0.8})`);
        gateGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = gateGlow;
        ctx.fillRect(baseX - 20, baseY - 50, 40, 50);

        // Flag on central tower
        ctx.fillStyle = '#8b0000';
        const flagWave = Math.sin(now / 200) * 5;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - 250);
        ctx.lineTo(baseX + 25 + flagWave, baseY - 240);
        ctx.lineTo(baseX + 20 + flagWave * 0.5, baseY - 230);
        ctx.lineTo(baseX, baseY - 235);
        ctx.closePath();
        ctx.fill();

        // Flagpole
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - 250);
        ctx.lineTo(baseX, baseY - 265);
        ctx.stroke();
    }

    private drawGround(ctx: CanvasRenderingContext2D, now: number) {
        // Ground
        const groundGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.68, 0, CANVAS_HEIGHT);
        groundGrad.addColorStop(0, '#0a0515');
        groundGrad.addColorStop(0.3, '#0d0820');
        groundGrad.addColorStop(1, '#05030a');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, CANVAS_HEIGHT * 0.68, CANVAS_WIDTH, CANVAS_HEIGHT * 0.32);

        // Mist effect
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 5; i++) {
            const mistX = (i * 200 + now / 30) % (CANVAS_WIDTH + 200) - 100;
            const mistY = CANVAS_HEIGHT * 0.65 + Math.sin(now / 1000 + i) * 10;

            const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, 80);
            mistGrad.addColorStop(0, 'rgba(150, 150, 200, 0.5)');
            mistGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = mistGrad;
            ctx.beginPath();
            ctx.arc(mistX, mistY, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Grass silhouettes
        ctx.fillStyle = '#0a0515';
        for (let x = 0; x < CANVAS_WIDTH; x += 8) {
            const grassHeight = 5 + Math.sin(x * 0.1) * 3 + Math.sin(now / 500 + x * 0.05) * 2;
            ctx.fillRect(x, CANVAS_HEIGHT * 0.68 - grassHeight, 2, grassHeight);
        }
    }

    drawMenu(ctx: CanvasRenderingContext2D) {
        // Initialize background on first draw
        this.initMenuBackground();

        // Update and draw animated background
        this.updateMenuBackground();
        this.drawMenuBackground(ctx);

        const now = Date.now();
        ctx.textAlign = 'center';

        // Draw a nice panel behind the menu content
        const panelX = CANVAS_WIDTH / 2 - 220;
        const panelY = 60;
        const panelW = 440;
        const panelH = 330;

        // Panel background with gradient
        const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
        panelGrad.addColorStop(0, 'rgba(10, 5, 30, 0.85)');
        panelGrad.addColorStop(0.5, 'rgba(15, 10, 40, 0.9)');
        panelGrad.addColorStop(1, 'rgba(10, 5, 30, 0.85)');
        ctx.fillStyle = panelGrad;

        // Rounded rectangle for panel
        const radius = 15;
        ctx.beginPath();
        ctx.moveTo(panelX + radius, panelY);
        ctx.lineTo(panelX + panelW - radius, panelY);
        ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + radius);
        ctx.lineTo(panelX + panelW, panelY + panelH - radius);
        ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - radius, panelY + panelH);
        ctx.lineTo(panelX + radius, panelY + panelH);
        ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - radius);
        ctx.lineTo(panelX, panelY + radius);
        ctx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
        ctx.closePath();
        ctx.fill();

        // Panel border with glow
        ctx.strokeStyle = 'rgba(100, 80, 150, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner highlight line at top
        ctx.strokeStyle = 'rgba(150, 120, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelX + radius + 10, panelY + 2);
        ctx.lineTo(panelX + panelW - radius - 10, panelY + 2);
        ctx.stroke();

        // Animated title with glow
        const titleY = 100 + Math.sin(now / 500) * 3;

        // Title glow and text
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('RETRO GAME JAM', CANVAS_WIDTH / 2, titleY);

        // Main title with stronger glow
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 44px monospace';
        ctx.fillText('GO NUTS!', CANVAS_WIDTH / 2, titleY + 55);

        // Subtitle with cyan glow
        ctx.shadowColor = '#4ecdc4';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#4ecdc4';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('DRAGON SLAYER ADVENTURE', CANVAS_WIDTH / 2, titleY + 95);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Decorative line under subtitle
        const lineY = titleY + 115;
        const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 120, lineY, CANVAS_WIDTH / 2 + 120, lineY);
        lineGrad.addColorStop(0, 'rgba(78, 205, 196, 0)');
        lineGrad.addColorStop(0.3, 'rgba(78, 205, 196, 0.5)');
        lineGrad.addColorStop(0.5, 'rgba(78, 205, 196, 0.8)');
        lineGrad.addColorStop(0.7, 'rgba(78, 205, 196, 0.5)');
        lineGrad.addColorStop(1, 'rgba(78, 205, 196, 0)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2 - 120, lineY);
        ctx.lineTo(CANVAS_WIDTH / 2 + 120, lineY);
        ctx.stroke();

        // Menu options with enhanced styling
        ctx.font = 'bold 20px monospace';
        this.menuOptions.forEach((option, i) => {
            const y = 270 + i * 55;
            const isSelected = i === this.menuSelection;

            if (isSelected) {
                // Animated selection background with rounded corners
                const pulseAlpha = 0.4 + Math.sin(now / 200) * 0.15;
                const btnX = CANVAS_WIDTH / 2 - 140;
                const btnY = y - 20;
                const btnW = 280;
                const btnH = 42;
                const btnR = 8;

                // Button background
                ctx.fillStyle = `rgba(52, 152, 219, ${pulseAlpha})`;
                ctx.beginPath();
                ctx.moveTo(btnX + btnR, btnY);
                ctx.lineTo(btnX + btnW - btnR, btnY);
                ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + btnR);
                ctx.lineTo(btnX + btnW, btnY + btnH - btnR);
                ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - btnR, btnY + btnH);
                ctx.lineTo(btnX + btnR, btnY + btnH);
                ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - btnR);
                ctx.lineTo(btnX, btnY + btnR);
                ctx.quadraticCurveTo(btnX, btnY, btnX + btnR, btnY);
                ctx.closePath();
                ctx.fill();

                // Border glow
                ctx.strokeStyle = '#5dade2';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#3498db';
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Animated arrow indicators
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10;
                const arrowOffset = Math.sin(now / 150) * 6;
                ctx.font = 'bold 24px monospace';
                ctx.fillText('>', CANVAS_WIDTH / 2 - 115 + arrowOffset, y + 7);
                ctx.fillText('<', CANVAS_WIDTH / 2 + 115 - arrowOffset, y + 7);
                ctx.shadowBlur = 0;
                ctx.font = 'bold 20px monospace';
            }

            // Text with shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(160, 160, 180, 0.8)';
            ctx.fillText(option, CANVAS_WIDTH / 2, y + 7);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
        });

        // Controls hint - cleaner styling
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(120, 130, 150, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText('UP/DOWN Select  |  ENTER/SPACE Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 55);
        ctx.shadowBlur = 0;

        // Credits
        ctx.fillStyle = 'rgba(80, 80, 120, 0.7)';
        ctx.fillText('Retro Game Jam 2024', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 25);
    }

    drawHUD(ctx: CanvasRenderingContext2D, players: (Player | null)[], levelManager: LevelManager) {
        const level = levelManager.currentLevel;
        const wave = levelManager.currentWaveIndex + 1;
        const totalWaves = level.waves.length;

        // Level info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 250, 30);

        ctx.fillStyle = '#ffd700';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${level.name}`, 20, 30);

        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(`Wave ${wave}/${totalWaves}`, 180, 30);

        // Player health bars
        players.forEach((player, i) => {
            if (!player) return;

            const barX = 10 + i * 200;
            const barY = 50;
            const barWidth = 180;
            const barHeight = 25;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight + 20);

            // Player label
            ctx.fillStyle = i === 0 ? '#ff6b6b' : '#4ecdc4';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`P${i + 1} LV${player.level}`, barX + 5, barY + 12);

            // Gold
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'right';
            ctx.fillText(`${player.gold}G`, barX + barWidth - 5, barY + 12);

            // Health bar background
            ctx.fillStyle = '#333';
            ctx.fillRect(barX + 5, barY + 18, barWidth - 10, 12);

            // Health bar fill
            const healthPercent = player.health / player.maxHealth;
            const healthColor = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f1c40f' : '#e74c3c';
            ctx.fillStyle = healthColor;
            ctx.fillRect(barX + 6, barY + 19, (barWidth - 12) * healthPercent, 10);

            // Health text
            ctx.fillStyle = '#fff';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, barX + barWidth / 2, barY + 28);

            // EXP bar
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(barX + 5, barY + 32, barWidth - 10, 6);
            ctx.fillStyle = '#9b59b6';
            const expPercent = player.exp / player.expToNextLevel;
            ctx.fillRect(barX + 6, barY + 33, (barWidth - 12) * expPercent, 4);
        });

        // Wave announcement
        if (levelManager.waveComplete && levelManager.waveDelay > 60) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80);

            ctx.fillStyle = '#2ecc71';
            ctx.font = '20px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('WAVE COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('Next wave incoming...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
        }
    }

    drawLevelComplete(ctx: CanvasRenderingContext2D, levelManager: LevelManager, input: InputManager): string | null {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Victory banner
        ctx.fillStyle = '#ffd700';
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH / 2, 120);

        ctx.fillStyle = '#2ecc71';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillText(levelManager.currentLevel.name, CANVAS_WIDTH / 2, 170);

        // Stats could go here
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('All enemies defeated!', CANVAS_WIDTH / 2, 250);

        // Options
        const blink = Math.floor(Date.now() / 500) % 2;
        ctx.fillStyle = blink ? '#4ecdc4' : '#3498db';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('Press ENTER to continue', CANVAS_WIDTH / 2, 350);

        ctx.fillStyle = '#7f8c8d';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('Press S for Shop', CANVAS_WIDTH / 2, 390);

        if (input.isConfirm()) {
            return 'continue';
        }
        if (input.isDown('s') || input.isDown('KeyS')) {
            return 'shop';
        }

        return null;
    }

    drawGameOver(ctx: CanvasRenderingContext2D, input: InputManager): boolean {
        ctx.fillStyle = 'rgba(100, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#e74c3c';
        ctx.font = '48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 180);

        ctx.fillStyle = '#fff';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('The heroes have fallen...', CANVAS_WIDTH / 2, 250);

        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillText('Press ENTER to try again', CANVAS_WIDTH / 2, 350);
        }

        return input.isConfirm();
    }

    drawVictory(ctx: CanvasRenderingContext2D, input: InputManager): boolean {
        ctx.fillStyle = 'rgba(0, 50, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Confetti effect
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 30; i++) {
            const x = (i * 67 + Date.now() / 20) % CANVAS_WIDTH;
            const y = (i * 43 + Date.now() / 30) % CANVAS_HEIGHT;
            ctx.fillRect(x, y, 6, 6);
        }
        ctx.fillStyle = '#ff6b6b';
        for (let i = 0; i < 20; i++) {
            const x = (i * 89 + Date.now() / 25) % CANVAS_WIDTH;
            const y = (i * 51 + Date.now() / 35) % CANVAS_HEIGHT;
            ctx.fillRect(x, y, 5, 5);
        }

        ctx.fillStyle = '#ffd700';
        ctx.font = '40px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', CANVAS_WIDTH / 2, 150);

        ctx.fillStyle = '#2ecc71';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillText('The Dragon King is defeated!', CANVAS_WIDTH / 2, 220);

        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('Peace has returned to the land.', CANVAS_WIDTH / 2, 280);
        ctx.fillText('Thank you for playing!', CANVAS_WIDTH / 2, 310);

        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            ctx.fillStyle = '#4ecdc4';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('Press ENTER to play again', CANVAS_WIDTH / 2, 400);
        }

        return input.isConfirm();
    }

    drawPauseOverlay(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText('Press S for Shop', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
}
