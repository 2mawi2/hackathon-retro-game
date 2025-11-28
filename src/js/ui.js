import { CANVAS_WIDTH, CANVAS_HEIGHT, GameState } from './constants.js';

export class UI {
    constructor() {
        this.menuSelection = 0;
        this.menuOptions = ['Start Game', '2 Player Co-op'];
    }

    drawMenu(ctx) {
        // Background
        ctx.fillStyle = '#0f0c29';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Animated background stars
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73 + Date.now() / 50) % CANVAS_WIDTH;
            const y = (i * 47) % CANVAS_HEIGHT;
            const size = (i % 3) + 1;
            ctx.fillRect(x, y, size, size);
        }

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';

        // Animated title
        const titleY = 100 + Math.sin(Date.now() / 500) * 5;
        ctx.fillText('RETRO GAME JAM', CANVAS_WIDTH / 2, titleY);

        ctx.fillStyle = '#ff6b6b';
        ctx.font = '48px monospace';
        ctx.fillText('GO NUTS!', CANVAS_WIDTH / 2, titleY + 60);

        // Subtitle
        ctx.fillStyle = '#4ecdc4';
        ctx.font = '14px monospace';
        ctx.fillText('DRAGON SLAYER ADVENTURE', CANVAS_WIDTH / 2, titleY + 100);

        // Menu options
        ctx.font = '18px monospace';
        this.menuOptions.forEach((option, i) => {
            const y = 280 + i * 50;
            const isSelected = i === this.menuSelection;

            if (isSelected) {
                // Selection background
                ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                ctx.fillRect(CANVAS_WIDTH / 2 - 150, y - 18, 300, 35);

                // Arrow indicator
                ctx.fillStyle = '#ffd700';
                const arrowX = CANVAS_WIDTH / 2 - 140 + Math.sin(Date.now() / 200) * 5;
                ctx.fillText('>', arrowX, y + 5);
            }

            ctx.fillStyle = isSelected ? '#fff' : '#7f8c8d';
            ctx.fillText(option, CANVAS_WIDTH / 2, y + 5);
        });

        // Controls hint
        ctx.fillStyle = '#5d6d7e';
        ctx.font = '12px monospace';
        ctx.fillText('UP/DOWN Select | ENTER/SPACE Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);

        // Credits
        ctx.fillStyle = '#3d3d5c';
        ctx.fillText('Retro Game Jam 2024', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    }

    drawHUD(ctx, players, levelManager) {
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

    drawLevelComplete(ctx, levelManager, input) {
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

    drawGameOver(ctx, input) {
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

    drawVictory(ctx, input) {
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

    drawPauseOverlay(ctx) {
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
