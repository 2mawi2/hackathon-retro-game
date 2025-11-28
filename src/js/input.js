// Input handling module

class InputManager {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};
        this.previousKeys = {};

        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keys[e.key.toLowerCase()] = true;

            // Prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        // Track which keys were just pressed this frame
        this.keysJustPressed = {};
        for (const key in this.keys) {
            if (this.keys[key] && !this.previousKeys[key]) {
                this.keysJustPressed[key] = true;
            }
        }
        this.previousKeys = { ...this.keys };
    }

    isDown(key) {
        return this.keys[key] || false;
    }

    isJustPressed(key) {
        return this.keysJustPressed[key] || false;
    }

    // Player 1 controls (WASD + Space)
    getPlayer1Input() {
        return {
            left: this.isDown('a') || this.isDown('KeyA'),
            right: this.isDown('d') || this.isDown('KeyD'),
            up: this.isDown('w') || this.isDown('KeyW'),
            down: this.isDown('s') || this.isDown('KeyS'),
            attack: this.isJustPressed('Space'),
            special: this.isJustPressed('e') || this.isJustPressed('KeyE')
        };
    }

    // Player 2 controls (Arrows + Enter)
    getPlayer2Input() {
        return {
            left: this.isDown('ArrowLeft'),
            right: this.isDown('ArrowRight'),
            up: this.isDown('ArrowUp'),
            down: this.isDown('ArrowDown'),
            attack: this.isJustPressed('Enter'),
            special: this.isJustPressed('Shift') || this.isJustPressed('ShiftRight')
        };
    }

    // Menu navigation
    isConfirm() {
        return this.isJustPressed('Space') || this.isJustPressed('Enter');
    }

    isCancel() {
        return this.isJustPressed('Escape');
    }

    isMenuUp() {
        return this.isJustPressed('w') || this.isJustPressed('KeyW') || this.isJustPressed('ArrowUp');
    }

    isMenuDown() {
        return this.isJustPressed('s') || this.isJustPressed('KeyS') || this.isJustPressed('ArrowDown');
    }

    isMenuLeft() {
        return this.isJustPressed('a') || this.isJustPressed('KeyA') || this.isJustPressed('ArrowLeft');
    }

    isMenuRight() {
        return this.isJustPressed('d') || this.isJustPressed('KeyD') || this.isJustPressed('ArrowRight');
    }
}

export const input = new InputManager();
