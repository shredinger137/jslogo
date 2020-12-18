/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */
//NOTE: getValue does not return false if something doesn't exist - it returns an error
//maybe false or undefined would be better, and more in line with expectations?
//Also this means the conditionals used for graphing aren't right.

//TODO: push to array would be a nice function to have, and much more sensible than "se" everytime

import Tokenizer from './Tokenizer';
import turtleMath from './turtleMath';
import { includes } from './includes';


Number.prototype.mod = function (n) { return ((this % n) + n) % n; }

var constants = {
    black: '-9999&0', white: '-9999&100', red: '0&50', green: '30&50', blue: '70&50',
    cyan: '50&50', magenta: '90&50', yellow: '20&50', orange: '14&50'
}
var port;
var reader;
var flushtime = 200;
var outputStream;

export default class Interpreter {

    constructor(canvasHeight, canvasWidth, addToChart, pushToTable, updateLogoVariables, pushNewChartData, updateChartOptions, updateChartType) {

        this.updateLogoVariables = updateLogoVariables;

        //charts are given assigned variables for data; these are effectively listened for in 'make', so that 
        //if the variable in question is one of the chart data ones we know to update the chart data in our app.

        //Note that we enable charts in steps. Currently, for example, more than one data field can't be pushed up.
        //We'll need to allow for an arbitrary number of data lists later on, which may require refactoring some stuff.
        //Sorry.

        this.updateChartOptions = updateChartOptions;
        this.updateChartType = updateChartType;

        this.singleChartXVariable = "";
        this.topChartXVariable = "";
        this.bottomChartXVariable = "";

        this.singleChartYVariable = "";
        this.topChartYVariable = "";
        this.bottomChartYVariable = "";

        this.pushNewChartData = pushNewChartData;

        this.allReceivedData = [0];
        this.ticker = this.ticker.bind(this);
        this.isDone = this.isDone.bind(this);

        this.addToChart = addToChart;
        this.pushToTable = pushToTable;
        //turtle

        this.cnvWidth = canvasWidth;
        this.cnvHeight = canvasHeight;
        // this.img;
        this.ctx = document.getElementById('canvas');
        this.xcor = 0;
        this.ycor = 0;
        //this.element;
        this.heading = 0;
        this.color = 0;
        //shade started off at 50 in the previous version. Unclear on why. Zero works a lot better, 50 kept giving us red.
        this.shade = 50;
        this.opacity = 1;
        this.pendown = true;
        this.pensize = 1;
        this.size = 70;
        this.font = "sans-serif";
        this.fontsize = 30;
        this.dpi = 1;
        this.zoom = 1;
        this.snaps = {};
        this.scatterChart = "";
        this.colors = [
            0xFF0000, 0xFF0D00, 0xFF1A00, 0xFF2600, 0xFF3300, 0xFF4000, 0xFF4D00, 0xFF5900, 0xFF6600, 0xFF7300,
            0xFF8000, 0xFF8C00, 0xFF9900, 0xFFA600, 0xFFB300, 0xFFBF00, 0xFFCC00, 0xFFD900, 0xFFE600, 0xFFF200,
            0xFFFF00, 0xE6FF00, 0xCCFF00, 0xB3FF00, 0x99FF00, 0x80FF00, 0x66FF00, 0x4DFF00, 0x33FF00, 0x1AFF00,
            0x00FF00, 0x00FF0D, 0x00FF1A, 0x00FF26, 0x00FF33, 0x00FF40, 0x00FF4D, 0x00FF59, 0x00FF66, 0x00FF73,
            0x00FF80, 0x00FF8C, 0x00FF99, 0x00FFA6, 0x00FFB3, 0x00FFBF, 0x00FFCC, 0x00FFD9, 0x00FFE6, 0x00FFF2,
            0x00FFFF, 0x00F2FF, 0x00E6FF, 0x00D9FF, 0x00CCFF, 0x00BFFF, 0x00B3FF, 0x00A6FF, 0x0099FF, 0x008CFF,
            0x0080FF, 0x0073FF, 0x0066FF, 0x0059FF, 0x004DFF, 0x0040FF, 0x0033FF, 0x0026FF, 0x001AFF, 0x000DFF,
            0x0000FF, 0x0D00FF, 0x1A00FF, 0x2600FF, 0x3300FF, 0x4000FF, 0x4D00FF, 0x5900FF, 0x6600FF, 0x7300FF,
            0x8000FF, 0x8C00FF, 0x9900FF, 0xA600FF, 0xB300FF, 0xBF00FF, 0xCC00FF, 0xD900FF, 0xE600FF, 0xF200FF,
            0xFF00FF, 0xFF00E6, 0xFF00CC, 0xFF00B3, 0xFF0099, 0xFF0080, 0xFF0066, 0xFF004D, 0xFF0033, 0xFF001A,
            0xFF0000];


        //procs js
        var t = this;

        this.procs = document.getElementById("procs");
        this.procs.onfocus = function () { this.focused = true; };
        this.procs.onblur = function () { this.focused = false; t.readProcs() };
        this.procs.onkeydown = handleKeyDown;

        function handleKeyDown(e) {
            if (e.ctrlKey) {
                if (e.keyCode == 70) { e.preventDefault(); e.stopPropagation(); this.focus(); }
                if (e.keyCode == 71) { e.preventDefault(); e.stopPropagation(); t.readProcs(); this.runLine('go'); }
                if (e.keyCode == 190) { this.insert('stopped!\n'); this.reset([]); }
            }
        }

        //logo js
        this.evline = [];
        this.cfun = undefined;
        this.arglist = [];
        this.priority = 0;
        this.stack = [];
        this.frame = [];
        this.locals = [{}];
        this.hold = false;
        this.timeout = undefined;
        this.clockspeed = 1;

        //cc js
        this.commandConsole = document.getElementById('cc');
        this.commandConsole.autocapitalize = 'off';
        this.commandConsole.autocorrect = 'off';
        this.commandConsole.autocomplete = 'off';
        this.commandConsole.spellcheck = false;
        this.commandConsole.focused = false;

        this.commandConsole.selectionStart = this.commandConsole.value.length + 1;
        this.commandConsole.selectionEnd = this.commandConsole.value.length + 1;

        this.respfcn = undefined;
        this.respCount = 0;
        this.resp = [];
        this.respStr = '';
        this.fe = undefined;

    }


    openText() {

    }


    setup() {

        var t = this;
        //commented out sept. 2020 - doesn't seem to be needed
        // var procs = document.getElementById('procs');
        // procs.focus();
        this.element = document.createElement('div');
        this.element.setAttribute('class', 'turtle');
        var cnvframe = document.getElementById('cnvframe');
        cnvframe.appendChild(t.element);
        this.img = document.createElement('img');
        this.img.src = 'turtle.svg';
        this.element.appendChild(t.img);
        this.img.onload = imgLoaded;
        var canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        canvas.width = t.cnvWidth * t.dpi;
        canvas.height = t.cnvHeight * t.dpi;
        t.ctx.scale(t.dpi, t.dpi);
        t.ctx.textBaseline = "middle";
        t.clean();
        window.requestAnimationFrame(this.ticker);



        function imgLoaded() {
            t.img.width = t.size;
            t.img.height = t.size;
            t.element.style.width = t.size + 'px';
            t.element.style.height = t.size + 'px';
            t.move();
        }

    }

    setChartListener(axis, variable) {

        var t = this;
        //maybe make these objects, instead of a bunch of string? Might help when we expand this to be general.

        if (t.getValue("_chartType")) {
            if (axis == "x") {
                //if axis is x, figure out which chart this is
                if (t.getValue("_chartType") == "single") {
                    t.singleChartXVariable = variable;
                }
                if (t.getValue("_chartType") == "bottom") {
                    t.bottomChartXVariable = variable;
                }
                if (t.getValue("_chartType") == "top") {
                    t.topChartXVariable = variable;
                }
            } else {
                //if axis isn't x, we assume it's y and check which chart this is 
                if (t.getValue("_chartType") == "single") {
                    t.singleChartYVariable = variable;
                }
                if (t.getValue("_chartType") == "top") {
                    t.topChartYVariable = variable;

                }
                if (t.getValue("_chartType") == "bottom") {
                    t.bottomChartYVariable = variable;
                }
            }

        } else {
            throw "Chart not defined";
        }


    }

    initPlot() {

        //Get plot type
        var chartType = (this.getValueInternal("_chartType"));

        //get options and create an object we can read on the other side
        if (this.getValueInternal("_xLabel")) {
            var xLabel = (this.getValueInternal("_xLabel"));
        } else {
            var xLabel = "";
        }

        if (this.getValueInternal("_yLabel")) {
            var yLabel = (this.getValueInternal("_yLabel"));
        } else {
            var yLabel = "";
        }

        var ticks = {
            dummy: null
        };

        var rangeSetting = this.getValueInternal("_range");
        if (rangeSetting && Array.isArray(rangeSetting) && rangeSetting.length >= 2) {
            ticks["min"] = rangeSetting[0];
            ticks["max"] = rangeSetting[1];
        }

        var chartOptions = {
            xLabel: xLabel,
            yLabel: yLabel,
            ticks: ticks,
        }

        //update view based on plot type; we know that top and bottom means double view
        if (chartType == "single") {
            this.updateChartType("single");
            this.updateChartOptions("single", chartOptions);

        }

        else if (chartType == "top" || chartType == "bottom") {
            this.updateChartType("double");
            if (chartType == "top") {
                this.updateChartOptions("top", chartOptions);
            } else {
                this.updateChartOptions("bottom", chartOptions);
            }
            this.setValue("_range", null)
            this.setValue("_xLabel", null)
            this.setValue("_yLabel", null)
            //this should reset the variables maybe?

        } else {
            
        }

    }

    handleCCKeyDown(e) {
        var k = e.keyCode;
        if (k == 13) {
            if (e.shiftKey) this.insertcr(e);
            else this.handlecr(e);
        }
        if (e.ctrlKey) {
            if (e.keyCode == 70) { e.preventDefault(); e.stopPropagation(); }
            if (e.keyCode == 71) { e.preventDefault(); e.stopPropagation(); this.runLine('go'); }
            if (e.keyCode == 190) { this.insert('stopped!\n'); this.reset([]); }
        }
    }

    handlecr(e) {
        var pos = document.getElementById('cc').selectionStart;
        var t = document.getElementById('cc').value;
        var start = t.lastIndexOf('\n', pos - 1), end = t.indexOf('\n', pos);
        if (end < 0) end = t.length;
        document.getElementById('cc').selectionStart = end + 1;
        if (end != t.length) e.preventDefault();
        var str = t.substring(start + 1, end);
        this.runLine(str);
    }

    insertcr(e) {
        e.preventDefault();
        var pos = document.getElementById('cc').selectionStart;
        var t = document.getElementById('cc').value;
        var before = t.substring(0, pos);
        var after = t.substring(pos);
        document.getElementById('cc').value = before + '\n' + after;
        document.getElementById('cc').selectionStart = pos + 1;
        document.getElementById('cc').selectionEnd = pos + 1;
    }

    /////////////////////////
    //
    // Turtle
    //
    /////////////////////////


    forward(n) {

        console.log("in forward");

        var t = this;
        if (t.pendown) {
            t.ctx.beginPath();
            t.ctx.moveTo(t.xcor + t.cnvWidth / 2, t.cnvHeight / 2 - t.ycor);

        }
        t.xcor += n * turtleMath.sindeg(t.heading);
        t.ycor += n * turtleMath.cosdeg(t.heading);
        if (t.pendown) {
            var sx = t.xcor + t.cnvWidth / 2, sy = t.cnvHeight / 2 - t.ycor;
            if (n >= .1) {
                t.ctx.lineTo(sx, sy);
            }
            else {
                console.log("cond3");
                t.ctx.lineTo(sx, sy + .1);
            }
            if (t.pensize != 0) t.ctx.stroke();
            if (t.fillpath) t.fillpath.push(function () { t.ctx.lineTo(sx, sy); });
        }
    }

    lineto(x, y) {
        console.log("in lineto");
        var t = this;
        if (t.pendown) {
            t.ctx.beginPath();
            t.ctx.moveTo(t.xcor + t.cnvWidth / 2, t.cnvHeight / 2 - t.ycor);
        }
        t.xcor = x;
        t.ycor = y;
        if (t.pendown) {

            var sx = t.xcor + t.cnvWidth / 2, sy = t.cnvHeight / 2 - t.ycor;
            if ((x + y) >= .1) t.ctx.lineTo(sx, sy);
            else t.ctx.lineTo(sx, sy + .1);
            if (t.pensize != 0) t.ctx.stroke();
            if (t.fillpath) {
                console.log("pushing from lineto into fillpath");
                t.fillpath.push(function () { t.ctx.lineTo(sx, sy); });
                
            }
        }
    }

    setxy(x, y) {
        var t = this;
        t.xcor = x;
        t.ycor = y;
        var sx = t.xcor + t.cnvWidth / 2, sy = t.cnvHeight / 2 - t.ycor;
        if (t.fillpath) t.fillpath.push(function () { this.ctx.moveTo(sx, sy); });
    }

    right(n) { this.seth(this.heading + n); }
    left(n) { this.seth(this.heading - n); }
    seth(a) {
        this.heading = a;
        this.heading = (this.heading % 360);
    }

    arc(a, r) {
        var t = this;
        if (a == 0) return;
        if (r == 0) { t.seth(t.heading + a); }
        else if (a < 0) leftArc(a, r);
        else rightArc(a, r);

        function rightArc(a, r) {
            var sgn = r / Math.abs(r);
            var ar = Math.abs(r);
            var dx = ar * turtleMath.cosdeg(t.heading);
            var dy = ar * turtleMath.sindeg(t.heading);
            var cx = t.xcor + dx;
            var cy = t.ycor - dy;
            if (t.pendown) {
                var sx = t.cnvWidth / 2 + cx, sy = t.cnvHeight / 2 - cy;
                var astart = turtleMath.rad(t.heading + 180.0), aend = turtleMath.rad(t.heading + 180 + a * sgn);
                if ((a % 360) == 0) aend += .0001;
                var dir = r < 0;
                t.ctx.beginPath();
                t.ctx.moveTo(t.xcor + t.cnvWidth / 2, t.cnvHeight / 2 - t.ycor);
                t.ctx.arc(sx, sy, ar, astart, aend, dir);
                if (t.pensize != 0) t.ctx.stroke();
                if (t.fillpath) t.fillpath.push(function () { this.ctx.arc(sx, sy, ar, astart, aend, dir); });
            }
            t.seth(t.heading + a * sgn);
            t.xcor = cx - ar * turtleMath.cosdeg(t.heading);
            t.ycor = cy + ar * turtleMath.sindeg(t.heading);
        }

        function leftArc(a, r) {
            var sgn = r / Math.abs(r);
            var ar = Math.abs(r);
            var dx = ar * turtleMath.cosdeg(t.heading);
            var dy = ar * turtleMath.sindeg(t.heading);
            var cx = t.xcor - dx;
            var cy = t.ycor + dy;
            if (t.pendown) {
                var sx = t.cnvWidth / 2 + cx, sy = t.cnvHeight / 2 - cy;
                var astart = turtleMath.rad(t.heading), aend = turtleMath.rad(t.heading + a * sgn);
                var dir = r >= 0;
                if ((a % 360) == 0) aend += .0001;
                t.ctx.beginPath();
                t.ctx.moveTo(t.xcor + t.cnvWidth / 2, t.cnvHeight / 2 - t.ycor);
                t.ctx.arc(sx, sy, ar, astart, aend, dir);
                if (t.pensize != 0) t.ctx.stroke();
                if (t.fillpath) t.fillpath.push(function () { this.ctx.arc(sx, sy, ar, astart, aend, dir); });
            }
            t.seth(t.heading + a * sgn);
            t.xcor = cx + ar * turtleMath.cosdeg(t.heading);
            t.ycor = cy - ar * turtleMath.sindeg(t.heading);
        }
    }

    showTurtle() { this.element.style.visibility = 'visible'; }
    hideTurtle() { this.element.style.visibility = 'hidden'; }

    /////////////////////////
    //
    // Pen
    //
    /////////////////////////

    fillscreen(c, s) {

        if ((typeof c) == 'object') c = c[0];
        this.setCtxColorShade(c, s);
        this.ctx.fillRect(0, 0, this.cnvWidth, this.cnvHeight);
        this.setCtxColorShade(this.color, this.shade);
    }

    setcolor(c) {

        if ((typeof c) == 'object') { this.color = c[0]; this.shade = c[1]; }
        else this.color = c;
        this.setCtxColorShade(this.color, this.shade);
    }

    setshade(sh) {
        this.shade = sh;
        this.setCtxColorShade(this.color, this.shade);
    }

    setpensize(ps) {
        this.pensize = ps;
        this.ctx.lineWidth = Math.abs(this.pensize);
    }

    startfill() {
        var t = this;
        console.log(t.ctx);
        this.fillpath = [];
        var sx = this.xcor + this.cnvWidth / 2, sy = this.cnvHeight / 2 - this.ycor;
        this.fillpath.push(function () { t.ctx.moveTo(sx, sy); });
    }

    endfill() {
        console.log("hit endfill");
        if (!this.fillpath) return
        console.log("end 2");
        this.ctx.beginPath();
        console.log("end3");
        for (var i in this.fillpath) {
            console.log("end4");
            if (i > 2000) break;
            console.log("end5");
            console.log(this.fillpath);
            this.fillpath[i]();
            console.log("end6")
        }
        this.ctx.globalAlpha = this.opacity;
        console.log("end7");
        this.ctx.fill();
        console.log("end8");
        this.ctx.globalAlpha = 1;
        console.log("end9");
        this.fillpath = undefined;
        console.log("end end");
    }

    setlinedash(l) {
        this.ctx.setLineDash(l);
    }

    /////////////////////////
    //
    // Text
    //
    /////////////////////////

    drawString(str) {
        var t = this;
        t.ctx.save();
        this.ctx.translate(t.xcor + t.cnvWidth / 2, t.cnvHeight / 2 - t.ycor);
        t.ctx.rotate(turtleMath.rad(t.heading));
        t.ctx.fillText(str, 0, 0);
        t.ctx.restore();
    }

    drawLine(x, y) {
        console.log("in drawLine");
        var canvasElement = document.getElementById("testcanvas");
        var canvas = canvasElement.getContext("2d");
        canvas.beginPath();
        canvas.moveTo(0, 0);
        canvas.lineTo(x, y);
        canvas.stroke();
    }

    setfont(f) {
        this.font = f;
        this.ctx.font = this.fontsize + 'px ' + f;
    }

    setfontsize(s) {
        this.fontsize = s;
        this.ctx.font = s + 'px ' + this.font;
    }


    /////////////////////////
    //
    //  Basic stuff
    //
    /////////////////////////

    move() {

        var t = this;
        if (!t.img.complete) return;
        var img = t.element.firstChild;

        var dx = screenLeft();
        var dy = screenTop();
        var s = 1;

        t.element.style.webkitTransform = `translate(${dx}px, ${dy}px) rotate(${t.heading}deg) scale(${s}, ${s})`;
        // 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + t.heading + 'deg)' + ' scale(' + s + ',' + s + ')';
        t.element.left = dx;
        t.element.top = dy;

        console.log(t.xcor, t.ycor);
        console.log(t.cnvWidth, t.canvasHeight);
        if(t.ycor > (t.cnvHeight / 2) || t.ycor < ((t.cnvHeight / 2) * -1) || t.xcor > (t.cnvWidth /2) || t.xcor < ((t.cnvWidth / 2) * -1 )){
            t.element.style.visibility = "hidden";
            t.outOfBounds = true;
        } else {
            if(t.outOfBounds == true){
                t.element.style.visibility = "visible";
            }
        }

        function screenLeft() {
            return -img.width / 2 + (t.xcor + t.cnvWidth / 2);
        }
        function screenTop() {
            return -img.height / 2 + (t.cnvHeight / 2 - t.ycor);
        }

    }

    clean() {
        var t = this;
        var t = this;
        this.xcor = 0;
        t.ycor = 0;
        t.heading = 0;
        t.setCtxColorShade(-9999, 98); // #FAFAFA
        t.ctx.fillRect(0, 0, t.cnvWidth, t.cnvHeight);
        t.color = 0;
        t.shade = 50;
        t.setCtxColorShade(t.color, t.shade);
        t.pensize = 4;
        t.ctx.lineWidth = t.pensize;
        t.opacity = 1;
        t.pendown = true;
        t.fillpath = undefined;
        t.ctx.lineCap = 'round';
        t.ctx.lineJoin = 'round';
        t.font = 'sans-serif';
        t.fontsize = 30;
        t.ctx.font = '30px sans-serif';
        t.ctx.textAlign = 'center';
        t.ctx.setLineDash([]);
        t.showTurtle();
    }

    //Random

    oneof(a,b){
        return this.nextRandomDouble()<.5 ? a : b;
    }

    pickRandom(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
       

    /////////////////////////
    //
    // loader
    //
    /////////////////////////

    loadimg(dataurl, fcn) {
        var t = this;
        var ctx = this.ctx;
        var img = new Image();
        img.onload = drawImageToFit;
        img.src = dataurl;

        function drawImageToFit() {
            var s = t.cnvWidth / img.naturalWidth;
            ctx.save();
            ctx.scale(s, s);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
            if (fcn) fcn();
        }
    }

    loadpng(dataurl, fcn) {
        var t = this;
        var ctx = this.ctx;
        var img = new Image();
        img.onload = drawImageToFit;
        img.src = dataurl;

        function drawImageToFit() {
            var code = readHiddenData();
            if (!procs) { var procs = { value: "null" }; }
            procs.value = (code == 'bad sig') ? '' : code;
            var s = t.cnvWidth / img.naturalWidth;
            ctx.save();
            ctx.scale(s, s);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
            this.readProcs();
            if (fcn) fcn();
        }

        function readHiddenData() {
            var cnv = document.createElement("canvas");
            cnv.width = img.naturalWidth;
            cnv.height = img.naturalHeight;
            var ctx = cnv.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
            return ImageData.getImageData(ctx);
        }
    }


    /////////////////////////
    //
    // Low Level
    //
    /////////////////////////

    resize(){

    }


    setCtxColorShade(color, shade) {
        var t = this;
        setCtxColor(mergeColorShade(color, shade));

        function mergeColorShade(color, shade) {
            var sh = Math.abs(shade.mod(200));
            if (sh > 100) sh = 200 - sh;
            if (color == -9999) return blend(0x000000, 0xffffff, sh / 100);
            var c = colorFromNumber(color);
            if (sh == 50) return c;
            else if (sh < 50) return blend(c, 0x000000, (50 - sh) / 60);
            else return blend(c, 0xffffff, (sh - 50) / 53);
        }

        function colorFromNumber(c) {
            var mc = c.mod(100);
            var ic = Math.floor(mc);
            var fract = mc - ic;
            return blend(t.colors[ic], t.colors[ic + 1], fract);
        }

        function blend(a, b, s) {
            var ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
            var br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
            var rr = Math.round(ar * (1 - s) + br * s);
            var rg = Math.round(ag * (1 - s) + bg * s);
            var rb = Math.round(ab * (1 - s) + bb * s);
            return (rr << 16) + (rg << 8) + rb;
        }

        function setCtxColor(c) {
            var cc = '#' + (c + 0x1000000).toString(16).substring(1);
            t.ctx.strokeStyle = cc;
            t.ctx.fillStyle = cc;
        }

    }

    parse(s) { return new Tokenizer(s).tokenize(); }

    //procs js
    readProcs() {
        var procs = document.getElementById("procs").value;
        var toBeEvaluated = procs + "\n" + includes;
        this.procString(toBeEvaluated, 'normal');

    }

    //The only difference I saw so far was that Tokenize was called from the class before, and that's been replaced. Still not evaluating arguments passed to words.

    procString(str, type) {
        gatherSource();
        parseProcs();

        function gatherSource() {
            var thisproc = undefined;
            for (var i in prims) if ((prims[i].type) == 'normal') delete prims[i];
            var lines = str.split('\n');
            for (var j = 0; j < lines.length; j++) procLines(lines[j]);


            //TODO: This isn't passing values as arguments when words are defined. Meaning 'to something :n' doesn't see :n as having a value when you call 'something 5'.

            function procLines(l) {
                var sl = Tokenizer.parse(l);
                if ((sl[0] == 'to') && (sl[1] != undefined)) {
                    thisproc = sl[1];
                    prims[thisproc] = { nargs: sl.length - 2 };
                    prims[thisproc].fcn = '';
                    prims[thisproc].inputs = sl.slice(2);
                    prims[thisproc].type = type;
                    return;
                }
                else if (sl[0] == 'end') { thisproc = undefined; return; }
                if (thisproc == undefined) return;
                prims[thisproc].fcn += (l + '\n');
                if (thisproc == "something") {
                }
            }
        }

        function parseProcs() {
            for (var p in prims) {
                var prim = prims[p];
                var fcn = prim.fcn;
                if ((typeof fcn) != 'string') continue;

                if (prim.parsed) continue;
                prim.parsed = Tokenizer.parse(fcn);


                for (var i in prim.inputs) {
                    if (prim.inputs[i].substring(0, 1) == ':') prim.inputs[i] = prim.inputs[i].substring(1);
                }
            }
        }
    }




    //Ticker is the main loop - it continuously runs and updates movement, evaluating as it goes. Similar to frame updates in game frameworks.
    //'Hold' freezes evaluation and shows up in other functions; move is turtle specific.

    ticker() {
        if (!this.isDone()) {
            var end = this.now() + flushtime;
            while (this.now() < end) {
                if (this.hold) break;
                if (this.isDone()) break;
                this.evalNext();
            }
            this.move();
        }
        window.requestAnimationFrame(this.ticker);
    }


    //logo js
    reset(l) {
        this.evline = l;
        this.cfun = undefined;
        this.arglist = [];
        this.priority = 0;
        this.stack = [];
        this.frame = [];


        //This locals line had previously been commented out, as it broke make, but it seems to be working now. Delete this comment if it doesn't come up again.
        //Commented August 2020
        //NOTE: This locals line is still very suspicious. I still don't know why it exists or what, exactly, it's for.
        this.locals = [this.last(this.locals)];

        this.hold = false;
        if (this.timeout != undefined) clearTimeout(this.timeout);
        this.timeout = undefined;
    }

    printToConsole(x) {
        var cc = document.getElementById("cc");
        if(cc !== null){
            cc.value = cc.value + x + "\n";
            cc.scrollTop = cc.scrollHeight;
        }
    }

    evalNext() {
        var t = this;
        try {
            if (t.cfun) {
                if (t.arglist.length == prims[t.cfun].nargs) { funcall(); return; }
                if ((prims[t.cfun].nargs == 'ipm') && (t.evline[0] == ')')) { t.evline.shift(); funcall(); return }
            }
            if (t.evline.length == 0) {
                if (t.cfun == undefined) t.evalEOL();
                else throw 'error: not enough inputs to ' + t.cfun;
                return;
            }
            var token = t.evline.shift();
            if ((typeof token) == 'string') evalString();
            else t.pushResult(token);
        }
        catch (e) {
            this.printToConsole(e);
            t.stack = [];
            t.evline = [];
        }

        function evalString() {
            if (token.substring(0, 1) == ':') t.pushResult(t.getValue(token.substring(1)));
            else if (token.substring(0, 1) == '"') t.pushResult(token.substring(1));
            else if ((token.substring(0, 1) == "'") && (token.slice(-1) == "'")) t.pushResult(token.substring(1, token.length - 1));
            else if (constants[token]) t.pushResult(constants[token]);
            else {
                if (token == '(') handleParend();
                if (prims[token] == undefined) throw "error: I don't know how to " + token;
                t.stack.push(t.cfun);
                t.stack.push(t.arglist);
                t.stack.push(t.priority);
                t.cfun = token;
                t.arglist = [];
                t.priority = 0;
            }

            function handleParend() {
                if (t.evline[0] == 'se') { t.evline.shift(); token = 'se '; }
                else token = '( ';
            }
        }

        function funcall() {
            if (prims[t.cfun].flow) prims[t.cfun].fcn.apply(t, t.arglist);
            else if ((typeof prims[t.cfun].fcn) == 'function') primCall();
            else if ((typeof prims[t.cfun].fcn) == 'string') procCall();
        }


        function primCall() {
            var arglist = t.arglist;
            var prim = t.cfun;
            var res = prims[t.cfun].fcn.apply(t, arglist);
            t.priority = t.stack.pop();
            t.arglist = t.stack.pop();
            t.cfun = t.stack.pop();
            if ((res == undefined) && (t.cfun != undefined)) throw "error:" + prim + " didn't output to " + t.cfun;
            t.pushResult(res);
        }

        function procCall() {
            var cfun = t.cfun, arglist = t.arglist;
            t.stack.push(t.evline);
            t.stack.push(t.frame);
            t.frame = [].concat(t.stack);
            bindArgs();
            t.evalLine(prims[cfun].parsed, t.procOutput);

            function bindArgs() {
                var bindings = {};
                var inputs = prims[cfun].inputs;
                for (var i in inputs) bindings[inputs[i]] = arglist[i];
                t.locals.unshift(bindings);
            }
        }
    }

    pushResult(res) {
        var t = this;
        if (res == undefined) return;
        if (t.cfun == undefined) throw "warning: you don't say what to do with " + t.printstr(res);
        if (isInfixNext()) infixCall(res);
        else t.arglist.push(res);

        function infixCall(arg) {
            t.stack.push(t.cfun);
            t.stack.push(t.arglist);
            t.stack.push(t.priority);
            t.cfun = t.evline.shift();
            t.arglist = [arg];
            t.priority = prims[t.cfun].priority;
        }

        function isInfixNext() {
            if (t.evline.length == 0) return false;
            var token = t.evline[0];
            if (prims[token] == undefined) return false;
            if (prims[token].priority == undefined) return false;
            return (prims[token].priority < t.priority);
        }
    }

    getValue(name) {

        for (var i in this.locals) {
            if (this.locals[i][name] != undefined) return this.locals[i][name];
        }

        throw 'warning: ' + name + ' has no value';
    }

    //unlike the Logo version, this returns false if values do not exist
    //seems redundant but... here we are. 
    getValueInternal(name) {

        for (var i in this.locals) {
            if (this.locals[i][name] != undefined) {
                return this.locals[i][name];
            }
        }

        return false;
    }


    setValue(name, value) {
        var updateChart = false;
        var t = this;
        var chartType = [];

        if(name == this.singleChartXVariable || name == this.singleChartYVariable){
            updateChart = true;
            chartType.push("single");
        }

        if(name == this.topChartXVariable || name == this.topChartYVariable){
            updateChart = true;
            chartType.push("top");
        }

        if(name == this.bottomChartXVariable || name == this.bottomChartYVariable){
            updateChart = true;
            chartType.push("bottom");
        }

        for (var i in t.locals) {
            if (t.locals[i][name] != undefined) {
                t.locals[i][name] = value;
                if (updateChart) {
                    for(var type of chartType){
                        this.updateChartData(type);
                    }
                    
                }
                return;
            }
        }
        t.locals[t.locals.length - 1][name] = value;

        if (updateChart) {
            for(var type of chartType){
                this.updateChartData(type);
            }
        }

        //this.updateLogoVariables(t.locals[0]);
        //TODO: Uncomment to enable local variables in user facing app.
    }

    makeLocal(name) { this.locals[0][name] = 0; }



    updateChartData(chartType) {
        var t = this;
        var chartData = [];
        var counter = 1;
        var xDataArray = [];
        var yDataArray = [];

        if(chartType == "single"){
            xDataArray = t.getValueInternal(this.singleChartXVariable);
            yDataArray = t.getValueInternal(this.singleChartYVariable);
        }
        if(chartType == "top"){
     
            xDataArray = this.getValueInternal(this.topChartXVariable);
            yDataArray = this.getValueInternal(this.topChartYVariable);

        }
        if(chartType == "bottom"){
            xDataArray = this.getValueInternal(this.bottomChartXVariable);
            yDataArray = this.getValueInternal(this.bottomChartYVariable);
        }

        if(!xDataArray){
            xDataArray = [];
        }
        
        if(!yDataArray){
            yDataArray = [];
        }

        if (xDataArray) {
            if (yDataArray) {
                for (var xValue of xDataArray) {
                    if (yDataArray[counter]) {
                        chartData.push({ x: xValue, y: yDataArray[counter] });
                        counter++;
                    }
                }
            }
            t.pushNewChartData(chartType, chartData);
        }


    }



    procOutput(t, x) {
        if (t.frame.length == 0) {
            if (x != undefined) throw "error: output can only be used in a procedure.";
            this.reset([]);
            return;
        }
        t.stack = t.frame;
        t.frame = t.stack.pop();
        t.evline = t.stack.pop();
        t.priority = t.stack.pop();
        t.arglist = t.stack.pop();
        t.cfun = t.stack.pop();
        //t.locals.shift();
        t.pushResult(x);
    }

    evalLine(l, next) {
        var t = this;
        t.stack.push(t.cfun);
        t.stack.push(t.arglist);
        t.stack.push(t.evline);
        t.stack.push(next);
        t.cfun = undefined;
        t.arglist = [];
        t.evline = [].concat(l);
    }

    evalEOL() {
        var t = this;
        if (t.stack.length == 0) return;
        var next = t.stack.pop();
        t.evline = t.stack.pop();
        t.arglist = t.stack.pop();
        t.cfun = t.stack.pop();
        next(t);
    }

    flowEnd() {
        var t = this;
        var prim = t.cfun;
        t.priority = t.stack.pop();
        t.arglist = t.stack.pop();
        t.cfun = t.stack.pop();
        if (t.cfun != undefined) throw "error: " + prim + " didn't output to " + t.cfun;
    }

    repeat(n, l) {
        n = Math.round(this.getnum(n));
        this.stack.push(n);
        this.stack.push(l);
        repeatAgain(this);

        function repeatAgain(t) {
            var l = t.stack.pop();
            var n = t.stack.pop();
            if (n <= 0) { t.flowEnd(); return; }
            t.stack.push(--n);
            t.stack.push(l);
            t.evalLine(l, repeatAgain);
        }
    }

    loop(l) {
        this.stack.push(l);
        loopAgain(this);

        function loopAgain(t) {
            var l = t.stack.pop();
            t.stack.push(l);
            t.evalLine(l, loopAgain);
        }
    }

    logo_run(l) {
        var t = this;
        t.evalLine(l, next);

        function next() {
            t.flowEnd();
        }
    }

    logo_if(b, l) {
        var t = this;
        if (!b) t.flowEnd();
        else t.evalLine(l, next);

        function next() {
            t.flowEnd();
        }
    }

    logo_ifelse(b, l1, l2) {
        var t = this;
        if (b) t.evalLine(l1, next);
        else t.evalLine(l2, next);

        function next() {
            t.flowEnd();
        }
    }

    ipm_se(l) {
        var res = [];
        for (var i = 0; i < l.length; i++) res = res.concat(l[i]);
        return res;
    }

    item(n, l) {
        n = this.getnum(n);
        if ((typeof l) == 'object') return l[n - 1];
        return String(l).substring(n - 1, n);
    }

    first(l) {
        if ((typeof l) == 'object') return l[0];
        return String(l).substring(0, 1);
    }

    butfirst(l) {
        if ((typeof l) == 'object') return l.slice(1);
        return String(l).substring(1);
    }

    last(l) {
        if (l && (typeof l) == 'object') return l[l.length - 1];
        return String(l).substring(String(l).length - 1);
    }

    butlast(l) {
        if ((typeof l) == 'object') return l.slice(0, -1);
        return String(l).substring(0, String(l).length - 1);
    }

    count(l) {
        if ((typeof l) == 'object') return l.length;
        return String(l).length;
    }

    word(a, b) {
        if ((typeof a) == 'object') a = a.join(' ');
        if ((typeof b) == 'object') b = b.join(' ');
        return String(a) + String(b);
    }

    member(x, l) {
        if ((typeof l) == 'object') {
            for (var i = 0; i < l.length; i++) { if (this.equals(x, l[i])) return true; }
            return false;
        }
        return String(l).indexOf(x) != -1;
    }

    time() {
        var now = this.getDate();
        var hour = now.getHours();
        if (hour == 0) hour = 12;
        if (hour > 12) hour -= 12;
        return [hour, now.getMinutes(), now.getSeconds()];
    }

    hours() {
        var now = this.getDate();
        var hour = now.getHours();
        var second = now.getSeconds();
        var minute = now.getMinutes();
        if (hour == 0) hour = 12;
        if (hour > 12) hour -= 12;
        hour += minute / 60;
        hour += second / 3600;
        return Math.floor(hour * 100) / 100;
    }

    minutes() {
        var now = this.getDate();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        minute += second / 60;
        return Math.floor(minute * 100) / 100;
    }

    seconds() {
        var now = this.getDate();
        var second = now.getSeconds();
        var millis = now.getMilliseconds();
        second += millis / 1000;
        return Math.floor(second * 100) / 100;
    }

    now() { return new Date().getTime(); }

    getDate() {
        return new Date();
    }

    twoDigit(n) {
        n = Math.floor(this.getnum(n));
        n = n.mod(100) + 100;
        return String(n).substring(1);
    }

    scale(n, l) {
        var len = l.length;
        for (var i = 0; i < len - 1; i++) {
            if (l[0][0] == n) return l[0][1];
            if (l[1][0] > n) {
                var la = l[0];
                var lb = l[1];
                var fract = (n - la[0]) / (lb[0] - la[0]);
                return la[1] + fract * (lb[1] - la[1]);
            }
            l = l.slice(1);
        }
        return n;
    }

    textAlign(str) {
        if (['center', 'left', 'right'].indexOf(str) > -1) this.ctx.textAlign = str;
        else throw "error: " + this.cfun + " doesn't like " + this.printstr(str) + ' as input';
    }


    mwait(n) {
        if (n <= 0) return;
        this.hold = true;
        this.timeout = setTimeout(function () { this.timeout = undefined; this.hold = false; }.bind(this), n);
    }


    printstr(x) {
        var type = typeof x;
        if (type == 'number') return String(Math.round(x * 10000) / 10000);
        if (type == 'object') {
            var res = '';
            for (var i in x) { res += this.printstr(x[i]); res += ' '; }
            return '[' + res.substring(0, res.length - 1) + ']';
        }
        else return String(x);
    }

    getnum(x) {
        var n;
        if (typeof x == "string") {
            if (x.includes("vh")) {
                var cleaned = x.replace("vh", "");
                n = Number(cleaned) / 100 * this.cnvHeight;
            }
            if (x.includes("vw")) {
                var cleaned = x.replace("vw", "");
                n = Number(cleaned) / 100 * this.cnvWidth;
            }
        }
        else {
            n = Number(x);
        }

        if (isNaN(n) || (String(x) == 'false') || (String(x) == 'true')) throw "error: " + this.cfun + " doesn't like " + this.printstr(x) + ' as input';
        return n;
    }

    getlist(x) {
        if ((typeof x) == 'object') return x;
        throw "error: " + this.cfun + " doesn't like " + this.printstr(x) + ' as input';
    }

    getbool(x) {
        if (String(x) == 'false') return false;
        if (String(x) == 'true') return true;
        throw "error: " + this.cfun + " doesn't like " + this.printstr(x) + ' as input';
    }

    getcolor(x) {
        var type = typeof x;
        if (type == 'object') throw "error: " + this.cfun + " doesn't like " + this.printstr(x) + ' as input';
        if (type == 'number') return x;
        var l = x.split('&');
        if (l.length == 1) return Number(x);
        return [Number(l[0]), Number(l[1])];
    }

    equals(a, b) {
        if ((typeof a) != 'object') return a.toString() == b.toString();
        if ((typeof b) != 'object') return a.toString() == b.toString();
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; i++) { if (!this.equals(a[i], b[i])) return false; }
        return true;
    }

    stackPeek(n) { return this.stack[this.stack.length - n - 1]; }
    isDone() { return (this.stack.length == 0) && (this.evline.length == 0); }



    //cc js
    insert(str) {
        var cc = document.getElementById("cc");
        cc.value = cc.value + str;
    }

    runLine(str) {
        var line = this.parse(str);
        this.reset(line);
    }


    //comms js


    readSensor(n) {
        this.hold = true;
        this.sendReceive([0xc0 + n], 2, this.gotsensor);
        //   this.readADC(n, this.gotsensor);  readADC didn't seem necessary here
    }

    gotsensor(x) {
        var val = x[0] + 256 * x[1];
        this.arglist.pop();
        this.arglist.push(val);
        this.hold = false;
    }

    readPin(n) {
        this.hold = true;
        this.dread(n, this.gotpin);
    }

    gotpin(x) {
        this.arglist.pop();
        this.arglist.push(x[0] == 0);
        this.hold = false;
    }

    ping(fcn) {
        var cmd = [0xff];
        this.sendReceive(cmd, 1, fcn);
    }

    calibrate(calibrateValues, valueToCalibrate) {
        if (Array.isArray(calibrateValues)) {
            if (calibrateValues.length == 4) {
                //we assume the format is adcvalue1, realvalue1, adcvalue2, realvalue2
                var slope = (calibrateValues[1] - calibrateValues[3]) / (calibrateValues[0] - calibrateValues[2]);
                var value = calibrateValues[1] + (valueToCalibrate - calibrateValues[0]) * slope;
                return (Math.floor(value * 100) / 100);
            }
            //no error handling; seems like a TODO
        }

    }

    rb(addr, fcn) {
        var cmd = [].concat(0xfe, this.twobytes(addr));
        this.sendReceive(cmd, 1, fcn);
    }

    wb(addr, data) {
        var cmd = [].concat(0xfd, this.twobytes(addr), 1, data);
        this.sendl(cmd);
    }

    pinOn(n) {
        this.sendl([0xe0 + n]);
    }
    pinOff(n) { this.sendl([0xd0 + n]); }
    ledOn() { this.sendl([0xef]); }
    ledOff() { this.sendl([0xdf]); }

    readADC(n, fcn) {
        return this.sendReceive([0xc0 + n], 2, fcn);
    }
    dread(n, fcn) { this.sendReceive([0xc0 + n], 1, fcn); }

    redraw(l) { this.sendl([].concat(0xb0, l)); }
    dotbrightness(b) { this.sendl([0xb1, b]); }


    twobytes(n) { return [n & 0xff, (n >> 8) & 0xff]; }

    sendReceive(sendMessage, n, fcn) {


        if (port && port.readable) {
            this.respfcn = fcn;
            this.resp = [];
            this.respCount = n;
            var message = new Uint8Array([sendMessage])
            const writer = outputStream.getWriter();
            writer.write(message);
            writer.releaseLock();
        } else {
            throw "error: not connected";
        }
    }


    sendl(command) {
        if (outputStream) {
            var message = new Uint8Array([command])
            const writer = outputStream.getWriter();
            writer.write(message);
            writer.releaseLock();
        } else {
            throw "error: not connected";
        }
    }

    //TODO: There's no error handling for disconnect/reconnect events. This assumes everything works perfectly.
    //Add a state to track if the connection is live. 

    async openSerialPort() {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        reader = port.readable.getReader();
        outputStream = port.writable;
        document.getElementById("connectButton").style.display = "none";
        document.getElementById("disconnectButton").style.display = "inline-block";
        this.startReading();
    }

    async disconnectSerialPort() {
        if (port) {
            if (reader) {
                await reader.cancel();
                reader = null;
            }
            if (outputStream) {
                await outputStream.getWriter().close();
                outputStream = null;
            }
            await port.close();
            port = null;
            document.getElementById("connectButton").style.display = "inline-block";
            document.getElementById("disconnectButton").style.display = "none";
        } else { }

    }


    async startReading() {
        while (true) {
            const { value, done } = await reader.read();
            if (value) {
                var newValue;
                this.handleReceiveData(value);
                if (value[1] != 0) {
                    newValue = value[0] + 256 * value[1]
                } else {
                    newValue = value[0];
                }
                this.allReceivedData.push(newValue);

            }
            if (done) {
                reader.releaseLock();
                break;
            }
        }

    }


    handleReceiveData(receivedValue) {
        var value = Array.from(new Uint8Array(receivedValue));
        for (var i in value) {
            this.gotChar(value[i]);
        }
    }



    gotChar(c) {
        if (this.respCount == 0) return;
        else {
            this.resp.push(c);
            if (this.respCount > this.resp.length) return;
            if (this.respfcn) {
                this.respfcn(this.resp);
                this.respCount = 0;
                this.resp = [];
            }
        }
    }

    pushToArray(variable, value){
        var variableValue = this.getValueInternal(variable);
        
        if(variableValue && Array.isArray(variableValue)){
            variableValue.push(value);
            this.setValue(variable, variableValue);
        } else {
            throw `${variable} is not a valid array`;
        }
    }

    fillShape(){

    }


}

/************************************************************
 * 
 * Primitives
 * 
 * Defines all JSLogo functions that the user can perform
 ************************************************************/

export var prims = {};


prims['setAxisX'] = { nargs: 1, fcn: function (a) { this.setChartListener("x", a) } }
prims['setAxisY'] = { nargs: 1, fcn: function (a) { this.setChartListener("y", a) } }
prims['calibrate'] = { nargs: 2, fcn: function (a, b) { return this.calibrate(a, b) } }
prims['logData'] = { nargs: 1, fcn: function (a) { this.pushToTable(a) } }
prims['repeat'] = { nargs: 2, flow: true, fcn: function (a, b) { this.repeat(a, b); } }
prims['forever'] = { nargs: 1, flow: true, fcn: function (a) { this.loop(a); } }
prims['loop'] = { nargs: 1, flow: true, fcn: function (a) { this.loop(a); } }
prims['if'] = { nargs: 2, flow: true, fcn: function (a, b) { this.logo_if(this.getbool(a), b); } }
prims['ifelse'] = { nargs: 3, flow: true, fcn: function (a, t, f) { this.logo_ifelse(this.getbool(a), t, f); } }
prims['run'] = { nargs: 1, flow: true, fcn: function (l) { this.logo_run(l); } }
prims['initPlot'] = { nargs: 0, fcn: function (n) { this.initPlot() } }

prims['.'] = { nargs: 0, flow: true, fcn: function () { this.procOutput(this); } }
prims['stop'] = { nargs: 0, flow: true, fcn: function () { this.procOutput(this); } }
prims['output'] = { nargs: 1, flow: true, fcn: function (x) { return this.procOutput(this, x); } }
prims['wait'] = { nargs: 1, fcn: function (x) { this.mwait(100 * this.getnum(x)); } }
prims['mwait'] = { nargs: 1, fcn: function (x) { this.mwait(this.getnum(x)); } }

prims['+'] = { nargs: 2, priority: -1, fcn: function (a, b) { return a + b; } }
prims['-'] = { nargs: 2, priority: -1, fcn: function (a, b) { return a - b; } }
prims['*'] = { nargs: 2, priority: -2, fcn: function (a, b) { return a * b; } }
prims['/'] = { nargs: 2, priority: -2, fcn: function (a, b) { return a / b; } }
prims['='] = { nargs: 2, priority: -2, fcn: function (a, b) { return this.equals(a, b); } }
prims['!='] = { nargs: 2, priority: -2, fcn: function (a, b) { return !this.equals(a, b); } }
prims['>'] = { nargs: 2, priority: -2, fcn: function (a, b) { return a > b; } }
prims['<'] = { nargs: 2, priority: -2, fcn: function (a, b) { return a < b; } }
prims['remainder'] = { nargs: 2, fcn: function (a, b) { return this.getnum(a).mod(this.getnum(b)); } }
prims['round'] = { nargs: 1, fcn: function (a) { return Math.round(this.getnum(a)); } }
prims['int'] = { nargs: 1, fcn: function (a) { return Math.floor(this.getnum(a)); } }
prims['minus'] = { nargs: 1, fcn: function (a) { return -a; } }
prims['sin'] = { nargs: 1, fcn: function (a) { return turtleMath.sindeg(this.getnum(a)); } }
prims['cos'] = { nargs: 1, fcn: function (a) { return turtleMath.cosdeg(this.getnum(a)); } }
prims['sqrt'] = { nargs: 1, fcn: function (a) { return Math.sqrt(this.getnum(a)); } }
prims['random2'] = { nargs: 2, fcn: function (a, b) { return this.pickRandom(this.getnum(a), this.getnum(b)); } }
prims['oneof'] = { nargs: 2, fcn: function (a, b) { return this.oneof(a, b); } }

prims['sum'] = { nargs: 2, fcn: function (a, b) { return a + b; } }
prims['product'] = { nargs: 2, fcn: function (a, b) { return a * b; } }

prims['se'] = { nargs: 2, fcn: function (a, b) { return [].concat(a, b); } }
prims['word'] = { nargs: 2, fcn: function (a, b) { return this.word(a, b); } }
prims['first'] = { nargs: 1, fcn: function (a) { return this.first(a); } }
prims['butfirst'] = { nargs: 1, fcn: function (a) { return this.butfirst(a); } }
prims['bf'] = { nargs: 1, fcn: function (a) { return this.butfirst(a); } }
prims['last'] = { nargs: 1, fcn: function (a) { return this.last(a); } }
prims['bl'] = { nargs: 1, fcn: function (a) { return this.butlast(a); } }
prims['fput'] = {
    nargs: 2, fcn: function (a, b) {
        var res = [].concat(this.getlist(b));
        //res.unshift(a); 
        return res;
    }
}
prims['lput'] = { nargs: 2, fcn: function (a, b) { var res = [].concat(this.getlist(b)); res.push(a); return res; } }
prims['count'] = { nargs: 1, fcn: function (a) { return this.count(a); } }
prims['item'] = { nargs: 2, fcn: function (n, l) { return this.item(n, l); } }
prims['nth'] = { nargs: 2, fcn: function (n, l) { return this.getlist(l)[this.getnum(n)]; } }
prims['setnth'] = { nargs: 3, fcn: function (n, l, d) { this.getlist(l)[this.getnum(n)] = d; } }
prims['member?'] = { nargs: 2, fcn: function (x, l) { return this.member(x, l); } }
prims['empty?'] = { nargs: 1, fcn: function (l) { return l.length == 0; } }
prims['pick'] = { nargs: 1, fcn: function (l) { return l[this.random.pickRandom(0, this.getlist(l).length - 1)]; } }

prims['print'] = { nargs: 1, fcn: function (x) { this.printToConsole(this.printstr(x)); } }

prims['clean'] = { nargs: 0, fcn: function (n) { this.clean(); } }
prims['forward'] = { nargs: 1, fcn: function (n) { this.forward(this.getnum(n)); } }
prims['fd'] = { nargs: 1, fcn: function (n) { this.forward(this.getnum(n)); } }
prims['back'] = { nargs: 1, fcn: function (n) { this.forward(this.getnum(-n)); } }
prims['bk'] = { nargs: 1, fcn: function (n) { this.forward(this.getnum(-n)); } }
prims['right'] = { nargs: 1, fcn: function (n) { this.right(this.getnum(n)); } }
prims['rt'] = { nargs: 1, fcn: function (n) { this.right(this.getnum(n)); } }
prims['left'] = { nargs: 1, fcn: function (n) { this.right(this.getnum(-n)); } }
prims['lt'] = { nargs: 1, fcn: function (n) { this.right(this.getnum(-n)); } }
prims['setheading'] = { nargs: 1, fcn: function (n) { this.seth(this.getnum(n)); } }
prims['seth'] = { nargs: 1, fcn: function (n) { this.seth(this.getnum(n)); } }
prims['setxy'] = { nargs: 2, fcn: function (x, y) { this.setxy(this.getnum(x), this.getnum(y)); } }
prims['lineto'] = { nargs: 2, fcn: function (x, y) { this.lineto(this.getnum(x), this.getnum(y)); } }
prims['arc'] = { nargs: 2, fcn: function (a, r) { this.arc(this.getnum(a), this.getnum(r)); } }

prims['fillscreen'] = { nargs: 2, fcn: function (c, s) { this.fillscreen(this.getcolor(c), s); } }
prims['setcolor'] = { nargs: 1, fcn: function (n) { this.setcolor(this.getcolor(n)); } }
prims['setc'] = { nargs: 1, fcn: function (n) { this.setcolor(this.getcolor(n)); } }
prims['setshade'] = { nargs: 1, fcn: function (n) { this.setshade(n); } }
prims['setsh'] = { nargs: 1, fcn: function (n) { this.setshade(n); } }
prims['setpensize'] = { nargs: 1, fcn: function (n) { this.setpensize(n); } }
prims['setps'] = { nargs: 1, fcn: function (n) { this.setpensize(n); } }
prims['pendown'] = { nargs: 0, fcn: function (n) { this.pendown = true; } }
prims['pd'] = { nargs: 0, fcn: function (n) { this.pendown = true; } }
prims['penup'] = { nargs: 0, fcn: function (n) { this.pendown = false; } }
prims['pu'] = { nargs: 0, fcn: function (n) { this.pendown = false; } }
prims['startfill'] = { nargs: 0, fcn: function () { this.startfill(); } }
prims['endfill'] = { nargs: 0, fcn: function () { this.endfill(); } }
prims['setopacity'] = { nargs: 1, fcn: function (n) { this.opacity = this.getnum(n) / 100; } }

prims['drawtext'] = { nargs: 1, fcn: function (str) { this.drawString(this.printstr(str)); } }
prims['textalign'] = { nargs: 1, fcn: function (str) { this.textAlign(str); } }
prims['setfont'] = { nargs: 1, fcn: function (f) { this.setfont(f); } }
prims['setfontsize'] = { nargs: 1, fcn: function (s) { this.setfontsize(s); } }
prims['setlinestyle'] = { nargs: 1, fcn: function (l) { this.setlinedash(l); } }

prims['xcor'] = { nargs: 0, fcn: function (n) { return this.xcor; } }
prims['ycor'] = { nargs: 0, fcn: function (n) { return this.ycor; } }
prims['heading'] = { nargs: 0, fcn: function (n) { return this.heading; } }
prims['color'] = { nargs: 0, fcn: function (n) { return this.color; } }
prims['shade'] = { nargs: 0, fcn: function (n) { return this.shade; } }
prims['pensize'] = { nargs: 0, fcn: function (n) { return this.pensize; } }
prims['opacity'] = { nargs: 0, fcn: function (n) { return 100 * this.opacity; } }

prims['hideturtle'] = { nargs: 0, fcn: function (n) { this.hideTurtle(); } }
prims['ht'] = { nargs: 0, fcn: function (n) { this.hideTurtle(); } }
prims['showturtle'] = { nargs: 0, fcn: function (n) { this.showTurtle(); } }
prims['st'] = { nargs: 0, fcn: function (n) { this.showTurtle(); } }

//prims['snapimage'] = {nargs: 1, fcn: function(n){ this.snaps[n] = canvas.toDataURL();}}
prims['drawsnap'] = { nargs: 1, fcn: function (n) { this.hold = true; this.loadimg(this.snaps[n], function () { this.hold = false; }); } }

prims['flushtime'] = { nargs: 1, fcn: function (n) { flushtime = this.getnum(n); } }

prims['( '] = { nargs: 1, fcn: function (x) { this.evline.shift(); return x; } }
prims['se '] = { nargs: 'ipm', fcn: function () { return this.ipm_se(arguments); } }


prims['storeinbox1'] = { nargs: 1, fcn: function (n) { this.boxes[0] = n; } }
prims['box1'] = { nargs: 0, fcn: function () { return this.boxes[0]; } }
prims['storeinbox2'] = { nargs: 1, fcn: function (n) { this.boxes[1] = n; } }
prims['box2'] = { nargs: 0, fcn: function () { return this.boxes[1]; } }
prims['storeinbox3'] = { nargs: 1, fcn: function (n) { this.boxes[2] = n; } }
prims['box3'] = { nargs: 0, fcn: function () { return this.boxes[2]; } }
prims['now'] = { nargs: 0, fcn: function () { return Math.floor(Date.now() / 1000) } }

prims['resett'] = { nargs: 0, fcn: function (n) { this.resett(); } }
prims['timer'] = { nargs: 0, fcn: function () { return this.timer(); } }
prims['unixtime'] = { nargs: 0, fcn: function () { return Math.floor(Date.now() / 1000); } }
prims['time'] = { nargs: 0, fcn: function () { return this.time(); } }
prims['hours'] = { nargs: 0, fcn: function () { return this.hours(); } }
prims['minutes'] = { nargs: 0, fcn: function () { return this.minutes(); } }
prims['seconds'] = { nargs: 0, fcn: function () { return this.seconds(); } }
prims['2digit'] = { nargs: 1, fcn: function (n) { return this.twoDigit(n); } }
prims['clockspeed'] = { nargs: 1, fcn: function (n) { this.clockspeed = this.getnum(n); } }
prims['scale'] = { nargs: 2, fcn: function (n, l) { return this.scale(this.getnum(n), this.getlist(l)); } }

prims['true'] = { nargs: 0, fcn: function () { return true; } }
prims['false'] = { nargs: 0, fcn: function () { return false; } }

prims['push'] = { nargs: 2, fcn: function (a, b) { this.pushToArray(a, b); } }
prims['make'] = { nargs: 2, fcn: function (a, b) { this.setValue(a, b); } }
prims['let'] = { nargs: 2, fcn: function (a, b) { this.setValue(a, b); } }
//This is only for backwards compatability. Let is not different from make right now.

prims['local'] = { nargs: 1, fcn: function (a, b) { this.makeLocal(a); } }
prims['openport'] = { nargs: 0, fcn: function () { this.openSerialPort(); } }

prims['ob1on'] = { nargs: 0, fcn: function () { this.ledOn(); this.mwait(1); } }
prims['ob1off'] = { nargs: 0, fcn: function () { this.ledOff(); this.mwait(1); } }

prims['dp2on'] = { nargs: 0, fcn: function () { this.pinOn(2); this.mwait(1); } }
prims['dp2off'] = { nargs: 0, fcn: function () { this.pinOff(2); this.mwait(1); } }
prims['dp3on'] = { nargs: 0, fcn: function () { this.pinOn(3); this.mwait(1); } }
prims['dp3off'] = { nargs: 0, fcn: function () { this.pinOff(3); this.mwait(1); } }
prims['dp4on'] = { nargs: 0, fcn: function () { this.pinOn(4); this.mwait(1); } }
prims['dp4off'] = { nargs: 0, fcn: function () { this.pinOff(4); this.mwait(1); } }
prims['dp5on'] = { nargs: 0, fcn: function () { this.pinOn(5); this.mwait(1); } }
prims['dp5off'] = { nargs: 0, fcn: function () { this.pinOff(5); this.mwait(1); } }
prims['dp6on'] = { nargs: 0, fcn: function () { this.pinOn(6); this.mwait(1); } }
prims['dp6off'] = { nargs: 0, fcn: function () { this.pinOff(6); this.mwait(1); } }
prims['dp7on'] = { nargs: 0, fcn: function () { this.pinOn(7); this.mwait(1); } }
prims['dp7off'] = { nargs: 0, fcn: function () { this.pinOff(7); this.mwait(1); } }
prims['lineto'] = { nargs: 2, fcn: function (a, b) { this.drawLine(a, b); } }

prims['read0'] = { nargs: 0, fcn: function () { this.readSensor(0); return this.cfun; } }
prims['read1'] = { nargs: 0, fcn: function () { this.readSensor(1); return this.cfun; } }
prims['read2'] = { nargs: 0, fcn: function () { this.readSensor(2); return this.cfun; } }
prims['read3'] = { nargs: 0, fcn: function () { this.readSensor(3); return this.cfun; } }
prims['read4'] = { nargs: 0, fcn: function () { this.readSensor(4); return this.cfun; } }
prims['read5'] = { nargs: 0, fcn: function () { this.readSensor(5); return this.cfun; } }

prims['connected8'] = { nargs: 0, fcn: function () { this.readPin(8); return this.cfun; } }
prims['connected9'] = { nargs: 0, fcn: function () { this.readPin(9); return this.cfun; } }
prims['connected10'] = { nargs: 0, fcn: function () { this.readPin(10); return this.cfun; } }
prims['connected11'] = { nargs: 0, fcn: function () { this.readPin(11); return this.cfun; } }
prims['connected12'] = { nargs: 0, fcn: function () { this.readPin(12); return this.cfun; } }
prims['chartpush'] = { nargs: 2, fcn: function (a, b) { this.addToChart(a, b); } }