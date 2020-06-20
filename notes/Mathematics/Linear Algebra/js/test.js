let div = $('#test\\.js');
div.append('<canvas id="myCanvas" width="800" height="600"></canvas>');

let canvas = $('#myCanvas')[0];
var ctx = canvas.getContext("2d");

const canvasW = canvas.getBoundingClientRect().width;
const canvasH = canvas.getBoundingClientRect().height;

ctx.moveTo(0, 0);
ctx.lineTo(canvasW, canvasH);
ctx.stroke(); 

ctx.moveTo(0, canvasH);
ctx.lineTo(canvasW, 0);
ctx.stroke(); 