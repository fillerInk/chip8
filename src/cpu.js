class CPU{
    constructor(monitor,keyboard){
        this.monitor = monitor;
        this.keyboard = keyboard;

        // 4KB of memory
        this.memory = new Uint8Array(4096);

        // 16 8-bit registers
        this.v = new Uint8Array(16);

        // 16 bit index register to store memory addresses
        this.i = 0;

        // Timers
        this.delayTimer = 0;
        this.soundTimer = 0;

        // Program counter for current executing instruction address
        this.pc = 0x200;

        // stack array 
        this.stack = new Array();

        this.paused = false;

        this.speed = 10;
    }

    loadSpritesIntoMemory(){
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];

        for(let i=0; i<sprites.length; i++){
            this.memory[i] = sprites[i];
        }
    }

    loadProgramIntoMemory(program){
        for(let loc=0; loc < program.length; loc++){
            this.memory[0x200 + loc] = program.loc;
        }
    }

    loadRom(romName){
        var request = new XMLHttpRequest;
        var self = this;

        request.onload = function(){
            // if request response has any content
            if(request.response){
                let program = new Uint8Array(request.response);

                self.loadProgramIntoMemory(program);
            }
        }

        request.open('GET','roms/' + romName);
        request.responseType = 'arraybuffer';

        request.send();
    }

    cycle(){
        for(let i =0; i < this.speed; i++){
            if(!this.paused){
                let opcode = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                this.executeInstruction(opcode);
            }
        }

        if(!this.paused){
            this.updateTimers();
        }

        this.monitor.render();
    }

    updateTimers(){
        if(this.delayTimer > 0){
            this.delayTimer -= 1;
        }
        if(this.soundTimer > 0){
            this.soundTimer -= 1;
        }
    }

    executeInstruction(opcode){
        //Increment pc so we read the next instruction in the coming cycle
        this.pc += 2;

        let x = (opcode & 0x0F00) >> 8;
        let y = (opcode & 0x00F0) >> 4;

        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0:
                        this.monitor.clear();
                        break;
                    case 0x00EE:
                        this.pc = this.stack.pop();
                        break;
                }
        
                break;
            case 0x1000:
                this.pc = (opcode & 0xFFF);
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc = (opcode & 0xFFF);
                break;
            case 0x3000:
                if(this.v[x] === (opcode & 0xFF)){
                    this.pc += 2;
                }
                break;
            case 0x4000:
                if(this.v[x] !== (opcode & 0xFF)){
                    this.pc += 2;
                }
                break;
            case 0x5000:
                if(this.v[x] === this.v[y]){
                    this.pc += 2;
                }
                break;
            case 0x6000:
                this.v[x] = (opcode & 0xFF);
                break;
            case 0x7000:
                this.v[x] += (opcode & 0xFF);
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        this.v[x] = this.v[y];
                        break;
                    case 0x1:
                        this.v[x] |= this.v[y];
                        break;
                    case 0x2:
                        this.v[x] &= this.v[y];
                        break;
                    case 0x3:
                        this.v[x] ^= this.v[y];
                        break;
                    case 0x4:
                        let sum = (this.v[x] += this.v[y]);
                        this.v[0xF] = 0;
                        if(sum > OxFF){
                            this.v[0xF] = 1;
                        }
                        this.v[x] = sum;
                        break;
                    case 0x5:
                        this.v[0xF] = 0;
                        if (this.v[x] > this.v[y]) {
                            this.v[0xF] = 1;
                        }
                        this.v[x] -= this.v[y];
                        break;
                    case 0x6:
                        this.v[0xF] = (this.v[x] & 0x1);

                        this.v[x] >>= 1;
                        break;
                    case 0x7:
                        this.v[0xF] = 0;

                        if (this.v[y] > this.v[x]) {
                            this.v[0xF] = 1;
                        }

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:
                        this.v[0xF] = (this.v[x] & 0x80);
                        this.v[x] <<= 1;
                        break;
                }
        
                break;
            case 0x9000:
                if(this.v[x] !== this.v[y]){
                    this.pc += 2;
                }
                break;
            case 0xA000:
                this.i = (opcode & 0xFFF);
                break;
            case 0xB000:
                break;
            case 0xC000:
                break;
            case 0xD000:
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        break;
                    case 0xA1:
                        break;
                }
        
                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        break;
                    case 0x0A:
                        break;
                    case 0x15:
                        break;
                    case 0x18:
                        break;
                    case 0x1E:
                        break;
                    case 0x29:
                        break;
                    case 0x33:
                        break;
                    case 0x55:
                        break;
                    case 0x65:
                        break;
                }
        
                break;
        
            default:
                throw new Error('Unknown opcode ' + opcode);
        }
    }
}

export default CPU;