export class Thunder2D {
    constructor(cnvas){
        this.canvas = cnvas;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5,0.5);

        this.canvasW = this.canvas.getBoundingClientRect().width;
        this.canvasH = this.canvas.getBoundingClientRect().height;

        window.addEventListener('load', ()=>{this.resize();}, false);
        window.addEventListener('resize', ()=>{this.resize();}, false);
    }

    //Creates a canvas with id and appends it to the specified element returning a new instance of this class.
    static createCanvas(el, id, width = 800, height = 600){
        el.append(`<canvas id="${id}" width="${width}" height="${height}"></canvas>`);
        let canvas = $(`#${id}`)[0];
        return new Thunder2D(canvas);
    }

    //FIXME using .content this is not general!
    resize() {
        let canvas = this.canvas;

        var ratio = canvas.width / canvas.height;
    
        let maxWidth = $(".content").width();
    
        var canvas_width = maxWidth;
        var canvas_height = maxWidth / ratio;
        
        canvas.style.width = canvas_width + 'px';
        canvas.style.height = canvas_height + 'px';
    }

    //Drawing functions

    //Draws line on canvas (0,0) is bottom-left corner (1,1) is top-right corner
    //Thus coordinates are in percentage
    drawLineFromTo(ix, iy, fx, fy){
        this.ctx.moveTo(ix*this.canvasW, (1-iy)*this.canvasH);
        this.ctx.lineTo(fx*this.canvasW, (1-fy)*this.canvasH);
        this.ctx.stroke();
    }

    //Draws Line from initial point at an angle (rad) for some distance
    drawLine(ix, iy, angle, distance){
        let fx = ix + Math.cos(angle)*distance;
        let fy = iy + Math.sin(angle)*distance;
        this.drawLineFromTo(ix, iy, fx, fy);
        return {x:fx, y:fy};
    }

    //Draws an arrow
    drawArrow(ix, iy, angle, mag, arrowsize=0.03){
        let finalPoint = this.drawLine(ix, iy, angle, mag);
        let arrowAngle = 30*Math.PI/180.0;
        this.drawLine(finalPoint.x, finalPoint.y, angle-Math.PI-arrowAngle, arrowsize);
        this.drawLine(finalPoint.x, finalPoint.y, angle-Math.PI+arrowAngle, arrowsize);
    }
}