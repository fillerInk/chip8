import Monitor from './monitor.js';

const monitor = new Monitor(10);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

function init(){
    console.log("init started")
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    
    monitor.testRender();
    monitor.render();

    loop = requestAnimationFrame(step);
}

function step(){

    now = Date.now();
    elapsed = now - then;

    if(elapsed > fpsInterval){

    }

    loop = requestAnimationFrame(step);
}

init();