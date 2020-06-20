import {Thunder2D} from './thunder2d.js';

let div = $('#test\\.js');
let canvas = Thunder2D.createCanvas(div, 'testCanvas');

canvas.drawLineFromTo(0,0,1,1);
canvas.drawLineFromTo(0,1,1,0);

canvas.drawLineFromTo(0,0,1,0);
canvas.drawLineFromTo(0,0,0,1);

canvas.drawArrow(0.5, 0.5, Math.PI/2, 0.3);

/*
$('#testCanvas').click((e)=>{
    let rect = canvas.getBoundingClientRect(); 
    let x = (e.clientX - rect.left)/rect.width;
    let y = 1-(e.clientY - rect.top)/rect.height;
    
    let dx = x-0.5;
    let dy = y-0.5;
    let angle = Math.atan(dy/dx);
    angle = (dx < 0) ? angle + Math.PI: angle;
    let distance = Math.sqrt(dx*dx+dy*dy);
    drawArrow(0.5, 0.5, angle, distance);
});*/