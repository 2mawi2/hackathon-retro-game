// Player Renderer - Handles all player drawing
// Integrated with keyframe-based animation system

import { Animator, InterpolatedPose, knightAnimations, robotAnimations } from '../animation';

interface PlayerColors {
    primary: string;
    secondary: string;
    accent: string;
}

// Generic player interface for rendering
export interface RenderablePlayer {
    invincible: boolean;
    invincibleTimer: number;
    x: number;
    y: number;
    walkCycle: number;
    velocityX?: number;
    velocityY?: number;
    attacking: boolean;
    attackTimer: number;
    facing: number;
    isGrounded: boolean;
    hasDoubleJumped?: boolean;
    health?: number;
    maxHealth?: number;
    stats?: {
        equipment: {
            sword: { color: string };
            armor: { color: string };
            helmet: { color: string };
        };
    };
    equipment?: {
        sword: { color: string };
        armor: { color: string };
        helmet: { color: string };
    };
}

export class PlayerRenderer {
    playerType: string;
    colors: PlayerColors;
    animator: Animator;

    // Track previous state for animation transitions
    private wasGrounded: boolean = true;
    private wasAttacking: boolean = false;
    private lastHealth: number = 100;

    constructor(playerType: string) {
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

        // Initialize animator with appropriate animations
        const animations = playerType === 'knight' ? knightAnimations : robotAnimations;
        this.animator = new Animator(animations);
    }

    // Update animation state based on player state
    updateAnimation(player: RenderablePlayer, deltaTime: number = 1): void {
        // Check for hurt (health decreased)
        const currentHealth = player.health ?? 100;
        if (currentHealth < this.lastHealth && !this.animator.isPlaying('death')) {
            this.animator.play('hurt', true);
        }
        this.lastHealth = currentHealth;

        // Check for death
        if (currentHealth <= 0) {
            this.animator.play('death', true);
            this.animator.update(deltaTime);
            return;
        }

        // Handle landing
        if (!this.wasGrounded && player.isGrounded && !player.attacking) {
            this.animator.play('land', true);
        }

        // Determine which animation should play based on player state
        if (player.attacking && !this.wasAttacking) {
            // Start attack animation
            this.animator.play('attack', true);
        } else if (!player.isGrounded) {
            // In air
            if (player.hasDoubleJumped) {
                if (!this.animator.isPlaying('doubleJump')) {
                    this.animator.play('doubleJump');
                }
            } else if (!this.animator.isPlaying('jump') && !this.animator.isPlaying('doubleJump')) {
                this.animator.play('jump');
            }
        } else if (!this.animator.isPlaying('attack') && !this.animator.isPlaying('hurt') && !this.animator.isPlaying('land')) {
            // On ground and not in special animation
            const velocityX = player.velocityX ?? (player.walkCycle !== 0 ? 1 : 0);
            if (Math.abs(velocityX) > 0.1 || player.walkCycle !== 0) {
                if (!this.animator.isPlaying('walk')) {
                    this.animator.play('walk');
                }
                // Adjust walk speed based on movement speed
                this.animator.setSpeed(Math.max(0.8, Math.min(1.5, Math.abs(velocityX) / 3)));
            } else {
                this.animator.play('idle');
                this.animator.setSpeed(1);
            }
        }

        // Track state for next frame
        this.wasGrounded = player.isGrounded;
        this.wasAttacking = player.attacking;

        // Update animator
        this.animator.update(deltaTime);
    }

    draw(ctx: CanvasRenderingContext2D, player: RenderablePlayer): void {
        // Flash when invincible
        if (player.invincible && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
            return;
        }

        const x = Math.floor(player.x);
        const y = Math.floor(player.y);

        // Get current animation pose
        const pose = this.animator.getCurrentPose();

        // Apply pose body offset (y includes bounce from animation)
        const poseY = y + (pose.body.y || 0);
        const poseX = x + (pose.body.x || 0);

        if (this.playerType === 'knight') {
            this.drawKnight(ctx, poseX, poseY, player, pose);
        } else {
            this.drawRobot(ctx, poseX, poseY, player, pose);
        }
    }

    drawKnight(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        player: RenderablePlayer,
        pose: InterpolatedPose
    ): void {
        const equipment = player.stats?.equipment || player.equipment;
        const swordColor = equipment?.sword.color || '#95a5a6';
        const armorColor = equipment?.armor.color || '#95a5a6';
        const helmetColor = equipment?.helmet.color || '#95a5a6';

        ctx.save();

        // Apply body scale from pose
        const centerX = x + 20;
        const centerY = y + 30;
        ctx.translate(centerX, centerY);
        ctx.scale(pose.body.scaleX, pose.body.scaleY);
        ctx.rotate(pose.body.rotation);
        ctx.translate(-centerX, -centerY);

        // === HEAD (with pose offset) ===
        ctx.save();
        const headX = x + 20;
        const headY = y + 10 + (pose.head.y || 0);
        ctx.translate(headX, headY);
        ctx.rotate(pose.head.rotation);
        ctx.translate(-headX, -headY);

        // Helmet
        ctx.fillStyle = helmetColor;
        ctx.fillRect(x + 8, y + (pose.head.y || 0), 24, 20);
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 10, y + 8 + (pose.head.y || 0), 20, 8);

        // Plume
        ctx.fillStyle = this.colors.accent;
        ctx.fillRect(x + 14, y - 10 + (pose.head.y || 0), 12, 12);
        ctx.fillRect(x + 12, y - 6 + (pose.head.y || 0), 16, 4);
        ctx.restore();

        // === BODY ===
        ctx.fillStyle = armorColor;
        ctx.fillRect(x + 5, y + 20, 30, 25);

        // Armor detail
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 17, y + 22, 6, 20);

        // === BACK LEG (draw first, behind body) ===
        ctx.save();
        const backLegX = x + 27;
        const backLegY = y + 45;
        ctx.translate(backLegX, backLegY);
        ctx.rotate(pose.legBack.rotation);
        ctx.fillStyle = '#555'; // Slightly darker for back leg
        ctx.fillRect(-5, 0, 10, 15);
        ctx.restore();

        // === FRONT LEG ===
        ctx.save();
        const frontLegX = x + 13;
        const frontLegY = y + 45;
        ctx.translate(frontLegX, frontLegY);
        ctx.rotate(pose.legFront.rotation);
        ctx.fillStyle = '#666';
        ctx.fillRect(-5, 0, 10, 15);
        ctx.restore();

        // === BACK ARM ===
        ctx.save();
        const backArmX = player.facing === 1 ? x + 8 : x + 32;
        const backArmY = y + 25;
        ctx.translate(backArmX, backArmY);
        ctx.rotate(pose.armBack.rotation * player.facing);
        ctx.fillStyle = '#777';
        ctx.fillRect(-4, 0, 8, 14);
        ctx.restore();

        // === SWORD AND FRONT ARM ===
        const weaponRotation = pose.weapon.rotation;
        const weaponX = pose.weapon.x * player.facing;
        const weaponY = pose.weapon.y;

        ctx.fillStyle = swordColor;
        if (player.facing === 1) {
            ctx.save();
            ctx.translate(x + 35 + weaponX, y + 25 + weaponY);
            ctx.rotate(weaponRotation);

            // Sword blade
            ctx.fillStyle = swordColor;
            ctx.fillRect(0, -3, 45, 6);

            // Sword guard and hilt
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-5, -6, 10, 12);
            ctx.restore();

            // Front arm
            ctx.save();
            ctx.translate(x + 32, y + 25);
            ctx.rotate(pose.armFront.rotation);
            ctx.fillStyle = armorColor;
            ctx.fillRect(-4, -4, 10, 16);
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(x + 5 - weaponX, y + 25 + weaponY);
            ctx.rotate(-weaponRotation);

            // Sword blade
            ctx.fillStyle = swordColor;
            ctx.fillRect(-45, -3, 45, 6);

            // Sword guard and hilt
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-5, -6, 10, 12);
            ctx.restore();

            // Front arm
            ctx.save();
            ctx.translate(x + 8, y + 25);
            ctx.rotate(-pose.armFront.rotation);
            ctx.fillStyle = armorColor;
            ctx.fillRect(-6, -4, 10, 16);
            ctx.restore();
        }

        ctx.restore();
    }

    drawRobot(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        player: RenderablePlayer,
        pose: InterpolatedPose
    ): void {
        const equipment = player.stats?.equipment || player.equipment;
        const primaryColor = equipment?.armor.color || '#3498db';
        const accentColor = this.colors.accent;

        ctx.save();

        // Apply body scale from pose
        const centerX = x + 17;
        const centerY = y + 30;
        ctx.translate(centerX, centerY);
        ctx.scale(pose.body.scaleX, pose.body.scaleY);
        ctx.rotate(pose.body.rotation);
        ctx.translate(-centerX, -centerY);

        // === ANTENNA ===
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 15, y - 10 + (pose.head.y || 0), 4, 10);

        // Antenna light (pulses during attack)
        const isAttacking = this.animator.isPlaying('attack');
        const attackProgress = isAttacking ? this.animator.getProgress() : 0;
        const lightIntensity = isAttacking ? Math.sin(attackProgress * Math.PI * 4) * 0.5 + 0.5 : 0;
        ctx.fillStyle = isAttacking
            ? `rgb(255, ${Math.floor(255 * lightIntensity)}, 0)`
            : '#f00';
        ctx.fillRect(x + 13, y - 14 + (pose.head.y || 0), 8, 6);

        // === HEAD (with pose offset) ===
        ctx.save();
        const headX = x + 17;
        const headY = y + 10 + (pose.head.y || 0);
        ctx.translate(headX, headY);
        ctx.rotate(pose.head.rotation);
        ctx.translate(-headX, -headY);

        ctx.fillStyle = primaryColor;
        ctx.fillRect(x + 5, y + (pose.head.y || 0), 25, 20);

        // Eyes
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 9, y + 6 + (pose.head.y || 0), 6, 6);
        ctx.fillRect(x + 20, y + 6 + (pose.head.y || 0), 6, 6);

        // Eye glow
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 10, y + 7 + (pose.head.y || 0), 2, 2);
        ctx.fillRect(x + 21, y + 7 + (pose.head.y || 0), 2, 2);
        ctx.restore();

        // === BODY ===
        ctx.fillStyle = this.colors.secondary;
        ctx.fillRect(x + 3, y + 20, 29, 24);

        // Chest panel
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 8, y + 24, 19, 16);

        // Chest lights (pulse during idle, flash during attack)
        const idlePulse = this.animator.isPlaying('idle')
            ? Math.sin(this.animator.getProgress() * Math.PI * 2) * 0.3 + 0.7
            : 1;
        const lightColor = isAttacking
            ? '#f00'
            : `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, ${idlePulse})`;

        ctx.fillStyle = lightColor;
        ctx.fillRect(x + 11, y + 27, 5, 5);
        ctx.fillRect(x + 19, y + 27, 5, 5);
        ctx.fillRect(x + 15, y + 34, 5, 5);

        // === BACK LEG ===
        ctx.save();
        const backLegX = x + 24;
        const backLegY = y + 44;
        ctx.translate(backLegX, backLegY);
        ctx.rotate(pose.legBack.rotation);
        ctx.fillStyle = '#154360';
        ctx.fillRect(-5, 0, 10, 16);
        ctx.restore();

        // === FRONT LEG ===
        ctx.save();
        const frontLegX = x + 11;
        const frontLegY = y + 44;
        ctx.translate(frontLegX, frontLegY);
        ctx.rotate(pose.legFront.rotation);
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(-5, 0, 10, 16);
        ctx.restore();

        // === ARMS/WEAPON (Laser arm) ===
        const weaponX = pose.weapon.x * player.facing;
        const armLength = pose.armFront.length || 1;

        ctx.fillStyle = '#555';
        if (player.facing === 1) {
            // Arm base
            ctx.save();
            ctx.translate(x + 32, y + 27);
            ctx.rotate(pose.armFront.rotation);
            ctx.fillRect(0, -5, 8 + (armLength - 1) * 20, 10);

            // Laser extension during attack
            if (isAttacking && attackProgress > 0.3 && attackProgress < 0.8) {
                const laserLength = 20 + weaponX;
                ctx.fillStyle = '#ff0';
                ctx.fillRect(8 + (armLength - 1) * 20, -3, laserLength, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(8 + (armLength - 1) * 20, -1, laserLength, 2);
            }
            ctx.restore();
        } else {
            // Arm base (facing left)
            ctx.save();
            ctx.translate(x + 3, y + 27);
            ctx.rotate(-pose.armFront.rotation);
            ctx.fillRect(-8 - (armLength - 1) * 20, -5, 8 + (armLength - 1) * 20, 10);

            // Laser extension during attack
            if (isAttacking && attackProgress > 0.3 && attackProgress < 0.8) {
                const laserLength = 20 - weaponX;
                ctx.fillStyle = '#ff0';
                ctx.fillRect(-8 - (armLength - 1) * 20 - laserLength, -3, laserLength, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(-8 - (armLength - 1) * 20 - laserLength, -1, laserLength, 2);
            }
            ctx.restore();
        }

        // Back arm (non-weapon arm)
        ctx.fillStyle = '#555';
        if (player.facing === 1) {
            ctx.save();
            ctx.translate(x + 3, y + 27);
            ctx.rotate(pose.armBack.rotation);
            ctx.fillRect(-8, -4, 8, 14);
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(x + 32, y + 27);
            ctx.rotate(-pose.armBack.rotation);
            ctx.fillRect(0, -4, 8, 14);
            ctx.restore();
        }

        ctx.restore();
    }

    /**
     * Reset the renderer state (useful when player respawns)
     */
    reset(): void {
        this.animator.reset();
        this.wasGrounded = true;
        this.wasAttacking = false;
        this.lastHealth = 100;
    }

    /**
     * Force play a specific animation
     */
    playAnimation(name: string): void {
        this.animator.play(name, true);
    }

    /**
     * Check if a specific animation is playing
     */
    isAnimationPlaying(name: string): boolean {
        return this.animator.isPlaying(name);
    }
}
