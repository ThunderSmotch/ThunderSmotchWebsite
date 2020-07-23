export class Thunder2D {
    constructor(cnvas, id){
        this.id = id;
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
        return new Thunder2D(canvas, id);
    }

    //Resizes the canvas according to parent's width
    resize() {
        let canvas = this.canvas;

        var ratio = canvas.width / canvas.height;
    
        let maxWidth = $("#"+this.id).parent().width();
    
        var canvas_width = maxWidth;
        var canvas_height = maxWidth / ratio;
        
        canvas.style.width = canvas_width + 'px';
        canvas.style.height = canvas_height + 'px';
    }

    //Function that is called to handle a click inside the canvas
    //Calls the handler function with the canvas position where the click occurred
    click(handler){
        $('#'+this.id).click((e)=>{
            let rect = this.canvas.getBoundingClientRect(); 
            let x = (e.clientX - rect.left)/rect.width;
            let y = 1-(e.clientY - rect.top)/rect.height;
            let point = {x: x, y:y};
            handler(point);
        });
    }

    //Drawing functions

    //Clears the entire canvas
    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
    }

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

    //Write text to canvas
    write(text, x=0, y=0.9, center=false){
        let cx = x*this.canvasW;
        let cy = (1-y)*this.canvasH;

        this.ctx.font = "20px Roboto";
        this.ctx.textAlign = center ? "center":"start";
        this.ctx.fillText(text, cx, cy);
    }
}