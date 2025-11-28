// Music Manager - Procedural retro-style background music using Web Audio API

// Extend Window interface for webkit prefix
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

// Musical note frequencies (A4 = 440Hz tuning)
const NOTES: Record<string, number> = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
    'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50,
    'REST': 0
};

// Track definition interfaces
interface MusicNote {
    note: string;
    duration: number; // in beats
}

interface MusicTrack {
    name: string;
    bpm: number;
    melody: MusicNote[];
    bass: MusicNote[];
    harmony?: MusicNote[];
    drumPattern?: ('kick' | 'snare' | 'hihat' | 'rest')[];
}

// ============================================
// MUSIC TRACK DEFINITIONS
// ============================================

// Menu theme - Heroic and inviting
const MENU_TRACK: MusicTrack = {
    name: 'menu',
    bpm: 100,
    melody: [
        // Main heroic melody - fanfare style
        { note: 'G4', duration: 1 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'B4', duration: 1 }, { note: 'G4', duration: 1 },
        { note: 'C5', duration: 1.5 }, { note: 'B4', duration: 0.5 },
        { note: 'A4', duration: 2 },
        { note: 'G4', duration: 1 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'B4', duration: 1 }, { note: 'D5', duration: 1 },
        { note: 'C5', duration: 2 }, { note: 'REST', duration: 2 },
    ],
    bass: [
        { note: 'G3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'C3', duration: 2 }, { note: 'D3', duration: 2 },
        { note: 'G3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'C3', duration: 2 }, { note: 'G3', duration: 2 },
    ],
    harmony: [
        { note: 'D4', duration: 2 }, { note: 'D4', duration: 2 },
        { note: 'E4', duration: 2 }, { note: 'F#4', duration: 2 },
        { note: 'D4', duration: 2 }, { note: 'B3', duration: 2 },
        { note: 'E4', duration: 2 }, { note: 'D4', duration: 2 },
    ],
    drumPattern: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat']
};

// Forest level - Peaceful and adventurous
const FOREST_TRACK: MusicTrack = {
    name: 'forest',
    bpm: 120,
    melody: [
        { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1 },
        { note: 'G4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1 },
        { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'A4', duration: 2 },
        { note: 'B4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 1 },
        { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1 },
        { note: 'G4', duration: 1 }, { note: 'E4', duration: 1 },
        { note: 'D4', duration: 2 },
    ],
    bass: [
        { note: 'A3', duration: 1 }, { note: 'E3', duration: 1 }, { note: 'A3', duration: 1 }, { note: 'E3', duration: 1 },
        { note: 'G3', duration: 1 }, { note: 'D3', duration: 1 }, { note: 'G3', duration: 1 }, { note: 'D3', duration: 1 },
        { note: 'E3', duration: 1 }, { note: 'B3', duration: 1 }, { note: 'E3', duration: 1 }, { note: 'B3', duration: 1 },
        { note: 'A3', duration: 1 }, { note: 'E3', duration: 1 }, { note: 'D3', duration: 2 },
    ],
    drumPattern: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'kick', 'snare', 'hihat']
};

// Graveyard level - Eerie and mysterious
const GRAVEYARD_TRACK: MusicTrack = {
    name: 'graveyard',
    bpm: 85,
    melody: [
        { note: 'E4', duration: 2 }, { note: 'D#4', duration: 1 }, { note: 'E4', duration: 1 },
        { note: 'B3', duration: 2 }, { note: 'REST', duration: 2 },
        { note: 'E4', duration: 1 }, { note: 'F4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'D#4', duration: 1 },
        { note: 'E4', duration: 4 },
        { note: 'G4', duration: 1.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 1 }, { note: 'D4', duration: 1 },
        { note: 'C4', duration: 2 }, { note: 'B3', duration: 2 },
    ],
    bass: [
        { note: 'E3', duration: 4 }, { note: 'B3', duration: 4 },
        { note: 'A3', duration: 4 }, { note: 'E3', duration: 4 },
        { note: 'C3', duration: 4 }, { note: 'G3', duration: 4 },
    ],
    harmony: [
        { note: 'B3', duration: 4 }, { note: 'G#3', duration: 4 },
        { note: 'C4', duration: 4 }, { note: 'B3', duration: 4 },
        { note: 'E3', duration: 4 }, { note: 'B3', duration: 4 },
    ],
    drumPattern: ['kick', 'rest', 'rest', 'hihat', 'rest', 'snare', 'rest', 'hihat']
};

// Mountains level - Epic and grand
const MOUNTAINS_TRACK: MusicTrack = {
    name: 'mountains',
    bpm: 110,
    melody: [
        { note: 'D4', duration: 1 }, { note: 'F4', duration: 1 }, { note: 'A4', duration: 2 },
        { note: 'G4', duration: 1 }, { note: 'F4', duration: 1 }, { note: 'E4', duration: 2 },
        { note: 'D4', duration: 1 }, { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 1 }, { note: 'A4', duration: 1 },
        { note: 'A#4', duration: 2 }, { note: 'A4', duration: 2 },
        { note: 'C5', duration: 1 }, { note: 'A#4', duration: 1 }, { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
        { note: 'F4', duration: 2 }, { note: 'D4', duration: 2 },
    ],
    bass: [
        { note: 'D3', duration: 2 }, { note: 'A3', duration: 2 },
        { note: 'C3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'D3', duration: 2 }, { note: 'E3', duration: 2 },
        { note: 'F3', duration: 2 }, { note: 'A3', duration: 2 },
        { note: 'A#3', duration: 2 }, { note: 'A3', duration: 2 },
        { note: 'D3', duration: 4 },
    ],
    drumPattern: ['kick', 'hihat', 'kick', 'snare', 'kick', 'hihat', 'kick', 'snare']
};

// Ice cave level - Cold and crystalline
const ICE_TRACK: MusicTrack = {
    name: 'ice',
    bpm: 95,
    melody: [
        { note: 'E5', duration: 1 }, { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'B4', duration: 1 }, { note: 'REST', duration: 1 },
        { note: 'A4', duration: 1 }, { note: 'B4', duration: 1 }, { note: 'C5', duration: 2 },
        { note: 'E5', duration: 1 }, { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'B4', duration: 2 },
        { note: 'A4', duration: 1.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 2 },
    ],
    bass: [
        { note: 'A3', duration: 2 }, { note: 'E3', duration: 2 },
        { note: 'F3', duration: 2 }, { note: 'C4', duration: 2 },
        { note: 'A3', duration: 2 }, { note: 'E3', duration: 2 },
        { note: 'F3', duration: 2 }, { note: 'A3', duration: 2 },
    ],
    harmony: [
        { note: 'C4', duration: 2 }, { note: 'B3', duration: 2 },
        { note: 'A3', duration: 2 }, { note: 'G4', duration: 2 },
        { note: 'E4', duration: 2 }, { note: 'G#3', duration: 2 },
        { note: 'A3', duration: 2 }, { note: 'E4', duration: 2 },
    ],
    drumPattern: ['kick', 'rest', 'hihat', 'rest', 'snare', 'rest', 'hihat', 'hihat']
};

// Dragon's lair level - Intense and fiery
const LAIR_TRACK: MusicTrack = {
    name: 'lair',
    bpm: 140,
    melody: [
        { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 1 },
        { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'D4', duration: 2 },
        { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
        { note: 'A4', duration: 1 }, { note: 'B4', duration: 1 },
        { note: 'C5', duration: 1 }, { note: 'B4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'E4', duration: 2 },
    ],
    bass: [
        { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 },
        { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'G3', duration: 1 },
        { note: 'A3', duration: 2 }, { note: 'D3', duration: 2 },
        { note: 'E3', duration: 1 }, { note: 'E3', duration: 1 },
        { note: 'A3', duration: 1 }, { note: 'B3', duration: 1 },
        { note: 'C4', duration: 1 }, { note: 'G3', duration: 1 },
        { note: 'E3', duration: 2 },
    ],
    drumPattern: ['kick', 'hihat', 'kick', 'hihat', 'snare', 'kick', 'kick', 'snare']
};

// Sky citadel level - Majestic and airy
const CITADEL_TRACK: MusicTrack = {
    name: 'citadel',
    bpm: 125,
    melody: [
        { note: 'G4', duration: 1 }, { note: 'A4', duration: 0.5 }, { note: 'B4', duration: 0.5 }, { note: 'C5', duration: 1 }, { note: 'D5', duration: 1 },
        { note: 'E5', duration: 2 }, { note: 'D5', duration: 2 },
        { note: 'C5', duration: 1 }, { note: 'B4', duration: 1 }, { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
        { note: 'A4', duration: 4 },
        { note: 'B4', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'D5', duration: 2 },
        { note: 'E5', duration: 1 }, { note: 'D5', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'B4', duration: 1 },
        { note: 'G4', duration: 4 },
    ],
    bass: [
        { note: 'G3', duration: 2 }, { note: 'C4', duration: 2 },
        { note: 'E3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'A3', duration: 2 }, { note: 'E3', duration: 2 },
        { note: 'D3', duration: 4 },
        { note: 'G3', duration: 2 }, { note: 'D3', duration: 2 },
        { note: 'E3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'C3', duration: 4 },
    ],
    harmony: [
        { note: 'B3', duration: 2 }, { note: 'E4', duration: 2 },
        { note: 'G3', duration: 2 }, { note: 'B3', duration: 2 },
        { note: 'C4', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'F#3', duration: 4 },
        { note: 'D4', duration: 2 }, { note: 'B3', duration: 2 },
        { note: 'G3', duration: 2 }, { note: 'D4', duration: 2 },
        { note: 'E3', duration: 4 },
    ],
    drumPattern: ['kick', 'hihat', 'hihat', 'snare', 'kick', 'hihat', 'hihat', 'snare']
};

// Final boss level - Dramatic and intense
const BOSS_TRACK: MusicTrack = {
    name: 'boss',
    bpm: 155,
    melody: [
        { note: 'E4', duration: 0.5 }, { note: 'REST', duration: 0.25 }, { note: 'E4', duration: 0.25 }, { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
        { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'B4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'B4', duration: 1 }, { note: 'A4', duration: 1 },
        { note: 'G#4', duration: 2 },
        { note: 'A4', duration: 0.5 }, { note: 'B4', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'D5', duration: 0.5 },
        { note: 'E5', duration: 1 }, { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'B4', duration: 1 }, { note: 'A4', duration: 1 },
        { note: 'E4', duration: 2 },
    ],
    bass: [
        { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 },
        { note: 'G3', duration: 0.5 }, { note: 'G3', duration: 0.5 }, { note: 'G3', duration: 0.5 }, { note: 'G3', duration: 0.5 },
        { note: 'A3', duration: 1 }, { note: 'A3', duration: 1 },
        { note: 'E3', duration: 2 },
        { note: 'A3', duration: 0.5 }, { note: 'A3', duration: 0.5 }, { note: 'A3', duration: 0.5 }, { note: 'A3', duration: 0.5 },
        { note: 'C4', duration: 1 }, { note: 'B3', duration: 1 },
        { note: 'G#3', duration: 1 }, { note: 'A3', duration: 1 },
        { note: 'E3', duration: 2 },
    ],
    drumPattern: ['kick', 'kick', 'snare', 'kick', 'kick', 'snare', 'kick', 'snare']
};

// Victory theme - Triumphant celebration
const VICTORY_TRACK: MusicTrack = {
    name: 'victory',
    bpm: 130,
    melody: [
        { note: 'C5', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'C5', duration: 1.5 },
        { note: 'G#4', duration: 1 }, { note: 'A#4', duration: 1 },
        { note: 'C5', duration: 0.5 }, { note: 'A#4', duration: 0.25 }, { note: 'C5', duration: 2.25 },
        { note: 'REST', duration: 1 },
        { note: 'F5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'F5', duration: 1.5 },
        { note: 'D#5', duration: 1 }, { note: 'D5', duration: 1 },
        { note: 'C5', duration: 3 }, { note: 'REST', duration: 1 },
    ],
    bass: [
        { note: 'C4', duration: 2 }, { note: 'C4', duration: 2 },
        { note: 'G#3', duration: 2 }, { note: 'A#3', duration: 2 },
        { note: 'C4', duration: 4 },
        { note: 'F3', duration: 2 }, { note: 'F3', duration: 2 },
        { note: 'G3', duration: 2 }, { note: 'G3', duration: 2 },
        { note: 'C4', duration: 4 },
    ],
    harmony: [
        { note: 'E4', duration: 2 }, { note: 'G4', duration: 2 },
        { note: 'C4', duration: 2 }, { note: 'D4', duration: 2 },
        { note: 'E4', duration: 4 },
        { note: 'A4', duration: 2 }, { note: 'C5', duration: 2 },
        { note: 'B4', duration: 2 }, { note: 'G4', duration: 2 },
        { note: 'E4', duration: 4 },
    ],
    drumPattern: ['kick', 'snare', 'kick', 'snare', 'kick', 'snare', 'kick', 'snare']
};

// Game over theme - Somber
const GAMEOVER_TRACK: MusicTrack = {
    name: 'gameover',
    bpm: 60,
    melody: [
        { note: 'E4', duration: 2 }, { note: 'D#4', duration: 2 },
        { note: 'D4', duration: 2 }, { note: 'C#4', duration: 2 },
        { note: 'C4', duration: 4 }, { note: 'REST', duration: 4 },
    ],
    bass: [
        { note: 'A3', duration: 4 }, { note: 'G3', duration: 4 },
        { note: 'F3', duration: 4 }, { note: 'REST', duration: 4 },
    ],
    drumPattern: ['kick', 'rest', 'rest', 'rest']
};

// Shop theme - Cheerful marketplace
const SHOP_TRACK: MusicTrack = {
    name: 'shop',
    bpm: 105,
    melody: [
        { note: 'C5', duration: 0.5 }, { note: 'D5', duration: 0.5 }, { note: 'E5', duration: 1 },
        { note: 'G5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'C5', duration: 1 },
        { note: 'D5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'E5', duration: 0.5 },
        { note: 'D5', duration: 2 },
        { note: 'E5', duration: 0.5 }, { note: 'F5', duration: 0.5 }, { note: 'G5', duration: 1 },
        { note: 'A5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'E5', duration: 1 },
        { note: 'F5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'C5', duration: 2 },
    ],
    bass: [
        { note: 'C4', duration: 1 }, { note: 'G3', duration: 1 }, { note: 'C4', duration: 1 }, { note: 'G3', duration: 1 },
        { note: 'G3', duration: 1 }, { note: 'D3', duration: 1 }, { note: 'G3', duration: 2 },
        { note: 'C4', duration: 1 }, { note: 'E3', duration: 1 }, { note: 'A3', duration: 2 },
        { note: 'F3', duration: 1 }, { note: 'G3', duration: 1 }, { note: 'C3', duration: 2 },
    ],
    drumPattern: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat']
};

// Track mapping by level index
const LEVEL_TRACKS: MusicTrack[] = [
    FOREST_TRACK,    // Level 0: Forest
    GRAVEYARD_TRACK, // Level 1: Graveyard
    MOUNTAINS_TRACK, // Level 2: Mountains
    ICE_TRACK,       // Level 3: Frozen Depths
    LAIR_TRACK,      // Level 4: Dragon's Lair
    CITADEL_TRACK,   // Level 5: Sky Citadel
    BOSS_TRACK,      // Level 6: Final Battle
];

// ============================================
// MUSIC MANAGER CLASS
// ============================================

class MusicManager {
    audioContext: AudioContext | null = null;
    masterGain: GainNode | null = null;
    enabled: boolean = true;
    volume: number = 0.25;
    initialized: boolean = false;

    // Playback state
    currentTrack: MusicTrack | null = null;
    isPlaying: boolean = false;
    scheduledNotes: number[] = []; // Store oscillator stop times
    activeOscillators: OscillatorNode[] = [];
    activeGainNodes: GainNode[] = [];
    loopTimeout: ReturnType<typeof setTimeout> | null = null;

    // For scheduling
    nextNoteTime: number = 0;

    init(): void {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            this.initialized = true;
        } catch {
            // Web Audio API not supported
            this.enabled = false;
        }
    }

    resume(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Get beat duration in seconds from BPM
    getBeatDuration(bpm: number): number {
        return 60 / bpm;
    }

    // Create an oscillator for a note
    createNoteOscillator(
        frequency: number,
        startTime: number,
        duration: number,
        type: OscillatorType = 'square',
        volumeMult: number = 1
    ): void {
        if (!this.audioContext || !this.masterGain || frequency === 0) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = type;
        osc.frequency.value = frequency;

        // ADSR-like envelope
        const attackTime = 0.02;
        const decayTime = 0.05;
        const sustainLevel = 0.6;
        const releaseTime = duration * 0.2;

        const actualVolume = this.volume * volumeMult * 0.4;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(actualVolume, startTime + attackTime);
        gain.gain.linearRampToValueAtTime(actualVolume * sustainLevel, startTime + attackTime + decayTime);
        gain.gain.setValueAtTime(actualVolume * sustainLevel, startTime + duration - releaseTime);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);

        this.activeOscillators.push(osc);
        this.activeGainNodes.push(gain);

        // Clean up after note ends
        osc.onended = () => {
            const oscIndex = this.activeOscillators.indexOf(osc);
            if (oscIndex > -1) this.activeOscillators.splice(oscIndex, 1);
            const gainIndex = this.activeGainNodes.indexOf(gain);
            if (gainIndex > -1) this.activeGainNodes.splice(gainIndex, 1);
        };
    }

    // Create percussion sounds
    createDrumSound(type: 'kick' | 'snare' | 'hihat', startTime: number): void {
        if (!this.audioContext || !this.masterGain) return;

        const volumeMult = 0.3;

        if (type === 'kick') {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, startTime);
            osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);

            gain.gain.setValueAtTime(this.volume * volumeMult, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

            osc.start(startTime);
            osc.stop(startTime + 0.15);

            this.activeOscillators.push(osc);
        } else if (type === 'snare') {
            // Tone component
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'triangle';
            osc.frequency.value = 180;

            gain.gain.setValueAtTime(this.volume * volumeMult * 0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

            osc.start(startTime);
            osc.stop(startTime + 0.1);

            // Noise component using multiple oscillators
            const noiseOsc = this.audioContext.createOscillator();
            const noiseGain = this.audioContext.createGain();
            noiseOsc.connect(noiseGain);
            noiseGain.connect(this.masterGain);

            noiseOsc.type = 'square';
            noiseOsc.frequency.value = 200 + Math.random() * 100;

            noiseGain.gain.setValueAtTime(this.volume * volumeMult * 0.3, startTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

            noiseOsc.start(startTime);
            noiseOsc.stop(startTime + 0.08);

            this.activeOscillators.push(osc, noiseOsc);
        } else if (type === 'hihat') {
            // Simulate hi-hat with high-frequency oscillators
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);

            osc1.type = 'square';
            osc2.type = 'square';
            osc1.frequency.value = 1500;
            osc2.frequency.value = 1520;

            gain.gain.setValueAtTime(this.volume * volumeMult * 0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

            osc1.start(startTime);
            osc2.start(startTime);
            osc1.stop(startTime + 0.05);
            osc2.stop(startTime + 0.05);

            this.activeOscillators.push(osc1, osc2);
        }
    }

    // Schedule an entire track
    scheduleTrack(track: MusicTrack): number {
        if (!this.audioContext || !this.enabled) return 0;

        this.resume();

        const beatDuration = this.getBeatDuration(track.bpm);
        const startTime = this.audioContext.currentTime + 0.1;
        let totalDuration = 0;

        // Schedule melody
        let melodyTime = startTime;
        for (const note of track.melody) {
            const freq = NOTES[note.note] || 0;
            const duration = note.duration * beatDuration;
            if (freq > 0) {
                this.createNoteOscillator(freq, melodyTime, duration * 0.9, 'square', 1);
            }
            melodyTime += duration;
        }
        totalDuration = Math.max(totalDuration, melodyTime - startTime);

        // Schedule bass
        let bassTime = startTime;
        for (const note of track.bass) {
            const freq = NOTES[note.note] || 0;
            const duration = note.duration * beatDuration;
            if (freq > 0) {
                this.createNoteOscillator(freq, bassTime, duration * 0.9, 'triangle', 0.7);
            }
            bassTime += duration;
        }
        totalDuration = Math.max(totalDuration, bassTime - startTime);

        // Schedule harmony if present
        if (track.harmony) {
            let harmonyTime = startTime;
            for (const note of track.harmony) {
                const freq = NOTES[note.note] || 0;
                const duration = note.duration * beatDuration;
                if (freq > 0) {
                    this.createNoteOscillator(freq, harmonyTime, duration * 0.9, 'sawtooth', 0.3);
                }
                harmonyTime += duration;
            }
            totalDuration = Math.max(totalDuration, harmonyTime - startTime);
        }

        // Schedule drums if present
        if (track.drumPattern) {
            const patternLength = track.drumPattern.length;
            const drumBeatDuration = beatDuration / 2; // 8th notes for drums
            let drumTime = startTime;

            // Repeat drum pattern to fill the track
            const numBeats = Math.ceil(totalDuration / drumBeatDuration);
            for (let i = 0; i < numBeats; i++) {
                const drumType = track.drumPattern[i % patternLength];
                if (drumType !== 'rest') {
                    this.createDrumSound(drumType, drumTime);
                }
                drumTime += drumBeatDuration;
            }
        }

        return totalDuration;
    }

    // Play a track with looping
    play(trackName: string): void {
        if (!this.enabled) return;

        this.init();
        this.stop();

        // Get the appropriate track
        let track: MusicTrack;
        switch (trackName) {
            case 'menu':
                track = MENU_TRACK;
                break;
            case 'shop':
                track = SHOP_TRACK;
                break;
            case 'victory':
                track = VICTORY_TRACK;
                break;
            case 'gameover':
                track = GAMEOVER_TRACK;
                break;
            default: {
                // Check if it's a level index
                const levelIndex = parseInt(trackName, 10);
                if (!isNaN(levelIndex) && levelIndex >= 0 && levelIndex < LEVEL_TRACKS.length) {
                    track = LEVEL_TRACKS[levelIndex];
                } else {
                    track = MENU_TRACK; // Default
                }
                break;
            }
        }

        this.currentTrack = track;
        this.isPlaying = true;
        this.loopTrack();
    }

    // Loop the current track
    private loopTrack(): void {
        if (!this.isPlaying || !this.currentTrack) return;

        const duration = this.scheduleTrack(this.currentTrack);

        // Schedule next loop slightly before current ends
        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.loopTrack();
            }
        }, duration * 1000 - 100);
    }

    // Play level-specific music
    playLevel(levelIndex: number): void {
        this.play(levelIndex.toString());
    }

    // Stop all music
    stop(): void {
        this.isPlaying = false;
        this.currentTrack = null;

        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }

        // Stop all active oscillators
        this.activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch {
                // Oscillator already stopped
            }
        });
        this.activeOscillators = [];
        this.activeGainNodes = [];
    }

    // Pause music (fade out)
    pause(): void {
        if (!this.masterGain || !this.audioContext) return;

        this.isPlaying = false;

        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }

        // Fade out
        const now = this.audioContext.currentTime;
        this.masterGain.gain.setValueAtTime(this.volume, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
    }

    // Resume music
    unpause(): void {
        if (!this.masterGain || !this.audioContext) return;

        // Restore volume and resume
        const now = this.audioContext.currentTime;
        this.masterGain.gain.setValueAtTime(0, now);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.3);

        // Resume looping if we have a track
        if (this.currentTrack) {
            this.isPlaying = true;
            this.loopTrack();
        }
    }

    // Toggle music on/off
    toggle(): boolean {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stop();
        }
        return this.enabled;
    }

    // Set volume (0-1)
    setVolume(vol: number): void {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    // Get current volume
    getVolume(): number {
        return this.volume;
    }
}

export const music = new MusicManager();
