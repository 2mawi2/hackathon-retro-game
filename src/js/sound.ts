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
        } catch (e) {
            console.warn('Web Audio API not supported');
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

    // Attack/swing sound
    attack() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Hit enemy sound
    hit() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Critical hit - more impactful
    criticalHit() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        // First hit
        this.playTone(400, 0.08, 'square', 0.5);

        // Second higher hit
        setTimeout(() => {
            this.playTone(600, 0.1, 'square', 0.6);
        }, 50);
    }

    // Enemy death sound
    enemyDeath() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        const now = this.audioContext.currentTime;

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
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
