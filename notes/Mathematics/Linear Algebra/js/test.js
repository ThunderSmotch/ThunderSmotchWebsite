import {Thunder2D} from './thunder2d.js';

let div = $('#test\\.js');
let canvas = Thunder2D.createCanvas(div, 'testCanvas');

canvas.click(draw);
draw();

function draw(point=null){
    canvas.clear();
    canvas.drawLineFromTo(0,0,1,1);
    canvas.drawLineFromTo(0,1,1,0);
    canvas.drawLineFromTo(0,0,1,0);
    canvas.drawLineFromTo(0,0,0,1);
    if(point == null){
        canvas.drawArrow(0.5, 0.5, Math.PI/2, 0.3);
    } else {
        let dx = point.x-0.5;
        let dy = point.y-0.5;
        let angle = Math.atan(dy/dx);
        angle = (dx < 0) ? angle + Math.PI: angle;
        let distance = Math.sqrt(dx*dx+dy*dy);
        canvas.drawArrow(0.5, 0.5, angle, distance);
    }
    canvas.write("Testing canvas / Try clicking", 0.5, 0.7, true);
}