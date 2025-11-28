/**
 * Animation System Types
 * Keyframe-based animation system for character movements
 */

/** Transform data for a body part at a specific keyframe */
export interface BodyPartTransform {
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
}

/** Transform data for limbs (primarily rotation-based) */
export interface LimbTransform {
    rotation?: number;
    length?: number;
}

/** Transform data for weapons */
export interface WeaponTransform {
    rotation?: number;
    x?: number;
    y?: number;
}

/** A single keyframe in an animation sequence */
export interface Keyframe {
    /** Normalized time within animation (0-1) */
    time: number;
    /** Body/torso transform offsets relative to default pose */
    body?: BodyPartTransform;
    /** Head transform offsets */
    head?: BodyPartTransform;
    /** Front arm transform (sword arm for knight, laser arm for robot) */
    armFront?: LimbTransform;
    /** Back arm transform */
    armBack?: LimbTransform;
    /** Front leg transform */
    legFront?: LimbTransform;
    /** Back leg transform */
    legBack?: LimbTransform;
    /** Weapon transform (sword for knight, laser for robot) */
    weapon?: WeaponTransform;
    /** Optional easing function for this keyframe transition */
    easing?: EasingType;
}

/** Supported easing function types */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';

/** Complete animation definition */
export interface Animation {
    /** Animation identifier name */
    name: string;
    /** Duration in frames (at 60fps) */
    duration: number;
    /** Whether animation loops or plays once */
    loop: boolean;
    /** Keyframes defining the animation */
    keyframes: Keyframe[];
    /** Callback when non-looping animation ends */
    onComplete?: () => void;
    /** Priority level for animation blending (higher = takes precedence) */
    priority?: number;
}

/** Current animation playback state */
export interface AnimationState {
    /** Currently playing animation name */
    current: string;
    /** Current frame within the animation */
    frame: number;
    /** Speed multiplier (1.0 = normal speed) */
    speed: number;
    /** Whether this animation was force-played */
    forced: boolean;
}

/** Interpolated pose data used by renderer */
export interface InterpolatedPose {
    body: Required<BodyPartTransform>;
    head: Required<BodyPartTransform>;
    armFront: Required<LimbTransform>;
    armBack: Required<LimbTransform>;
    legFront: Required<LimbTransform>;
    legBack: Required<LimbTransform>;
    weapon: Required<WeaponTransform>;
}

/** Default pose with all transforms at neutral */
export const DEFAULT_POSE: InterpolatedPose = {
    body: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    head: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    armFront: { rotation: 0, length: 1 },
    armBack: { rotation: 0, length: 1 },
    legFront: { rotation: 0, length: 1 },
    legBack: { rotation: 0, length: 1 },
    weapon: { rotation: 0, x: 0, y: 0 },
};
