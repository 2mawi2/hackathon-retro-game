import { CANVAS_WIDTH, CANVAS_HEIGHT, GameState, GameStateType } from './constants';
import { input } from './input';
import { Player } from './player';
import { LevelManager } from './levels';
import { Shop } from './shop';
import { UI } from './ui';
import { checkCollision, Particle, DamageNumber, randomRange } from './utils';
import { sound } from './sound';
import { music } from './music';
import { SkillTree } from './skills/skillTree';
import { SkillTreeUI } from './ui/skillTreeUI';
import { PlayerStats } from './playerStats';

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    state: GameStateType;
    coopMode: boolean;
    players: Player[];
    levelManager: LevelManager;
    shop: Shop;
    ui: UI;
    skillTree: SkillTree;
    skillTreeUI: SkillTreeUI;
    previewStats: PlayerStats;
    particles: Particle[];
    damageNumbers: DamageNumber[];
    groundY: number;
    paused: boolean;
    lastTime: number;

    constructor() {
        this.canvas = document.getElementById('game') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.state = GameState.MENU;
        this.coopMode = false;

        this.players = [];
        this.levelManager = new LevelManager();
        this.shop = new Shop();
        this.ui = new UI();
        this.skillTree = new SkillTree();
        this.skillTreeUI = new SkillTreeUI();
        this.previewStats = new PlayerStats();

        this.particles = [];
        this.damageNumbers = [];

        this.groundY = 420;
        this.paused = false;

        // Start game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    initGame(coopMode: boolean) {
        this.coopMode = coopMode;
        this.players = [];

        // Player 1 - Knight
        const player1 = new Player(1, 100, this.groundY - 60);
        player1.calculateStats();
        this.players.push(player1);

        // Player 2 - Robot (if co-op)
        if (coopMode) {
            const player2 = new Player(2, 50, this.groundY - 60);
            player2.calculateStats();
            this.players.push(player2);
        }

        // Check for ?level=N URL parameter to start at specific level (0-indexed)
        const urlParams = new URLSearchParams(window.location.search);
        const startLevel = parseInt(urlParams.get('level') || '0', 10);
        this.levelManager.startLevel(startLevel);

        this.particles = [];
        this.damageNumbers = [];
        this.state = GameState.PLAYING;

        // Start level music
        music.playLevel(this.levelManager.currentLevelIndex);
    }

    gameLoop(timestamp: number) {
        this.lastTime = timestamp;

        input.update();
        this.update();
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }

    update() {
        switch (this.state) {
            case GameState.MENU:
                // Skill tree preview from menu
                if (input.isJustPressed('k') || input.isJustPressed('KeyK')) {
                    this.skillTreeUI.toggle();
                }
                if (this.skillTreeUI.isOpen()) {
                    // Use preview stats for menu (no purchases possible without player)
                    this.skillTreeUI.update(input, this.skillTree, this.previewStats);
                    return;
                }

                // Input handling only
                if (input.isMenuUp()) {
                    this.ui.menuSelection = Math.max(0, this.ui.menuSelection - 1);
                    sound.menuSelect();
                }
                if (input.isMenuDown()) {
                    this.ui.menuSelection = Math.min(this.ui.menuOptions.length - 1, this.ui.menuSelection + 1);
                    sound.menuSelect();
                }
                if (input.isConfirm()) {
                    sound.menuConfirm();
                    sound.init(); // Initialize audio context on first user interaction
                    music.init(); // Initialize music audio context
                    this.initGame(this.ui.menuSelection === 1);
                }
                break;

            case GameState.PLAYING:
                // Update skill tree UI if open
                if (this.skillTreeUI.isOpen()) {
                    this.skillTreeUI.update(input, this.skillTree, this.players[0].stats);
                    return;
                }

                // Skill tree toggle (works even when paused)
                if (input.isJustPressed('k') || input.isJustPressed('KeyK')) {
                    this.skillTreeUI.toggle();
                    return;
                }

                if (input.isCancel()) {
                    this.paused = !this.paused;
                }

                if (this.paused) {
                    if (input.isJustPressed('b') || input.isJustPressed('KeyB')) {
                        this.state = GameState.SHOP;
                        this.paused = false;
                        // Play shop music
                        music.play('shop');
                    }
                    return;
                }

                this.updateGame();
                break;

            case GameState.SHOP: {
                const stayInShop = this.shop.update(input, this.players[0]);
                if (!stayInShop) {
                    this.state = GameState.PLAYING;
                    // Resume level music when leaving shop
                    music.playLevel(this.levelManager.currentLevelIndex);
                }
                break;
            }

            case GameState.LEVEL_COMPLETE:
                // Handled in draw
                break;

            case GameState.GAME_OVER:
                // Handled in draw
                break;

            case GameState.VICTORY:
                // Handled in draw
                break;
        }
    }

    updateGame() {
        // Update players
        const levelMechanics = this.levelManager.currentLevel.mechanics;
        this.players.forEach((player, i) => {
            if (player.health <= 0) return;

            const inputState = i === 0 ? input.getPlayer1Input() : input.getPlayer2Input();
            player.update(inputState, this.groundY, levelMechanics);
        });

        // Update level (enemies, projectiles)
        this.levelManager.update(this.players);

        // Check player attacks on enemies
        this.players.forEach(player => {
            if (player.health <= 0) return;

            const hitbox = player.getAttackHitbox();
            if (!hitbox) return;

            this.levelManager.enemies.forEach(enemy => {
                if (enemy.dead) return;

                if (checkCollision(hitbox, enemy.getHitbox())) {
                    // Calculate damage (use getEffectiveDamage for berserker mode)
                    let damage = player.getEffectiveDamage();
                    const isCrit = Math.random() < player.critChance;
                    const isBerserker = player.isBerserkerActive();
                    if (isCrit) {
                        damage *= player.critMultiplier;
                        sound.criticalHit();
                    } else {
                        sound.hit();
                    }

                    const killed = enemy.takeDamage(damage, player.facing);

                    // Damage number - red for berserker, gold for crit, white for normal
                    let damageColor = '#fff';
                    if (isCrit) damageColor = '#ffd700';
                    else if (isBerserker) damageColor = '#ff4444';

                    this.damageNumbers.push(new DamageNumber(
                        enemy.x + enemy.width / 2,
                        enemy.y,
                        damage,
                        damageColor
                    ));

                    // Hit particles
                    for (let i = 0; i < 5; i++) {
                        this.particles.push(new Particle(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2,
                            randomRange(-3, 3),
                            randomRange(-4, -1),
                            isCrit ? '#ffd700' : '#e74c3c'
                        ));
                    }

                    if (killed) {
                        // Reward players
                        player.addExp(enemy.exp);

                        // Gold Rush: +75% gold from enemies
                        let goldReward = enemy.gold;
                        if (player.stats.skillModifiers.goldMult > 0) {
                            goldReward = Math.floor(goldReward * (1 + player.stats.skillModifiers.goldMult));
                        }
                        player.addGold(goldReward);
                        sound.enemyDeath();
                        sound.coin();

                        // Death particles
                        for (let i = 0; i < 15; i++) {
                            this.particles.push(new Particle(
                                enemy.x + enemy.width / 2,
                                enemy.y + enemy.height / 2,
                                randomRange(-5, 5),
                                randomRange(-6, -2),
                                enemy.color,
                                40
                            ));
                        }

                        // Gold number (show actual amount received)
                        this.damageNumbers.push(new DamageNumber(
                            enemy.x + enemy.width / 2,
                            enemy.y - 20,
                            '+' + goldReward + 'G',
                            '#ffd700'
                        ));
                    }
                }
            });
        });

        // Check enemy collisions with players
        this.levelManager.enemies.forEach(enemy => {
            if (enemy.dead) return;

            this.players.forEach(player => {
                if (player.health <= 0 || player.invincible) return;

                if (checkCollision(player, enemy.getHitbox())) {
                    const knockback = player.x < enemy.x ? -1 : 1;
                    const damage = player.takeDamage(enemy.damage, knockback);
                    sound.playerHurt();

                    this.damageNumbers.push(new DamageNumber(
                        player.x + player.width / 2,
                        player.y,
                        damage,
                        '#e74c3c'
                    ));
                }
            });
        });

        // Check projectile collisions with players
        this.levelManager.projectiles.forEach((proj) => {
            this.players.forEach(player => {
                if (player.health <= 0 || player.invincible) return;

                if (checkCollision(player, proj.getHitbox())) {
                    const knockback = proj.vx > 0 ? 1 : -1;
                    const damage = player.takeDamage(proj.damage, knockback);
                    sound.playerHurt();

                    this.damageNumbers.push(new DamageNumber(
                        player.x + player.width / 2,
                        player.y,
                        damage,
                        '#e74c3c'
                    ));

                    // Remove projectile
                    proj.life = 0;
                }
            });
        });

        // Update particles
        this.particles = this.particles.filter(p => p.update());

        // Update damage numbers
        this.damageNumbers = this.damageNumbers.filter(d => d.update());

        // Check for level completion
        if (this.levelManager.levelComplete) {
            if (this.levelManager.isLastLevel) {
                this.state = GameState.VICTORY;
                music.play('victory');
            } else {
                this.state = GameState.LEVEL_COMPLETE;
                // Keep current level music during level complete screen
            }
        }

        // Check for game over
        const allDead = this.players.every(p => p.health <= 0);
        if (allDead) {
            this.state = GameState.GAME_OVER;
            music.play('gameover');
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.state) {
            case GameState.MENU:
                this.ui.drawMenu(this.ctx);
                // Draw skill tree UI on top if open
                this.skillTreeUI.draw(this.ctx, this.skillTree, this.previewStats);
                break;

            case GameState.PLAYING:
            case GameState.SHOP:
            case GameState.LEVEL_COMPLETE:
                this.drawGame();

                if (this.state === GameState.SHOP) {
                    this.shop.draw(this.ctx, this.players[0], CANVAS_WIDTH, CANVAS_HEIGHT);
                } else if (this.state === GameState.LEVEL_COMPLETE) {
                    const action = this.ui.drawLevelComplete(this.ctx, this.levelManager, input);
                    if (action === 'continue') {
                        this.levelManager.nextLevel();
                        this.levelManager.startLevel(this.levelManager.currentLevelIndex);
                        this.players.forEach(p => p.reset());
                        this.state = GameState.PLAYING;
                        // Start new level's music
                        music.playLevel(this.levelManager.currentLevelIndex);
                    } else if (action === 'shop') {
                        this.state = GameState.SHOP;
                        // Play shop music
                        music.play('shop');
                    } else if (action === 'skillTree') {
                        this.skillTreeUI.toggle();
                    }
                }

                if (this.paused && this.state === GameState.PLAYING) {
                    this.ui.drawPauseOverlay(this.ctx);
                }

                // Draw skill tree UI on top of everything
                this.skillTreeUI.draw(this.ctx, this.skillTree, this.players[0].stats);
                break;

            case GameState.GAME_OVER:
                this.drawGame();
                if (this.ui.drawGameOver(this.ctx, input)) {
                    // Restart current level
                    this.levelManager.startLevel(this.levelManager.currentLevelIndex);
                    this.players.forEach(p => {
                        p.reset();
                        p.x = p.playerNum === 1 ? 100 : 50;
                        p.y = this.groundY - 60;
                    });
                    this.state = GameState.PLAYING;
                    // Restart level music
                    music.playLevel(this.levelManager.currentLevelIndex);
                }
                break;

            case GameState.VICTORY:
                this.drawGame();
                if (this.ui.drawVictory(this.ctx, input)) {
                    this.state = GameState.MENU;
                    this.ui.menuSelection = 0;
                    // Play menu music
                    music.play('menu');
                }
                break;
        }
    }

    drawGame() {
        // Draw background
        this.levelManager.drawBackground(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw level entities (enemies, projectiles)
        this.levelManager.draw(this.ctx);

        // Draw players
        this.players.forEach(player => {
            if (player.health > 0) {
                player.draw(this.ctx);
            }
        });

        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx));

        // Draw damage numbers
        this.damageNumbers.forEach(d => d.draw(this.ctx));

        // Draw HUD
        this.ui.drawHUD(this.ctx, this.players, this.levelManager);
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game();

    // Start menu music on first user interaction (required by browsers)
    const startMenuMusic = () => {
        music.init();
        music.play('menu');
        document.removeEventListener('click', startMenuMusic);
        document.removeEventListener('keydown', startMenuMusic);
    };

    document.addEventListener('click', startMenuMusic, { once: true });
    document.addEventListener('keydown', startMenuMusic, { once: true });
});
