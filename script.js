class PianoGame {
    constructor() {
        this.canvas = document.getElementById('pianoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.isPlaying = false;
        this.notes = [];
        this.keys = [];
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 300;
        
        // Initialize piano keys
        this.initializeKeys();
        
        // Bind event listeners
        this.bindEvents();
        
        // Load sound samples
        this.loadSounds();
    }

    initializeKeys() {
        const whiteKeyWidth = 50;
        const blackKeyWidth = 30;
        const whiteKeyHeight = 200;
        const blackKeyHeight = 120;
        
        // White keys
        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        whiteNotes.forEach((note, index) => {
            this.keys.push({
                note: note,
                x: index * whiteKeyWidth,
                y: 0,
                width: whiteKeyWidth,
                height: whiteKeyHeight,
                isBlack: false,
                isPressed: false
            });
        });
        
        // Black keys
        const blackNotes = ['C#', 'D#', '', 'F#', 'G#', 'A#'];
        blackNotes.forEach((note, index) => {
            if (note) {
                this.keys.push({
                    note: note,
                    x: (index * whiteKeyWidth) + (whiteKeyWidth - blackKeyWidth / 2),
                    y: 0,
                    width: blackKeyWidth,
                    height: blackKeyHeight,
                    isBlack: true,
                    isPressed: false
                });
            }
        });
    }

    loadSounds() {
        this.sounds = {};
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        notes.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            this.sounds[note] = { oscillator, gainNode };
        });
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Start game button
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.keys.forEach(key => {
            if (this.isPointInKey(x, y, key)) {
                this.pressKey(key);
            }
        });
    }

    handleMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.keys.forEach(key => {
            if (this.isPointInKey(x, y, key)) {
                this.releaseKey(key);
            }
        });
    }

    handleMouseMove(e) {
        if (e.buttons === 1) {
            this.handleMouseDown(e);
        }
    }

    handleKeyDown(e) {
        const keyMap = {
            'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
            't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
        };
        
        const note = keyMap[e.key.toLowerCase()];
        if (note) {
            const key = this.keys.find(k => k.note === note);
            if (key) {
                this.pressKey(key);
            }
        }
    }

    handleKeyUp(e) {
        const keyMap = {
            'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
            't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
        };
        
        const note = keyMap[e.key.toLowerCase()];
        if (note) {
            const key = this.keys.find(k => k.note === note);
            if (key) {
                this.releaseKey(key);
            }
        }
    }

    isPointInKey(x, y, key) {
        return x >= key.x && x <= key.x + key.width &&
               y >= key.y && y <= key.y + key.height;
    }

    pressKey(key) {
        if (!key.isPressed) {
            key.isPressed = true;
            this.playNote(key.note);
            this.score += 10;
            document.getElementById('scoreValue').textContent = this.score;
        }
    }

    releaseKey(key) {
        if (key.isPressed) {
            key.isPressed = false;
            this.stopNote(key.note);
        }
    }

    playNote(note) {
        const sound = this.sounds[note];
        if (sound) {
            sound.oscillator.frequency.setValueAtTime(this.getFrequency(note), this.audioContext.currentTime);
            sound.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            sound.oscillator.start();
        }
    }

    stopNote(note) {
        const sound = this.sounds[note];
        if (sound) {
            sound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            sound.oscillator.stop();
        }
    }

    getFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const baseFrequency = 440; // A4
        const noteIndex = notes.indexOf(note);
        return baseFrequency * Math.pow(2, (noteIndex - 9) / 12);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw white keys
        this.keys.filter(key => !key.isBlack).forEach(key => {
            this.ctx.fillStyle = key.isPressed ? '#ddd' : '#fff';
            this.ctx.fillRect(key.x, key.y, key.width, key.height);
            this.ctx.strokeStyle = '#000';
            this.ctx.strokeRect(key.x, key.y, key.width, key.height);
            
            // Draw note label
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(key.note, key.x + key.width / 2, key.y + key.height - 10);
        });
        
        // Draw black keys
        this.keys.filter(key => key.isBlack).forEach(key => {
            this.ctx.fillStyle = key.isPressed ? '#333' : '#000';
            this.ctx.fillRect(key.x, key.y, key.width, key.height);
            
            // Draw note label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(key.note, key.x + key.width / 2, key.y + key.height - 10);
        });
    }

    startGame() {
        this.score = 0;
        document.getElementById('scoreValue').textContent = this.score;
        this.isPlaying = true;
        this.gameLoop();
    }

    gameLoop() {
        if (this.isPlaying) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new PianoGame();
}); 