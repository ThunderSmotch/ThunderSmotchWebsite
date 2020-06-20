let div = $('#test\\.js');
div.append('<canvas id="myCanvas" width="800" height="600"></canvas>');

var canvas = $('#myCanvas')[0];
var ctx = canvas.getContext("2d");

//TODO Move canvas stuff to a global script
const canvasW = canvas.getBoundingClientRect().width;
const canvasH = canvas.getBoundingClientRect().height;

ctx.moveTo(0, 0);
ctx.lineTo(canvasW, canvasH);
ctx.stroke(); 

ctx.moveTo(0, canvasH);
ctx.lineTo(canvasW, 0);
ctx.stroke(); 

ctx.moveTo(1, 1);
ctx.lineTo(canvasW, 1);
ctx.stroke();

ctx.moveTo(1, 1);
ctx.lineTo(1, canvasH);
ctx.stroke();

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);

function resize() {
    var ratio = canvas.width / canvas.height;

    let maxWidth = $(".content").width();

    var canvas_width = maxWidth;
    var canvas_height = maxWidth / ratio;

    canvas.style.width = canvas_width + 'px';
    canvas.style.height = canvas_height + 'px';
}