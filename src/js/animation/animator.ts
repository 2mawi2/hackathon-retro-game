/**
 * Animator Class
 * Handles animation state management and keyframe interpolation
 */

import {
    Animation,
    AnimationState,
    Keyframe,
    InterpolatedPose,
    DEFAULT_POSE,
    EasingType,
    BodyPartTransform,
    LimbTransform,
    WeaponTransform,
} from './types';

/**
 * Animator manages playback of keyframe-based animations
 * with smooth interpolation between poses
 */
export class Animator {
    /** Available animations for this animator */
    readonly animations: Record<string, Animation>;

    /** Current animation state */
    state: AnimationState;

    /** Animation queued to play when current completes */
    private queuedAnimation: string | null = null;

    /** Callback for when animations complete */
    private onCompleteCallback: (() => void) | null = null;

    /** Track if we just landed (for landing animation) */
    private wasInAir: boolean = false;

    constructor(animations: Record<string, Animation>) {
        this.animations = animations;
        this.state = {
            current: 'idle',
            frame: 0,
            speed: 1,
            forced: false,
        };
    }

    /**
     * Start playing an animation
     * @param animationName - Name of animation to play
     * @param force - If true, immediately switch even if current is non-looping
     */
    play(animationName: string, force: boolean = false): void {
        // Don't restart if already playing this animation (unless forced)
        if (this.state.current === animationName && !force) {
            return;
        }

        const newAnim = this.animations[animationName];
        const currentAnim = this.animations[this.state.current];

        if (!newAnim) {
            console.warn(`Animation '${animationName}' not found`);
            return;
        }

        // Check priority - higher priority animations can interrupt lower ones
        const newPriority = newAnim.priority ?? 0;
        const currentPriority = currentAnim?.priority ?? 0;

        // If current animation is non-looping and higher/equal priority, queue the new one
        if (!force && currentAnim && !currentAnim.loop && currentPriority >= newPriority) {
            // Only queue if not already queued
            if (this.queuedAnimation !== animationName) {
                this.queuedAnimation = animationName;
            }
            return;
        }

        // Switch to new animation
        this.state.current = animationName;
        this.state.frame = 0;
        this.state.forced = force;
        this.queuedAnimation = null;
    }

    /**
     * Queue an animation to play after the current one finishes
     * @param animationName - Name of animation to queue
     */
    queue(animationName: string): void {
        if (this.animations[animationName]) {
            this.queuedAnimation = animationName;
        }
    }

    /**
     * Update animation state by one frame
     * @param deltaTime - Time multiplier (1 = normal speed)
     */
    update(deltaTime: number = 1): void {
        const animation = this.animations[this.state.current];
        if (!animation) return;

        // Advance frame
        this.state.frame += this.state.speed * deltaTime;

        // Check if animation completed
        if (this.state.frame >= animation.duration) {
            if (animation.loop) {
                // Loop back to start
                this.state.frame = this.state.frame % animation.duration;
            } else {
                // Animation finished
                this.state.frame = animation.duration - 1;

                // Fire completion callback
                if (animation.onComplete) {
                    animation.onComplete();
                }
                if (this.onCompleteCallback) {
                    this.onCompleteCallback();
                    this.onCompleteCallback = null;
                }

                // Play queued animation or return to idle
                if (this.queuedAnimation) {
                    const queued = this.queuedAnimation;
                    this.queuedAnimation = null;
                    this.play(queued, true);
                } else if (this.state.current !== 'idle') {
                    this.play('idle', true);
                }
            }
        }
    }

    /**
     * Get the interpolated pose for the current frame
     * @returns Blended pose data for renderer
     */
    getCurrentPose(): InterpolatedPose {
        const animation = this.animations[this.state.current];
        if (!animation || animation.keyframes.length === 0) {
            return { ...DEFAULT_POSE };
        }

        // Calculate normalized time (0-1)
        const normalizedTime = this.state.frame / animation.duration;

        // Find surrounding keyframes
        const keyframes = animation.keyframes;
        let k1: Keyframe = keyframes[0];
        let k2: Keyframe = keyframes[0];
        let localT = 0;

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (normalizedTime >= keyframes[i].time && normalizedTime <= keyframes[i + 1].time) {
                k1 = keyframes[i];
                k2 = keyframes[i + 1];
                // Calculate local t between these two keyframes
                const timeDiff = k2.time - k1.time;
                localT = timeDiff > 0 ? (normalizedTime - k1.time) / timeDiff : 0;
                break;
            }
        }

        // Handle time past last keyframe
        if (normalizedTime >= keyframes[keyframes.length - 1].time) {
            k1 = keyframes[keyframes.length - 1];
            k2 = keyframes[keyframes.length - 1];
            localT = 1;
        }

        // Apply easing to localT
        const easedT = this.applyEasing(localT, k2.easing || 'linear');

        return this.interpolateKeyframes(k1, k2, easedT);
    }

    /**
     * Check if a specific animation is currently playing
     * @param animationName - Name of animation to check
     */
    isPlaying(animationName: string): boolean {
        return this.state.current === animationName;
    }

    /**
     * Check if the current animation has completed (for non-looping animations)
     */
    isComplete(): boolean {
        const animation = this.animations[this.state.current];
        if (!animation) return true;
        return !animation.loop && this.state.frame >= animation.duration - 1;
    }

    /**
     * Get the progress of current animation (0-1)
     */
    getProgress(): number {
        const animation = this.animations[this.state.current];
        if (!animation) return 0;
        return this.state.frame / animation.duration;
    }

    /**
     * Set a callback for when the current animation completes
     * @param callback - Function to call on completion
     */
    onComplete(callback: () => void): void {
        this.onCompleteCallback = callback;
    }

    /**
     * Reset animator to idle state
     */
    reset(): void {
        this.state = {
            current: 'idle',
            frame: 0,
            speed: 1,
            forced: false,
        };
        this.queuedAnimation = null;
        this.onCompleteCallback = null;
    }

    /**
     * Set animation playback speed
     * @param speed - Speed multiplier (1 = normal, 2 = double speed, 0.5 = half speed)
     */
    setSpeed(speed: number): void {
        this.state.speed = Math.max(0, speed);
    }

    /**
     * Track landing state for landing animation trigger
     * @param isGrounded - Current grounded state
     */
    updateGroundState(isGrounded: boolean): void {
        if (this.wasInAir && isGrounded) {
            // Just landed - play landing animation
            const currentAnim = this.animations[this.state.current];
            // Only play land if we're not in a higher priority animation
            if (!currentAnim || (currentAnim.priority ?? 0) < (this.animations['land']?.priority ?? 0) + 1) {
                this.play('land', true);
            }
        }
        this.wasInAir = !isGrounded;
    }

    /**
     * Linear interpolation helper
     */
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * Apply easing function to interpolation factor
     */
    private applyEasing(t: number, easing: EasingType): number {
        switch (easing) {
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'bounce':
                if (t < 0.5) {
                    return 8 * t * t * t * t;
                } else {
                    return 1 - Math.pow(-2 * t + 2, 4) / 2;
                }
            case 'linear':
            default:
                return t;
        }
    }

    /**
     * Interpolate between two keyframes
     */
    private interpolateKeyframes(k1: Keyframe, k2: Keyframe, t: number): InterpolatedPose {
        return {
            body: this.interpolateBodyPart(k1.body, k2.body, t),
            head: this.interpolateBodyPart(k1.head, k2.head, t),
            armFront: this.interpolateLimb(k1.armFront, k2.armFront, t),
            armBack: this.interpolateLimb(k1.armBack, k2.armBack, t),
            legFront: this.interpolateLimb(k1.legFront, k2.legFront, t),
            legBack: this.interpolateLimb(k1.legBack, k2.legBack, t),
            weapon: this.interpolateWeapon(k1.weapon, k2.weapon, t),
        };
    }

    /**
     * Interpolate body part transform
     */
    private interpolateBodyPart(
        p1: BodyPartTransform | undefined,
        p2: BodyPartTransform | undefined,
        t: number
    ): Required<BodyPartTransform> {
        const default1 = DEFAULT_POSE.body;
        const default2 = DEFAULT_POSE.body;

        return {
            x: this.lerp(p1?.x ?? default1.x, p2?.x ?? default2.x, t),
            y: this.lerp(p1?.y ?? default1.y, p2?.y ?? default2.y, t),
            scaleX: this.lerp(p1?.scaleX ?? default1.scaleX, p2?.scaleX ?? default2.scaleX, t),
            scaleY: this.lerp(p1?.scaleY ?? default1.scaleY, p2?.scaleY ?? default2.scaleY, t),
            rotation: this.lerp(p1?.rotation ?? default1.rotation, p2?.rotation ?? default2.rotation, t),
        };
    }

    /**
     * Interpolate limb transform
     */
    private interpolateLimb(
        l1: LimbTransform | undefined,
        l2: LimbTransform | undefined,
        t: number
    ): Required<LimbTransform> {
        const default1 = DEFAULT_POSE.armFront;
        const default2 = DEFAULT_POSE.armFront;

        return {
            rotation: this.lerp(l1?.rotation ?? default1.rotation, l2?.rotation ?? default2.rotation, t),
            length: this.lerp(l1?.length ?? default1.length, l2?.length ?? default2.length, t),
        };
    }

    /**
     * Interpolate weapon transform
     */
    private interpolateWeapon(
        w1: WeaponTransform | undefined,
        w2: WeaponTransform | undefined,
        t: number
    ): Required<WeaponTransform> {
        const default1 = DEFAULT_POSE.weapon;
        const default2 = DEFAULT_POSE.weapon;

        return {
            rotation: this.lerp(w1?.rotation ?? default1.rotation, w2?.rotation ?? default2.rotation, t),
            x: this.lerp(w1?.x ?? default1.x, w2?.x ?? default2.x, t),
            y: this.lerp(w1?.y ?? default1.y, w2?.y ?? default2.y, t),
        };
    }
}
