/**
 * Background Animation System
 * Adds life to level background elements with smooth animations
 */

export interface CloudData {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    opacity: number;
    layer: number; // 0 = far, 1 = mid, 2 = near (parallax)
}

export interface TreeData {
    x: number;
    baseY: number;
    height: number;
    swayOffset: number;
    swaySpeed: number;
    swayAmount: number;
}

export interface GravestoneData {
    x: number;
    y: number;
    height: number;
    wobblePhase: number;
}

export interface LavaPoolData {
    x: number;
    y: number;
    width: number;
    bubbles: LavaBubble[];
}

export interface LavaBubble {
    x: number;
    y: number;
    size: number;
    speed: number;
    phase: number;
}

export interface IcicleData {
    x: number;
    y: number;
    height: number;
    dripTimer: number;
    dripPhase: number;
}

export interface SparkleData {
    x: number;
    y: number;
    phase: number;
    maxSize: number;
}

export interface BirdData {
    x: number;
    y: number;
    speed: number;
    wingPhase: number;
    amplitude: number;
}

/**
 * BackgroundAnimator manages animated background elements
 */
export class BackgroundAnimator {
    // Animation time tracking
    private time: number = 0;

    // Cached element data
    private clouds: CloudData[] = [];
    private trees: TreeData[] = [];
    private gravestones: GravestoneData[] = [];
    private lavaPools: LavaPoolData[] = [];
    private icicles: IcicleData[] = [];
    private sparkles: SparkleData[] = [];
    private birds: BirdData[] = [];

    // Canvas dimensions
    private width: number = 800;
    private groundY: number = 420;

    // Current level type
    private currentBackground: string = '';

    constructor() {
        this.reset();
    }

    /**
     * Initialize or reset for a new level
     */
    reset(): void {
        this.time = 0;
        this.clouds = [];
        this.trees = [];
        this.gravestones = [];
        this.lavaPools = [];
        this.icicles = [];
        this.sparkles = [];
        this.birds = [];
    }

    /**
     * Setup background elements for a specific level type
     */
    setupForLevel(background: string, width: number, groundY: number): void {
        if (this.currentBackground === background) return;

        this.currentBackground = background;
        this.width = width;
        this.groundY = groundY;
        this.reset();

        switch (background) {
            case 'forest':
                this.setupForestElements();
                break;
            case 'graveyard':
                this.setupGraveyardElements();
                break;
            case 'mountains':
            case 'skyCastle':
                this.setupMountainElements();
                break;
            case 'iceCave':
                this.setupIceCaveElements();
                break;
            case 'volcano':
                this.setupVolcanoElements();
                break;
            case 'castle':
                this.setupCastleElements();
                break;
        }
    }

    private setupForestElements(): void {
        // Clouds at different depths
        this.clouds = [
            { x: 50, y: 50, width: 80, height: 30, speed: 0.15, opacity: 0.6, layer: 0 },
            { x: 200, y: 80, width: 100, height: 35, speed: 0.2, opacity: 0.7, layer: 1 },
            { x: 450, y: 40, width: 70, height: 25, speed: 0.12, opacity: 0.5, layer: 0 },
            { x: 600, y: 90, width: 90, height: 32, speed: 0.25, opacity: 0.8, layer: 2 },
            { x: 750, y: 60, width: 75, height: 28, speed: 0.18, opacity: 0.65, layer: 1 },
        ];

        // Trees with individual sway properties
        this.trees = [
            { x: 50, baseY: this.groundY, height: 80, swayOffset: 0, swaySpeed: 1.2, swayAmount: 3 },
            { x: 150, baseY: this.groundY, height: 90, swayOffset: Math.PI / 3, swaySpeed: 1.0, swayAmount: 4 },
            { x: 650, baseY: this.groundY, height: 85, swayOffset: Math.PI / 2, swaySpeed: 1.3, swayAmount: 3.5 },
            { x: 750, baseY: this.groundY, height: 75, swayOffset: Math.PI, swaySpeed: 1.1, swayAmount: 2.5 },
        ];

        // Birds
        this.birds = [
            { x: 100, y: 120, speed: 1.5, wingPhase: 0, amplitude: 15 },
            { x: 300, y: 80, speed: 1.2, wingPhase: Math.PI / 2, amplitude: 20 },
            { x: 500, y: 150, speed: 1.8, wingPhase: Math.PI, amplitude: 12 },
        ];
    }

    private setupGraveyardElements(): void {
        // Gravestones with subtle wobble
        this.gravestones = [
            { x: 80, y: this.groundY, height: 55, wobblePhase: 0 },
            { x: 200, y: this.groundY, height: 40, wobblePhase: Math.PI / 4 },
            { x: 350, y: this.groundY, height: 70, wobblePhase: Math.PI / 2 },
            { x: 500, y: this.groundY, height: 45, wobblePhase: Math.PI * 0.75 },
            { x: 680, y: this.groundY, height: 60, wobblePhase: Math.PI },
        ];

        // Spooky floating particles (will be rendered as ghostly wisps)
        this.sparkles = [];
        for (let i = 0; i < 12; i++) {
            this.sparkles.push({
                x: Math.random() * this.width,
                y: 100 + Math.random() * (this.groundY - 150),
                phase: Math.random() * Math.PI * 2,
                maxSize: 3 + Math.random() * 4,
            });
        }
    }

    private setupMountainElements(): void {
        // Clouds for mountain/sky levels
        this.clouds = [
            { x: 30, y: 60, width: 100, height: 40, speed: 0.1, opacity: 0.7, layer: 0 },
            { x: 180, y: 100, width: 120, height: 45, speed: 0.15, opacity: 0.8, layer: 1 },
            { x: 380, y: 45, width: 90, height: 35, speed: 0.08, opacity: 0.6, layer: 0 },
            { x: 550, y: 85, width: 110, height: 42, speed: 0.2, opacity: 0.75, layer: 1 },
            { x: 720, y: 55, width: 85, height: 32, speed: 0.12, opacity: 0.65, layer: 0 },
        ];

        // Birds flying in the distance
        this.birds = [
            { x: 200, y: 100, speed: 1.0, wingPhase: 0, amplitude: 20 },
            { x: 400, y: 130, speed: 0.8, wingPhase: Math.PI / 3, amplitude: 25 },
            { x: 600, y: 90, speed: 1.2, wingPhase: Math.PI * 0.7, amplitude: 18 },
        ];
    }

    private setupIceCaveElements(): void {
        // Icicles with dripping animation
        const iciclePositions = [50, 150, 280, 420, 550, 680, 750];
        this.icicles = iciclePositions.map((x, i) => ({
            x,
            y: 80,
            height: 40 + (i % 3) * 20,
            dripTimer: Math.random() * 200,
            dripPhase: Math.random() * Math.PI * 2,
        }));

        // Ice sparkles
        this.sparkles = [];
        for (let i = 0; i < 20; i++) {
            this.sparkles.push({
                x: Math.random() * this.width,
                y: 100 + Math.random() * (this.groundY - 150),
                phase: Math.random() * Math.PI * 2,
                maxSize: 2 + Math.random() * 3,
            });
        }
    }

    private setupVolcanoElements(): void {
        // Lava pools with bubbles
        this.lavaPools = [
            {
                x: 100,
                y: this.groundY + 30,
                width: 80,
                bubbles: this.createLavaBubbles(100, this.groundY + 30, 80, 5),
            },
            {
                x: 600,
                y: this.groundY + 35,
                width: 100,
                bubbles: this.createLavaBubbles(600, this.groundY + 35, 100, 6),
            },
        ];

        // Floating embers/sparks
        this.sparkles = [];
        for (let i = 0; i < 15; i++) {
            this.sparkles.push({
                x: 300 + Math.random() * 200, // Near volcano
                y: this.groundY - 200 + Math.random() * 100,
                phase: Math.random() * Math.PI * 2,
                maxSize: 2 + Math.random() * 4,
            });
        }
    }

    private setupCastleElements(): void {
        // Bats flying around
        this.birds = [
            { x: 150, y: 80, speed: 2.0, wingPhase: 0, amplitude: 30 },
            { x: 350, y: 120, speed: 1.8, wingPhase: Math.PI / 2, amplitude: 25 },
            { x: 550, y: 70, speed: 2.2, wingPhase: Math.PI, amplitude: 35 },
            { x: 700, y: 100, speed: 1.5, wingPhase: Math.PI * 1.5, amplitude: 28 },
        ];

        // Ghostly wisps near windows
        this.sparkles = [];
        for (let i = 0; i < 8; i++) {
            this.sparkles.push({
                x: 100 + Math.random() * 600,
                y: this.groundY - 200 + Math.random() * 100,
                phase: Math.random() * Math.PI * 2,
                maxSize: 4 + Math.random() * 5,
            });
        }
    }

    private createLavaBubbles(poolX: number, poolY: number, poolWidth: number, count: number): LavaBubble[] {
        const bubbles: LavaBubble[] = [];
        for (let i = 0; i < count; i++) {
            bubbles.push({
                x: poolX + Math.random() * poolWidth,
                y: poolY,
                size: 3 + Math.random() * 5,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return bubbles;
    }

    /**
     * Update animation state
     */
    update(deltaTime: number = 1): void {
        this.time += deltaTime * 0.016; // Normalize to ~60fps

        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });

        // Update birds
        this.birds.forEach(bird => {
            bird.x += bird.speed;
            bird.wingPhase += 0.2;
            if (bird.x > this.width + 50) {
                bird.x = -50;
            }
        });

        // Update lava bubbles
        this.lavaPools.forEach(pool => {
            pool.bubbles.forEach(bubble => {
                bubble.phase += bubble.speed * 0.1;
                // Reset bubble when it "pops"
                if (bubble.phase > Math.PI * 2) {
                    bubble.phase = 0;
                    bubble.x = pool.x + Math.random() * pool.width;
                }
            });
        });

        // Update icicle drips
        this.icicles.forEach(icicle => {
            icicle.dripTimer += 1;
            if (icicle.dripTimer > 180) { // ~3 seconds
                icicle.dripTimer = 0;
            }
        });
    }

    /**
     * Draw animated clouds
     */
    drawClouds(ctx: CanvasRenderingContext2D): void {
        this.clouds.forEach(cloud => {
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;

            // Multi-part cloud for fluffy appearance
            const baseY = cloud.y + Math.sin(this.time * 0.5 + cloud.x * 0.01) * 2;

            ctx.fillRect(cloud.x, baseY, cloud.width, cloud.height * 0.8);
            ctx.fillRect(cloud.x + cloud.width * 0.1, baseY - cloud.height * 0.3, cloud.width * 0.8, cloud.height * 0.7);
            ctx.fillRect(cloud.x + cloud.width * 0.2, baseY + cloud.height * 0.5, cloud.width * 0.6, cloud.height * 0.5);
        });
    }

    /**
     * Draw animated trees with swaying motion
     */
    drawTrees(ctx: CanvasRenderingContext2D): void {
        this.trees.forEach(tree => {
            const sway = Math.sin(this.time * tree.swaySpeed + tree.swayOffset) * tree.swayAmount;

            ctx.save();
            ctx.translate(tree.x + 25, tree.baseY - 20);

            // Apply sway rotation from base
            ctx.rotate(sway * 0.02);

            // Trunk (doesn't move much)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-10, -60, 20, 60);

            // Leaves (sway more)
            ctx.save();
            ctx.rotate(sway * 0.01);
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.moveTo(0, -tree.height - 60);
            ctx.lineTo(-35 + sway * 0.5, -60);
            ctx.lineTo(35 + sway * 0.5, -60);
            ctx.closePath();
            ctx.fill();

            // Second layer of leaves
            ctx.fillStyle = '#1e7b1e';
            ctx.beginPath();
            ctx.moveTo(0, -tree.height - 40);
            ctx.lineTo(-28 + sway * 0.3, -50);
            ctx.lineTo(28 + sway * 0.3, -50);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.restore();
        });
    }

    /**
     * Draw animated gravestones with subtle wobble
     */
    drawGravestones(ctx: CanvasRenderingContext2D): void {
        this.gravestones.forEach(grave => {
            const wobble = Math.sin(this.time * 0.5 + grave.wobblePhase) * 0.5;

            ctx.save();
            ctx.translate(grave.x + 15, grave.y - 20);
            ctx.rotate(wobble * 0.02);

            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(-15, -grave.height, 30, grave.height);

            // Rounded top
            ctx.beginPath();
            ctx.arc(0, -grave.height, 15, Math.PI, 0);
            ctx.fill();

            // Cross or text detail
            ctx.fillStyle = '#5d6d7e';
            ctx.fillRect(-2, -grave.height + 10, 4, 20);
            ctx.fillRect(-8, -grave.height + 15, 16, 4);

            ctx.restore();
        });
    }

    /**
     * Draw ghostly wisps/particles
     */
    drawWisps(ctx: CanvasRenderingContext2D, color: string = 'rgba(200, 200, 255, '): void {
        this.sparkles.forEach(sparkle => {
            const pulse = (Math.sin(this.time * 2 + sparkle.phase) + 1) * 0.5;
            const size = sparkle.maxSize * pulse;
            const floatY = sparkle.y + Math.sin(this.time * 0.8 + sparkle.phase) * 10;
            const floatX = sparkle.x + Math.cos(this.time * 0.5 + sparkle.phase) * 5;

            const alpha = 0.3 + pulse * 0.4;
            ctx.fillStyle = `${color}${alpha})`;
            ctx.beginPath();
            ctx.arc(floatX, floatY, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw ice cave sparkles
     */
    drawIceSparkles(ctx: CanvasRenderingContext2D): void {
        this.sparkles.forEach(sparkle => {
            const pulse = Math.sin(this.time * 3 + sparkle.phase);
            if (pulse > 0.6) {
                const size = sparkle.maxSize * (pulse - 0.6) * 2.5;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(sparkle.x - size / 2, sparkle.y - size / 2, size, size);
            }
        });
    }

    /**
     * Draw animated icicles with dripping
     */
    drawIcicles(ctx: CanvasRenderingContext2D): void {
        this.icicles.forEach(icicle => {
            // Main icicle
            ctx.fillStyle = '#a8d8ea';
            ctx.beginPath();
            ctx.moveTo(icicle.x, icicle.y);
            ctx.lineTo(icicle.x + 10, icicle.y);
            ctx.lineTo(icicle.x + 5, icicle.y + icicle.height);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#d4f1f9';
            ctx.beginPath();
            ctx.moveTo(icicle.x + 2, icicle.y);
            ctx.lineTo(icicle.x + 5, icicle.y);
            ctx.lineTo(icicle.x + 4, icicle.y + icicle.height * 0.7);
            ctx.closePath();
            ctx.fill();

            // Drip animation
            if (icicle.dripTimer > 120 && icicle.dripTimer < 180) {
                const dripProgress = (icicle.dripTimer - 120) / 60;
                const dripY = icicle.y + icicle.height + dripProgress * 50;
                const dripSize = 3 * (1 - dripProgress * 0.5);

                ctx.fillStyle = '#a8d8ea';
                ctx.beginPath();
                ctx.arc(icicle.x + 5, dripY, dripSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    /**
     * Draw animated lava pools with bubbling
     */
    drawLavaPools(ctx: CanvasRenderingContext2D): void {
        this.lavaPools.forEach(pool => {
            // Pool base
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(pool.x, pool.y, pool.width, 20);

            // Surface glow
            const glowIntensity = 0.3 + Math.sin(this.time * 2) * 0.1;
            ctx.fillStyle = `rgba(243, 156, 18, ${glowIntensity})`;
            ctx.fillRect(pool.x, pool.y, pool.width, 8);

            // Bubbles
            pool.bubbles.forEach(bubble => {
                const bubbleY = pool.y - Math.sin(bubble.phase) * 15;
                const bubbleSize = bubble.size * (1 - bubble.phase / (Math.PI * 2) * 0.5);

                if (bubble.phase < Math.PI * 1.8) {
                    ctx.fillStyle = '#f39c12';
                    ctx.beginPath();
                    ctx.arc(bubble.x, bubbleY, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();

                    // Bubble highlight
                    ctx.fillStyle = '#f1c40f';
                    ctx.beginPath();
                    ctx.arc(bubble.x - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3, bubbleSize * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
    }

    /**
     * Draw floating embers (for volcano)
     */
    drawEmbers(ctx: CanvasRenderingContext2D): void {
        this.sparkles.forEach(sparkle => {
            const floatY = sparkle.y - (this.time * 20 + sparkle.phase * 50) % 250;
            const floatX = sparkle.x + Math.sin(this.time * 2 + sparkle.phase) * 15;
            const flicker = (Math.sin(this.time * 10 + sparkle.phase) + 1) * 0.5;

            const alpha = 0.5 + flicker * 0.5;
            const size = sparkle.maxSize * (0.5 + flicker * 0.5);

            ctx.fillStyle = `rgba(255, ${100 + Math.floor(flicker * 100)}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(floatX, floatY, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw animated birds
     */
    drawBirds(ctx: CanvasRenderingContext2D, isBat: boolean = false): void {
        this.birds.forEach(bird => {
            const wingFlap = Math.sin(bird.wingPhase) * 0.5;
            const bobY = bird.y + Math.sin(this.time + bird.x * 0.01) * bird.amplitude * 0.1;

            ctx.save();
            ctx.translate(bird.x, bobY);

            if (isBat) {
                // Bat shape
                ctx.fillStyle = '#1a0a2e';
                ctx.beginPath();
                // Body
                ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                // Wings
                ctx.beginPath();
                ctx.moveTo(-3, 0);
                ctx.quadraticCurveTo(-10, -8 * wingFlap, -15, 2);
                ctx.lineTo(-3, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(3, 0);
                ctx.quadraticCurveTo(10, -8 * wingFlap, 15, 2);
                ctx.lineTo(3, 2);
                ctx.fill();
            } else {
                // Bird shape (simple V)
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, wingFlap * 5);
                ctx.quadraticCurveTo(0, -5 - wingFlap * 3, 8, wingFlap * 5);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    /**
     * Get current time for external use
     */
    getTime(): number {
        return this.time;
    }
}

// Export singleton instance
export const backgroundAnimator = new BackgroundAnimator();
