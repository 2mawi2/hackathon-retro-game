/**
 * Animation Definitions
 * Keyframe-based animations for knight and robot characters
 */

import { Animation } from './types';

/**
 * Knight character animations
 * Organic, fluid movements with sword combat
 */
export const knightAnimations: Record<string, Animation> = {
    idle: {
        name: 'idle',
        duration: 60,
        loop: true,
        priority: 0,
        keyframes: [
            {
                time: 0,
                body: { y: 0, scaleY: 1 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, y: 0 },
            },
            {
                time: 0.5,
                body: { y: -2, scaleY: 1.02 },
                head: { y: -1, rotation: 0 },
                armFront: { rotation: -0.05 },
                armBack: { rotation: 0.05 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0.1, y: -1 },
                easing: 'easeInOut',
            },
            {
                time: 1,
                body: { y: 0, scaleY: 1 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, y: 0 },
                easing: 'easeInOut',
            },
        ],
    },

    walk: {
        name: 'walk',
        duration: 30,
        loop: true,
        priority: 1,
        keyframes: [
            // Contact (right foot forward)
            {
                time: 0,
                body: { y: 0, scaleY: 1 },
                head: { y: 0 },
                armFront: { rotation: -0.4 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: 0.5 },
                legBack: { rotation: -0.4 },
                weapon: { rotation: -0.2 },
            },
            // Down (passing through)
            {
                time: 0.25,
                body: { y: 2, scaleY: 0.98 },
                head: { y: 1 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'easeOut',
            },
            // Contact (left foot forward)
            {
                time: 0.5,
                body: { y: 0, scaleY: 1 },
                head: { y: 0 },
                armFront: { rotation: 0.4 },
                armBack: { rotation: -0.4 },
                legFront: { rotation: -0.4 },
                legBack: { rotation: 0.5 },
                weapon: { rotation: 0.2 },
                easing: 'easeInOut',
            },
            // Down (passing through)
            {
                time: 0.75,
                body: { y: 2, scaleY: 0.98 },
                head: { y: 1 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'easeOut',
            },
            // Back to start
            {
                time: 1,
                body: { y: 0, scaleY: 1 },
                head: { y: 0 },
                armFront: { rotation: -0.4 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: 0.5 },
                legBack: { rotation: -0.4 },
                weapon: { rotation: -0.2 },
                easing: 'easeInOut',
            },
        ],
    },

    jump: {
        name: 'jump',
        duration: 40,
        loop: false,
        priority: 2,
        keyframes: [
            // Anticipation (crouch)
            {
                time: 0,
                body: { y: 4, scaleY: 0.9, scaleX: 1.05 },
                head: { y: 2 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: 0.4 },
                weapon: { rotation: 0.5 },
            },
            // Launch (stretch up)
            {
                time: 0.15,
                body: { y: -4, scaleY: 1.15, scaleX: 0.95 },
                head: { y: -3 },
                armFront: { rotation: -0.8 },
                armBack: { rotation: -0.6 },
                legFront: { rotation: -0.2 },
                legBack: { rotation: -0.3 },
                weapon: { rotation: -0.8, y: -4 },
                easing: 'easeOut',
            },
            // Apex (hang time - relaxed)
            {
                time: 0.4,
                body: { y: -2, scaleY: 1.05, scaleX: 1 },
                head: { y: -2, rotation: 0.05 },
                armFront: { rotation: -0.3 },
                armBack: { rotation: 0.2 },
                legFront: { rotation: 0.1 },
                legBack: { rotation: -0.2 },
                weapon: { rotation: -0.3, y: -2 },
                easing: 'easeInOut',
            },
            // Extended apex (more hang time)
            {
                time: 0.6,
                body: { y: -1, scaleY: 1.02, scaleX: 1 },
                head: { y: -1, rotation: 0.1 },
                armFront: { rotation: 0.1 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.2 },
                legBack: { rotation: -0.1 },
                weapon: { rotation: 0.1, y: -1 },
                easing: 'easeInOut',
            },
            // Falling (arms out for balance)
            {
                time: 0.85,
                body: { y: 0, scaleY: 1, scaleX: 1 },
                head: { y: 0, rotation: 0.15 },
                armFront: { rotation: 0.5 },
                armBack: { rotation: 0.6 },
                legFront: { rotation: -0.3 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.4, y: 0 },
                easing: 'easeIn',
            },
            // Landing preparation
            {
                time: 1,
                body: { y: 2, scaleY: 0.95, scaleX: 1.02 },
                head: { y: 1 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: 0.3 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 0.3 },
                easing: 'easeIn',
            },
        ],
    },

    doubleJump: {
        name: 'doubleJump',
        duration: 20,
        loop: false,
        priority: 3,
        keyframes: [
            // Start spin
            {
                time: 0,
                body: { y: 0, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: -0.5 },
                armBack: { rotation: 0.5 },
                legFront: { rotation: 0.3 },
                legBack: { rotation: -0.3 },
                weapon: { rotation: -1.5, x: -5 },
            },
            // Quarter flip
            {
                time: 0.25,
                body: { y: -3, scaleY: 0.9, scaleX: 1.1, rotation: 0.5 },
                head: { y: -2, rotation: 0.3 },
                armFront: { rotation: -1.2 },
                armBack: { rotation: 1.0 },
                legFront: { rotation: 0.8 },
                legBack: { rotation: -0.6 },
                weapon: { rotation: -0.8, x: 0, y: -3 },
                easing: 'easeOut',
            },
            // Half flip (peak)
            {
                time: 0.5,
                body: { y: -4, scaleY: 0.85, scaleX: 1.15, rotation: 1.0 },
                head: { y: -3, rotation: 0.5 },
                armFront: { rotation: -1.8 },
                armBack: { rotation: 1.5 },
                legFront: { rotation: 1.2 },
                legBack: { rotation: -1.0 },
                weapon: { rotation: 0, x: 5, y: -4 },
                easing: 'easeInOut',
            },
            // Three-quarter flip
            {
                time: 0.75,
                body: { y: -2, scaleY: 0.95, scaleX: 1.05, rotation: 0.5 },
                head: { y: -1, rotation: 0.2 },
                armFront: { rotation: -0.8 },
                armBack: { rotation: 0.6 },
                legFront: { rotation: 0.5 },
                legBack: { rotation: -0.4 },
                weapon: { rotation: 0.5, x: 2, y: -2 },
                easing: 'easeIn',
            },
            // Land ready
            {
                time: 1,
                body: { y: 0, scaleY: 1, scaleX: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0.2 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.2 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.3, x: 0, y: 0 },
                easing: 'easeOut',
            },
        ],
    },

    attack: {
        name: 'attack',
        duration: 25,
        loop: false,
        priority: 4,
        keyframes: [
            // Wind up (pull back)
            {
                time: 0,
                body: { y: 0, scaleX: 0.95, rotation: -0.1 },
                head: { rotation: -0.1 },
                armFront: { rotation: -1.5 },
                armBack: { rotation: 0.2 },
                legFront: { rotation: -0.2 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: -2.2, x: -8, y: -5 },
            },
            // Peak wind up
            {
                time: 0.32,
                body: { y: -1, scaleX: 0.92, rotation: -0.15 },
                head: { rotation: -0.15 },
                armFront: { rotation: -2.0 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: -0.3 },
                legBack: { rotation: 0.4 },
                weapon: { rotation: -2.8, x: -12, y: -8 },
                easing: 'easeOut',
            },
            // Swing (fast - small time window)
            {
                time: 0.48,
                body: { y: -2, scaleX: 1.1, rotation: 0.2 },
                head: { rotation: 0.2 },
                armFront: { rotation: 0.8 },
                armBack: { rotation: -0.3 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: -0.2 },
                weapon: { rotation: 1.2, x: 8, y: 0 },
                easing: 'linear',
            },
            // Follow through
            {
                time: 0.64,
                body: { y: 0, scaleX: 1.05, rotation: 0.15 },
                head: { rotation: 0.15 },
                armFront: { rotation: 1.5 },
                armBack: { rotation: -0.4 },
                legFront: { rotation: 0.3 },
                legBack: { rotation: -0.3 },
                weapon: { rotation: 2.0, x: 12, y: 3 },
                easing: 'easeOut',
            },
            // Recovery
            {
                time: 1,
                body: { y: 0, scaleX: 1, rotation: 0 },
                head: { rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0, y: 0 },
                easing: 'easeInOut',
            },
        ],
    },

    hurt: {
        name: 'hurt',
        duration: 15,
        loop: false,
        priority: 5,
        keyframes: [
            // Initial hit (recoil back)
            {
                time: 0,
                body: { y: 0, scaleX: 1.1, scaleY: 0.9, rotation: -0.2 },
                head: { y: 2, rotation: -0.3 },
                armFront: { rotation: 0.5 },
                armBack: { rotation: 0.8 },
                legFront: { rotation: -0.2 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 0.8, x: 3 },
            },
            // Peak recoil
            {
                time: 0.3,
                body: { y: 2, scaleX: 1.15, scaleY: 0.85, rotation: -0.25 },
                head: { y: 4, rotation: -0.4 },
                armFront: { rotation: 0.8 },
                armBack: { rotation: 1.2 },
                legFront: { rotation: -0.3 },
                legBack: { rotation: 0.4 },
                weapon: { rotation: 1.2, x: 5 },
                easing: 'easeOut',
            },
            // Recovery
            {
                time: 0.7,
                body: { y: 1, scaleX: 1.05, scaleY: 0.95, rotation: -0.1 },
                head: { y: 2, rotation: -0.15 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: 0.5 },
                legFront: { rotation: -0.1 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.4, x: 2 },
                easing: 'easeInOut',
            },
            // Return to normal
            {
                time: 1,
                body: { y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0 },
                easing: 'easeOut',
            },
        ],
    },

    death: {
        name: 'death',
        duration: 45,
        loop: false,
        priority: 10,
        keyframes: [
            // Initial shock
            {
                time: 0,
                body: { y: 0, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0, y: 0 },
            },
            // Stagger back
            {
                time: 0.15,
                body: { y: 0, scaleY: 0.95, rotation: -0.3 },
                head: { y: 2, rotation: -0.4 },
                armFront: { rotation: 0.6 },
                armBack: { rotation: 1.0 },
                legFront: { rotation: -0.2 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 1.5, x: 3, y: 0 },
                easing: 'easeOut',
            },
            // Knees buckle
            {
                time: 0.4,
                body: { y: 10, scaleY: 0.8, rotation: -0.4 },
                head: { y: 5, rotation: -0.5 },
                armFront: { rotation: 0.8 },
                armBack: { rotation: 1.3 },
                legFront: { rotation: 0.8 },
                legBack: { rotation: 0.6 },
                weapon: { rotation: 2.5, x: 8, y: 5 },
                easing: 'easeIn',
            },
            // Collapse forward
            {
                time: 0.7,
                body: { y: 25, scaleY: 0.6, scaleX: 1.2, rotation: -0.8 },
                head: { y: 15, rotation: -0.8 },
                armFront: { rotation: 1.2 },
                armBack: { rotation: 1.8 },
                legFront: { rotation: 1.0 },
                legBack: { rotation: 0.8 },
                weapon: { rotation: 3.5, x: 15, y: 15 },
                easing: 'easeIn',
            },
            // Final rest
            {
                time: 1,
                body: { y: 35, scaleY: 0.4, scaleX: 1.4, rotation: -1.2 },
                head: { y: 20, rotation: -1.0 },
                armFront: { rotation: 1.5 },
                armBack: { rotation: 2.0 },
                legFront: { rotation: 1.2 },
                legBack: { rotation: 1.0 },
                weapon: { rotation: 4.0, x: 20, y: 25 },
                easing: 'easeOut',
            },
        ],
    },

    land: {
        name: 'land',
        duration: 12,
        loop: false,
        priority: 2,
        keyframes: [
            // Impact squash
            {
                time: 0,
                body: { y: 6, scaleY: 0.8, scaleX: 1.15 },
                head: { y: 3 },
                armFront: { rotation: 0.4 },
                armBack: { rotation: 0.5 },
                legFront: { rotation: 0.5 },
                legBack: { rotation: 0.5 },
                weapon: { rotation: 0.5 },
            },
            // Absorb
            {
                time: 0.4,
                body: { y: 3, scaleY: 0.9, scaleX: 1.08 },
                head: { y: 1.5 },
                armFront: { rotation: 0.2 },
                armBack: { rotation: 0.25 },
                legFront: { rotation: 0.3 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 0.25 },
                easing: 'easeOut',
            },
            // Recover
            {
                time: 1,
                body: { y: 0, scaleY: 1, scaleX: 1 },
                head: { y: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'easeOut',
            },
        ],
    },
};

/**
 * Robot character animations
 * Mechanical, stiff movements with tech effects
 */
export const robotAnimations: Record<string, Animation> = {
    idle: {
        name: 'idle',
        duration: 90,
        loop: true,
        priority: 0,
        keyframes: [
            {
                time: 0,
                body: { y: 0, scaleY: 1 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
            },
            // Subtle mechanical hum
            {
                time: 0.33,
                body: { y: -1, scaleY: 1.01 },
                head: { y: 0, rotation: 0.02 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0.05 },
                easing: 'linear',
            },
            {
                time: 0.66,
                body: { y: -1, scaleY: 1.01 },
                head: { y: 0, rotation: -0.02 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: -0.05 },
                easing: 'linear',
            },
            {
                time: 1,
                body: { y: 0, scaleY: 1 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'linear',
            },
        ],
    },

    walk: {
        name: 'walk',
        duration: 24,
        loop: true,
        priority: 1,
        keyframes: [
            // Mechanical step - more rigid than knight
            {
                time: 0,
                body: { y: 0 },
                head: { y: 0 },
                armFront: { rotation: -0.3 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: -0.3 },
                weapon: { rotation: -0.1 },
            },
            {
                time: 0.25,
                body: { y: 1 },
                head: { y: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'linear',
            },
            {
                time: 0.5,
                body: { y: 0 },
                head: { y: 0 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: -0.3 },
                legFront: { rotation: -0.3 },
                legBack: { rotation: 0.4 },
                weapon: { rotation: 0.1 },
                easing: 'linear',
            },
            {
                time: 0.75,
                body: { y: 1 },
                head: { y: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'linear',
            },
            {
                time: 1,
                body: { y: 0 },
                head: { y: 0 },
                armFront: { rotation: -0.3 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: -0.3 },
                weapon: { rotation: -0.1 },
                easing: 'linear',
            },
        ],
    },

    jump: {
        name: 'jump',
        duration: 35,
        loop: false,
        priority: 2,
        keyframes: [
            // Mechanical crouch
            {
                time: 0,
                body: { y: 3, scaleY: 0.92 },
                head: { y: 1 },
                armFront: { rotation: 0.2 },
                armBack: { rotation: 0.2 },
                legFront: { rotation: 0.3 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 0.3 },
            },
            // Jet boost up
            {
                time: 0.15,
                body: { y: -3, scaleY: 1.08 },
                head: { y: -2 },
                armFront: { rotation: -0.5 },
                armBack: { rotation: -0.4 },
                legFront: { rotation: -0.1 },
                legBack: { rotation: -0.2 },
                weapon: { rotation: -0.5, y: -3 },
                easing: 'linear',
            },
            // Hover
            {
                time: 0.5,
                body: { y: -2, scaleY: 1.02 },
                head: { y: -1 },
                armFront: { rotation: -0.2 },
                armBack: { rotation: 0.1 },
                legFront: { rotation: 0 },
                legBack: { rotation: -0.1 },
                weapon: { rotation: -0.2, y: -2 },
                easing: 'linear',
            },
            // Descend
            {
                time: 0.85,
                body: { y: 0, scaleY: 1 },
                head: { y: 0 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: -0.2 },
                legBack: { rotation: 0.1 },
                weapon: { rotation: 0.2, y: 0 },
                easing: 'linear',
            },
            // Prepare landing
            {
                time: 1,
                body: { y: 2, scaleY: 0.95 },
                head: { y: 1 },
                armFront: { rotation: 0.2 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.2 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.2 },
                easing: 'linear',
            },
        ],
    },

    doubleJump: {
        name: 'doubleJump',
        duration: 18,
        loop: false,
        priority: 3,
        keyframes: [
            // Jet charge
            {
                time: 0,
                body: { y: 0, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
            },
            // Horizontal spin start
            {
                time: 0.2,
                body: { y: -2, scaleY: 0.95, scaleX: 1.05, rotation: 0.8 },
                head: { y: -1, rotation: 0.4 },
                armFront: { rotation: -1.0 },
                armBack: { rotation: 0.8 },
                legFront: { rotation: 0.5 },
                legBack: { rotation: -0.4 },
                weapon: { rotation: -0.5, x: -3 },
                easing: 'linear',
            },
            // Full spin
            {
                time: 0.5,
                body: { y: -3, scaleY: 0.9, scaleX: 1.1, rotation: 1.6 },
                head: { y: -2, rotation: 0.8 },
                armFront: { rotation: -1.5 },
                armBack: { rotation: 1.2 },
                legFront: { rotation: 0.8 },
                legBack: { rotation: -0.6 },
                weapon: { rotation: -1.0, x: -5, y: -3 },
                easing: 'linear',
            },
            // Spin recovery
            {
                time: 0.8,
                body: { y: -1, scaleY: 0.98, scaleX: 1.02, rotation: 0.4 },
                head: { y: -1, rotation: 0.2 },
                armFront: { rotation: -0.3 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: 0.2 },
                legBack: { rotation: -0.1 },
                weapon: { rotation: -0.2, x: -1, y: -1 },
                easing: 'linear',
            },
            // Ready
            {
                time: 1,
                body: { y: 0, scaleY: 1, scaleX: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0, y: 0 },
                easing: 'linear',
            },
        ],
    },

    attack: {
        name: 'attack',
        duration: 22,
        loop: false,
        priority: 4,
        keyframes: [
            // Power up
            {
                time: 0,
                body: { y: 0, rotation: 0 },
                head: { rotation: 0.1 },
                armFront: { rotation: -0.3, length: 1 },
                armBack: { rotation: 0.1 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0.1 },
                weapon: { rotation: -0.5, x: -3 },
            },
            // Charge
            {
                time: 0.25,
                body: { y: -1, rotation: 0.05 },
                head: { rotation: 0.15 },
                armFront: { rotation: -0.5, length: 1.1 },
                armBack: { rotation: 0.15 },
                legFront: { rotation: -0.1 },
                legBack: { rotation: 0.15 },
                weapon: { rotation: -0.8, x: -5 },
                easing: 'linear',
            },
            // Fire (laser extends)
            {
                time: 0.4,
                body: { y: 0, rotation: 0.1 },
                head: { rotation: 0.2 },
                armFront: { rotation: 0.3, length: 1.5 },
                armBack: { rotation: -0.1 },
                legFront: { rotation: 0.1 },
                legBack: { rotation: -0.05 },
                weapon: { rotation: 0.2, x: 10 },
                easing: 'linear',
            },
            // Extended
            {
                time: 0.6,
                body: { y: 0, rotation: 0.05 },
                head: { rotation: 0.1 },
                armFront: { rotation: 0.4, length: 1.8 },
                armBack: { rotation: -0.15 },
                legFront: { rotation: 0.05 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0.3, x: 15 },
                easing: 'linear',
            },
            // Retract
            {
                time: 1,
                body: { y: 0, rotation: 0 },
                head: { rotation: 0 },
                armFront: { rotation: 0, length: 1 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0 },
                easing: 'linear',
            },
        ],
    },

    hurt: {
        name: 'hurt',
        duration: 12,
        loop: false,
        priority: 5,
        keyframes: [
            // System shock
            {
                time: 0,
                body: { y: 0, scaleX: 1.08, scaleY: 0.92, rotation: -0.15 },
                head: { y: 1, rotation: -0.25 },
                armFront: { rotation: 0.4 },
                armBack: { rotation: 0.6 },
                legFront: { rotation: -0.15 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.6, x: 2 },
            },
            // Reboot flicker
            {
                time: 0.4,
                body: { y: 1, scaleX: 1.05, scaleY: 0.95, rotation: -0.1 },
                head: { y: 2, rotation: -0.15 },
                armFront: { rotation: 0.2 },
                armBack: { rotation: 0.3 },
                legFront: { rotation: -0.08 },
                legBack: { rotation: 0.1 },
                weapon: { rotation: 0.3, x: 1 },
                easing: 'linear',
            },
            // System restore
            {
                time: 1,
                body: { y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0, x: 0 },
                easing: 'linear',
            },
        ],
    },

    death: {
        name: 'death',
        duration: 50,
        loop: false,
        priority: 10,
        keyframes: [
            // System failure
            {
                time: 0,
                body: { y: 0, scaleY: 1, rotation: 0 },
                head: { y: 0, rotation: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
            },
            // Power surge
            {
                time: 0.1,
                body: { y: -2, scaleY: 1.05, rotation: 0.1 },
                head: { y: -1, rotation: 0.2 },
                armFront: { rotation: -0.3 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: 0.1 },
                legBack: { rotation: -0.1 },
                weapon: { rotation: 0.5 },
                easing: 'linear',
            },
            // Systems failing
            {
                time: 0.3,
                body: { y: 5, scaleY: 0.9, rotation: -0.2 },
                head: { y: 3, rotation: -0.3 },
                armFront: { rotation: 0.5 },
                armBack: { rotation: 0.8 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: 0.3 },
                weapon: { rotation: 1.0, x: 5 },
                easing: 'linear',
            },
            // Power down
            {
                time: 0.6,
                body: { y: 20, scaleY: 0.7, scaleX: 1.15, rotation: -0.5 },
                head: { y: 12, rotation: -0.6 },
                armFront: { rotation: 0.9 },
                armBack: { rotation: 1.4 },
                legFront: { rotation: 0.7 },
                legBack: { rotation: 0.5 },
                weapon: { rotation: 2.0, x: 10, y: 10 },
                easing: 'linear',
            },
            // Shutdown complete
            {
                time: 1,
                body: { y: 30, scaleY: 0.5, scaleX: 1.3, rotation: -0.9 },
                head: { y: 18, rotation: -0.8 },
                armFront: { rotation: 1.2 },
                armBack: { rotation: 1.8 },
                legFront: { rotation: 0.9 },
                legBack: { rotation: 0.7 },
                weapon: { rotation: 3.0, x: 15, y: 20 },
                easing: 'linear',
            },
        ],
    },

    land: {
        name: 'land',
        duration: 10,
        loop: false,
        priority: 2,
        keyframes: [
            // Hard landing
            {
                time: 0,
                body: { y: 4, scaleY: 0.85, scaleX: 1.1 },
                head: { y: 2 },
                armFront: { rotation: 0.3 },
                armBack: { rotation: 0.4 },
                legFront: { rotation: 0.4 },
                legBack: { rotation: 0.4 },
                weapon: { rotation: 0.4 },
            },
            // Stabilize
            {
                time: 0.5,
                body: { y: 2, scaleY: 0.95, scaleX: 1.03 },
                head: { y: 1 },
                armFront: { rotation: 0.1 },
                armBack: { rotation: 0.15 },
                legFront: { rotation: 0.2 },
                legBack: { rotation: 0.2 },
                weapon: { rotation: 0.15 },
                easing: 'linear',
            },
            // Ready
            {
                time: 1,
                body: { y: 0, scaleY: 1, scaleX: 1 },
                head: { y: 0 },
                armFront: { rotation: 0 },
                armBack: { rotation: 0 },
                legFront: { rotation: 0 },
                legBack: { rotation: 0 },
                weapon: { rotation: 0 },
                easing: 'linear',
            },
        ],
    },
};
