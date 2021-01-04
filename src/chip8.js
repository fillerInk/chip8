import Monitor from './monitor.js';
import Keyboard from './keyboard.js'; 
import CPU from './cpu.js'; // NEW

const monitor = new Monitor(10);
const keyboard = new Keyboard();
const cpu = new CPU(monitor, keyboard); // NEW

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

function init(){
    console.log("init started")
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;

    cpu.loadSpritesIntoMemory(); // NEW
    cpu.loadRom('BLITZ'); // NEW
    loop = requestAnimationFrame(step);
}

function step(){

    now = Date.now();
    elapsed = now - then;

    if(elapsed > fpsInterval){
        cpu.cycle();
    }

    loop = requestAnimationFrame(step);
}

init();