// Sound Manager - generates retro-style sounds using Web Audio API

// Extend Window interface for webkit prefix
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

class SoundManager {
    audioContext: AudioContext | null;
    enabled: boolean;
    volume: number;
    initialized: boolean;

    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch {
            // Web Audio API not supported - disable sound
            this.enabled = false;
        }
    }

    // Ensure audio context is running (needed after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Create oscillator-based sound
    playTone(frequency: number, duration: number, type: OscillatorType = 'square', volumeMult: number = 1) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(this.volume * volumeMult, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    // Play a sequence of tones
    playSequence(notes: Array<{freq: number, duration?: number, type?: OscillatorType, volume?: number}>, noteDuration: number = 0.1) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration || noteDuration, note.type || 'square', note.volume || 1);
            }, index * (noteDuration * 1000 * 0.8));
        });
    }

    // === GAME SOUND EFFECTS ===

    // Jump sound - rising tone
    jump() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Attack/swing sound - satisfying whoosh with metallic ring
    attack() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Layer 1: Whoosh sweep (high to low)
        const whoosh = this.audioContext.createOscillator();
        const whooshGain = this.audioContext.createGain();
        whoosh.connect(whooshGain);
        whooshGain.connect(this.audioContext.destination);

        whoosh.type = 'sawtooth';
        whoosh.frequency.setValueAtTime(800, now);
        whoosh.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        whooshGain.gain.setValueAtTime(this.volume * 0.2, now);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        whoosh.start(now);
        whoosh.stop(now + 0.12);

        // Layer 2: Metallic ring (sword sound)
        const ring = this.audioContext.createOscillator();
        const ringGain = this.audioContext.createGain();
        ring.connect(ringGain);
        ringGain.connect(this.audioContext.destination);

        ring.type = 'square';
        ring.frequency.setValueAtTime(1200, now);
        ring.frequency.exponentialRampToValueAtTime(600, now + 0.08);

        ringGain.gain.setValueAtTime(this.volume * 0.15, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        ring.start(now);
        ring.stop(now + 0.1);

        // Layer 3: Low punch for impact feel
        const punch = this.audioContext.createOscillator();
        const punchGain = this.audioContext.createGain();
        punch.connect(punchGain);
        punchGain.connect(this.audioContext.destination);

        punch.type = 'sine';
        punch.frequency.setValueAtTime(150, now);
        punch.frequency.exponentialRampToValueAtTime(60, now + 0.06);

        punchGain.gain.setValueAtTime(this.volume * 0.25, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        punch.start(now);
        punch.stop(now + 0.08);
    }

    // Hit enemy sound - meaty impact with crunch
    hit() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Layer 1: Impact thud (low frequency punch)
        const thud = this.audioContext.createOscillator();
        const thudGain = this.audioContext.createGain();
        thud.connect(thudGain);
        thudGain.connect(this.audioContext.destination);

        thud.type = 'sine';
        thud.frequency.setValueAtTime(120, now);
        thud.frequency.exponentialRampToValueAtTime(40, now + 0.08);

        thudGain.gain.setValueAtTime(this.volume * 0.5, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        thud.start(now);
        thud.stop(now + 0.1);

        // Layer 2: Crunch/slice sound (mid frequency)
        const crunch = this.audioContext.createOscillator();
        const crunchGain = this.audioContext.createGain();
        crunch.connect(crunchGain);
        crunchGain.connect(this.audioContext.destination);

        crunch.type = 'square';
        crunch.frequency.setValueAtTime(400, now);
        crunch.frequency.setValueAtTime(250, now + 0.02);
        crunch.frequency.setValueAtTime(180, now + 0.04);

        crunchGain.gain.setValueAtTime(this.volume * 0.35, now);
        crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        crunch.start(now);
        crunch.stop(now + 0.08);

        // Layer 3: High frequency click for sharpness
        const click = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();
        click.connect(clickGain);
        clickGain.connect(this.audioContext.destination);

        click.type = 'square';
        click.frequency.setValueAtTime(800, now);

        clickGain.gain.setValueAtTime(this.volume * 0.2, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        click.start(now);
        click.stop(now + 0.03);
    }

    // Critical hit - powerful, epic impact
    criticalHit() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Layer 1: Heavy bass impact
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bass.connect(bassGain);
        bassGain.connect(this.audioContext.destination);

        bass.type = 'sine';
        bass.frequency.setValueAtTime(80, now);
        bass.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        bassGain.gain.setValueAtTime(this.volume * 0.6, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        bass.start(now);
        bass.stop(now + 0.2);

        // Layer 2: Sharp crack
        const crack = this.audioContext.createOscillator();
        const crackGain = this.audioContext.createGain();
        crack.connect(crackGain);
        crackGain.connect(this.audioContext.destination);

        crack.type = 'square';
        crack.frequency.setValueAtTime(600, now);
        crack.frequency.setValueAtTime(400, now + 0.02);
        crack.frequency.setValueAtTime(200, now + 0.05);

        crackGain.gain.setValueAtTime(this.volume * 0.5, now);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        crack.start(now);
        crack.stop(now + 0.1);

        // Layer 3: Rising "zing" for epic feel
        const zing = this.audioContext.createOscillator();
        const zingGain = this.audioContext.createGain();
        zing.connect(zingGain);
        zingGain.connect(this.audioContext.destination);

        zing.type = 'sawtooth';
        zing.frequency.setValueAtTime(400, now);
        zing.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

        zingGain.gain.setValueAtTime(this.volume * 0.25, now);
        zingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        zing.start(now);
        zing.stop(now + 0.15);

        // Layer 4: Delayed second hit for combo feel
        setTimeout(() => {
            if (!this.audioContext) return;
            const now2 = this.audioContext.currentTime;

            const hit2 = this.audioContext.createOscillator();
            const hit2Gain = this.audioContext.createGain();
            hit2.connect(hit2Gain);
            hit2Gain.connect(this.audioContext.destination);

            hit2.type = 'square';
            hit2.frequency.setValueAtTime(800, now2);
            hit2.frequency.exponentialRampToValueAtTime(400, now2 + 0.08);

            hit2Gain.gain.setValueAtTime(this.volume * 0.4, now2);
            hit2Gain.gain.exponentialRampToValueAtTime(0.001, now2 + 0.1);

            hit2.start(now2);
            hit2.stop(now2 + 0.1);
        }, 60);
    }

    // Enemy death sound - satisfying explosion/pop
    enemyDeath() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Layer 1: Deep explosion
        const boom = this.audioContext.createOscillator();
        const boomGain = this.audioContext.createGain();
        boom.connect(boomGain);
        boomGain.connect(this.audioContext.destination);

        boom.type = 'sine';
        boom.frequency.setValueAtTime(200, now);
        boom.frequency.exponentialRampToValueAtTime(30, now + 0.25);

        boomGain.gain.setValueAtTime(this.volume * 0.5, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        boom.start(now);
        boom.stop(now + 0.3);

        // Layer 2: Crackle/pop
        const pop = this.audioContext.createOscillator();
        const popGain = this.audioContext.createGain();
        pop.connect(popGain);
        popGain.connect(this.audioContext.destination);

        pop.type = 'square';
        pop.frequency.setValueAtTime(500, now);
        pop.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        popGain.gain.setValueAtTime(this.volume * 0.35, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        pop.start(now);
        pop.stop(now + 0.2);

        // Layer 3: High sparkle for arcade feel
        const sparkle = this.audioContext.createOscillator();
        const sparkleGain = this.audioContext.createGain();
        sparkle.connect(sparkleGain);
        sparkleGain.connect(this.audioContext.destination);

        sparkle.type = 'square';
        sparkle.frequency.setValueAtTime(1000, now);
        sparkle.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        sparkleGain.gain.setValueAtTime(this.volume * 0.2, now);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        sparkle.start(now);
        sparkle.stop(now + 0.12);
    }

    // Player hurt sound
    playerHurt() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.05);
        osc.frequency.setValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Coin/gold pickup
    coin() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        this.playTone(800, 0.05, 'square', 0.3);
        setTimeout(() => {
            this.playTone(1000, 0.08, 'square', 0.3);
        }, 50);
    }

    // Level up fanfare
    levelUp() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [
            { freq: 523, duration: 0.1 },  // C5
            { freq: 659, duration: 0.1 },  // E5
            { freq: 784, duration: 0.1 },  // G5
            { freq: 1047, duration: 0.2 }, // C6
        ];
        this.playSequence(notes, 0.12);
    }

    // Wave complete
    waveComplete() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [
            { freq: 440, duration: 0.1 },
            { freq: 554, duration: 0.1 },
            { freq: 659, duration: 0.15 },
        ];
        this.playSequence(notes, 0.1);
    }

    // Game over sound
    gameOver() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);

        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    // Victory fanfare
    victory() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [
            { freq: 523, duration: 0.15 },  // C5
            { freq: 523, duration: 0.15 },  // C5
            { freq: 523, duration: 0.15 },  // C5
            { freq: 523, duration: 0.4 },   // C5
            { freq: 415, duration: 0.4 },   // Ab4
            { freq: 466, duration: 0.4 },   // Bb4
            { freq: 523, duration: 0.3 },   // C5
            { freq: 466, duration: 0.1 },   // Bb4
            { freq: 523, duration: 0.5 },   // C5
        ];
        this.playSequence(notes, 0.18);
    }

    // Menu select sound
    menuSelect() {
        this.playTone(600, 0.05, 'square', 0.3);
    }

    // Menu confirm sound
    menuConfirm() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        this.playTone(500, 0.08, 'square', 0.3);
        setTimeout(() => {
            this.playTone(700, 0.1, 'square', 0.4);
        }, 80);
    }

    // Shop purchase sound
    purchase() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const notes = [
            { freq: 600, duration: 0.08 },
            { freq: 800, duration: 0.08 },
            { freq: 1000, duration: 0.12 },
        ];
        this.playSequence(notes, 0.08);
    }

    // Error/can't afford sound
    error() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        this.playTone(150, 0.15, 'square', 0.4);
        setTimeout(() => {
            this.playTone(100, 0.2, 'square', 0.4);
        }, 100);
    }

    // Fireball/projectile sound
    fireball() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        // Create noise-like sound for fire
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        gain.gain.setValueAtTime(this.volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

export const sound = new SoundManager();
