import { CANVAS_WIDTH, CANVAS_HEIGHT, GameState } from './constants.js';
import { input } from './input.js';
import { Player } from './player.js';
import { LevelManager } from './levels.js';
import { Shop } from './shop.js';
import { UI } from './ui.js';
import { checkCollision, Particle, DamageNumber, randomRange } from './utils.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.state = GameState.MENU;
        this.coopMode = false;

        this.players = [];
        this.levelManager = new LevelManager();
        this.shop = new Shop();
        this.ui = new UI();

        this.particles = [];
        this.damageNumbers = [];

        this.groundY = 420;
        this.paused = false;

        // Start game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    initGame(coopMode) {
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

        this.levelManager.startLevel(0);
        this.particles = [];
        this.damageNumbers = [];
        this.state = GameState.PLAYING;
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        input.update();
        this.update();
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }

    update() {
        switch (this.state) {
            case GameState.MENU:
                // Input handling only
                if (input.isMenuUp()) {
                    this.ui.menuSelection = Math.max(0, this.ui.menuSelection - 1);
                }
                if (input.isMenuDown()) {
                    this.ui.menuSelection = Math.min(this.ui.menuOptions.length - 1, this.ui.menuSelection + 1);
                }
                if (input.isConfirm()) {
                    this.initGame(this.ui.menuSelection === 1);
                }
                break;

            case GameState.PLAYING:
                if (input.isCancel()) {
                    this.paused = !this.paused;
                }

                if (this.paused) {
                    if (input.isDown('s') || input.isDown('KeyS')) {
                        this.state = GameState.SHOP;
                        this.paused = false;
                    }
                    return;
                }

                this.updateGame();
                break;

            case GameState.SHOP:
                const stayInShop = this.shop.update(input, this.players[0]);
                if (!stayInShop) {
                    this.state = GameState.PLAYING;
                }
                break;

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
        this.players.forEach((player, i) => {
            if (player.health <= 0) return;

            const inputState = i === 0 ? input.getPlayer1Input() : input.getPlayer2Input();
            player.update(inputState, this.groundY);
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
                    // Calculate damage
                    let damage = player.damage;
                    const isCrit = Math.random() < player.critChance;
                    if (isCrit) {
                        damage *= player.critMultiplier;
                    }

                    const killed = enemy.takeDamage(damage, player.facing);

                    // Damage number
                    this.damageNumbers.push(new DamageNumber(
                        enemy.x + enemy.width / 2,
                        enemy.y,
                        damage,
                        isCrit ? '#ffd700' : '#fff'
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
                        player.addGold(enemy.gold);

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

                        // Gold number
                        this.damageNumbers.push(new DamageNumber(
                            enemy.x + enemy.width / 2,
                            enemy.y - 20,
                            '+' + enemy.gold + 'G',
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
        this.levelManager.projectiles.forEach((proj, projIndex) => {
            this.players.forEach(player => {
                if (player.health <= 0 || player.invincible) return;

                if (checkCollision(player, proj.getHitbox())) {
                    const knockback = proj.vx > 0 ? 1 : -1;
                    const damage = player.takeDamage(proj.damage, knockback);

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
            } else {
                this.state = GameState.LEVEL_COMPLETE;
            }
        }

        // Check for game over
        const allDead = this.players.every(p => p.health <= 0);
        if (allDead) {
            this.state = GameState.GAME_OVER;
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.state) {
            case GameState.MENU:
                this.ui.drawMenu(this.ctx);
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
                    } else if (action === 'shop') {
                        this.state = GameState.SHOP;
                    }
                }

                if (this.paused && this.state === GameState.PLAYING) {
                    this.ui.drawPauseOverlay(this.ctx);
                }
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
                }
                break;

            case GameState.VICTORY:
                this.drawGame();
                if (this.ui.drawVictory(this.ctx, input)) {
                    this.state = GameState.MENU;
                    this.ui.menuSelection = 0;
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
});
