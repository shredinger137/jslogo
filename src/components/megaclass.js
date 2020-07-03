var constants = {
	black: '-9999&0', white: '-9999&100', red: '0&50',  green: '30&50', blue: '70&50',
	cyan: '50&50', magenta: '90&50', yellow: '20&50', orange: '14&50'
} 
var port;
var reader;
var outputStream;
var flushtime = 200;


export default class Megaclass {


    constructor(s) {
        this.ticker = this.ticker.bind(this);
        this.isDone = this.isDone.bind(this);
        this.parse = this.parse.bind(this);
        this.procs = document.getElementById("procs");

        //tokenizer
        this.str = s;
        this.offset = 0;
        //procs js
        var t = this;
        this.procs.autocapitalize = 'off';
        this.procs.autocorrect = 'off';
        this.procs.autocomplete = 'off';
        this.procs.spellcheck = false;
        this.procs.focused = false;
        this.procs.onfocus = function(){this.focused = true;};
        this.procs.onblur = function(){this.focused = false; t.readProcs()};
        this.procs.onkeydown = handleKeyDown;
    
        function handleKeyDown(e) {
         if(e.ctrlKey){
             if(e.keyCode==70) {e.preventDefault(); e.stopPropagation();  this.focus();}
             if(e.keyCode==71) {e.preventDefault(); e.stopPropagation(); t.readProcs(); this.runLine('go');}
             if(e.keyCode==190) {this.insert('stopped!\n'); this.reset([]);}
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
        this.autocapitalize = 'off';
        this.autocorrect = 'off';
        this.autocomplete = 'off';
        this.spellcheck = false;
        this.onkeydown = function (e) { handleCCKeyDown(e); }
        this.focused = false;
        this.onfocus = function () { this.focused = true; };
        this.onblur = function () { this.focused = false; };
        this.value = 'Welcome to Logo!\n';
        this.selectionStart = this.value.length + 1;
        this.selectionEnd = this.value.length + 1;
        //this.focus();


        function handleCCKeyDown(e) {
            var k = e.keyCode;
            if (k == 13) {
                if (e.shiftKey) insertcr(e);
                else handlecr(e);
            }
            if (e.ctrlKey) {
                //if(e.keyCode==70) {e.preventDefault(); e.stopPropagation(); procs.focus();}
                if (e.keyCode == 71) { e.preventDefault(); e.stopPropagation(); this.runLine('go'); }
                if (e.keyCode == 190) { this.insert('stopped!\n'); this.reset([]); }
            }
        }

        function handlecr(e) {
            var pos = this.selectionStart;
            var t = this.value;
            var start = t.lastIndexOf('\n', pos - 1), end = t.indexOf('\n', pos);
            if (end < 0) end = t.length;
            this.selectionStart = end + 1;
            if (end != t.length) e.preventDefault();
            var str = t.substring(start + 1, end);
            this.runLine(str);
        }

        function insertcr(e) {
            e.preventDefault();
            var pos = this.selectionStart;
            var t = this.value;
            var before = t.substring(0, pos);
            var after = t.substring(pos);
            this.value = before + '\n' + after;
            this.selectionStart = pos + 1;
            this.selectionEnd = pos + 1;
        }

        //comms js
        this.respfcn = undefined;
        this.respCount = 0;
        this.resp = [];
        this.respStr = '';
        this.serialID = undefined;

        //extensions js
        this.fe = undefined;
        //loadbutton.onclick = load;
        //saveasbutton.onclick = function(e){saveas(e)};
        //savebutton.onclick = save;
        //gobutton.onclick = function(){ this.focus(); this.runLine('go');}
        //window.addEventListener('resize', resize);
        //cnvframe.addEventListener('click', paneToggle);
        //setTimeout(resize, 100);

        function load() {
            // this.focus();
            var fr = new FileReader();
            fr.onload = function (e) { this.value = e.target.result; this.readProcs(); };

            function next(fe) { this.fe = fe; fe.file(next2); }

            function next2(file) { handleFile(file); }
        }


        function handleFile(file) {
            if (file == undefined) return;
            var filename = file.name.split('.')[0];
            if (file.type == 'text/plain') {
                var reader = new FileReader();
                reader.onload = readprocs;
                reader.readAsText(file);
            } else if (file.type == 'image/png') {
                var reader = new FileReader();
                reader.onload = readimage;
                reader.readAsDataURL(file);
            }

            function readprocs() {
                if (!procs) { var procs = { value: "null" } }
                procs.value = reader.result;
                this.readProcs();
            }

            function readimage() {
                 this.loadpng(reader.result, this.createDragImage);
            }
        }

        function saveas(e) {
             this.focus();
            if (!e.shiftKey) saveAsText();
            else saveAsPNG()

            function saveAsText() {
                if (!procs) { var procs = { value: "null" } }
                var name = (this.fe) ? this.fe.name : 'untitled.txt';
                var blob = new Blob([procs.value], { type: 'plain/text' });
                // chrome.fileSystem.chooseEntry({type: "saveFile", suggestedName: name}, next1)

                function next1(fe) { if (fe) { this.fe = fe; fe.createWriter(function (w) { w.truncate(0); }); fe.createWriter(next2); } }
                function next2(writer) { writer.write(blob); }
            }

            function saveAsPNG() {
                if (!procs) { var procs = { value: "null" } }
                var name = (this.fe) ? this.fe.name.replace('.txt', '.png') : 'untitled.png';
                // chrome.fileSystem.chooseEntry({type: "saveFile", suggestedName: name}, next1)

                function next1(fe) { if (fe) { fe.createWriter(function (w) { w.truncate(0); }); fe.createWriter(next2); } }
                function next2(writer) {
                    ImageData.setImageData( this.ctx, procs.value);
                    //canvas.toBlob(function(blob){next3(writer,blob);});
                }
                function next3(writer, blob) { writer.write(blob); }
            }
        }

        function save() {
             this.focus();
            if (!procs) { var procs = { value: "null" } }
            var blob = new Blob([procs.value], { type: 'plain/text' });
            if (this.fe) {
                this.fe.createWriter(function (w) { w.truncate(0); });
                this.fe.createWriter(next2);
            }

            function next2(writer) { writer.write(blob); }
        }

        function paneToggle() {
            if ( this.style.visibility == 'hidden') onepane();
            else threepanes();
        }

        function onepane() {
            //loadbutton.style.visibility = 'hidden';
            //savebutton.style.visibility = 'hidden';
            //saveasbutton.style.visibility = 'hidden';
            //gobutton.style.visibility = 'hidden';
        }

        function threepanes() {
            //loadbutton.style.visibility = 'visible';
            //savebutton.style.visibility = 'visible';
            //	saveasbutton.style.visibility = 'visible';
            //	gobutton.style.visibility = 'visible';
        }

        function resize() {
            if (!procs) { var procs = { offsetWidth: "null" } }
            //gobutton.style.left = (procs.offsetWidth+10-67)+'px';
        }
    }

    //turtle js
    
    //replacing 'setup' for now so it doesn't conflict
    setuptl(){
    //setup(){
        console.log("turtle setup???")
        var t = this;
        t.element = document.createElement('div');
        t.element.setAttribute ('class', 'turtle');
        //cnvframe.appendChild(t.element);
        t.img = document.createElement('img');
        t.element.appendChild (t.img);
        t.img.src = 'this.svg';
        t.img.onload = imgLoaded;
        //t.ctx = canvas.getContext('2d');
        //canvas.width = t.cnvWidth*t.dpi;
        //canvas.height = t.cnvHeight*t.dpi;
        //t.ctx.scale(t.dpi,t.dpi);
        //t.ctx.textBaseline="middle"; 
        t.clean();
    
        function imgLoaded(){
            t.img.width = t.size;
            t.img.height = t.size;
            t.element.style.width = t.size+'px';
            t.element.style.height = t.size+'px';
            t.move();
        }
    
    }
    
    
    /////////////////////////
    //
    // Turtle
    //
    /////////////////////////
    
        
    forward(n){
        var t = this;
        if(t.pendown){
            t.ctx.beginPath();
            t.ctx.moveTo(t.xcor+t.cnvWidth/2, t.cnvHeight/2-t.ycor);
        }
        t.xcor+=n*this.sindeg(t.heading);
        t.ycor+=n*this.cosdeg(t.heading);
        if(t.pendown){
            var sx=t.xcor+t.cnvWidth/2, sy=t.cnvHeight/2-t.ycor;
            if(n>=.1)t.ctx.lineTo(sx,sy);
            else t.ctx.lineTo(sx, sy+.1);
            if(t.pensize!=0) t.ctx.stroke();
            if(t.fillpath) t.fillpath.push(function(){this.ctx.lineTo(sx,sy);});
        }
    }
    
    lineto(x,y){
        var t = this;
        if(t.pendown){
            t.ctx.beginPath();
            t.ctx.moveTo(t.xcor+t.cnvWidth/2, t.cnvHeight/2-t.ycor);
        }
        t.xcor = x;
        t.ycor = y;
        if(t.pendown){
            var sx=t.xcor+t.cnvWidth/2, sy=t.cnvHeight/2-t.ycor;
            if((x+y)>=.1)t.ctx.lineTo(sx,sy);
            else t.ctx.lineTo(sx, sy+.1);
            if(t.pensize!=0) t.ctx.stroke();
            if(t.fillpath) t.fillpath.push(function(){this.ctx.lineTo(sx,sy);});
        }
    }
    
    setxy(x,y){
        var t = this;
        t.xcor = x;
        t.ycor = y;
        var sx=t.xcor+t.cnvWidth/2, sy=t.cnvHeight/2-t.ycor;
        if(t.fillpath) t.fillpath.push(function(){this.ctx.moveTo(sx,sy);});
    }
    
    right(n){this.seth(this.heading+n);}
    left(n){this.seth(this.heading-n);}
    seth(a){this.heading=a; this.heading=this.heading.mod(360);}
    
    arc(a,r){
        var t = this;
        if(a==0) return;	
        if(r==0) {t.seth(t.heading+a);}
        else if (a<0) leftArc(a,r);
        else rightArc(a,r);
    
        function rightArc(a,r){
            var sgn = r/Math.abs(r);
            var ar = Math.abs(r);
            var dx = ar*this.cosdeg(t.heading);
            var dy = ar*this.sindeg(t.heading);
            var cx = t.xcor+dx;
            var cy = t.ycor-dy;
            if(t.pendown){
                var sx=t.cnvWidth/2+cx, sy=t.cnvHeight/2-cy;
                var astart=this.rad(t.heading+180.0), aend=this.rad(t.heading+180+a*sgn);
                if((a%360)==0) aend+=.0001;
                var dir = r<0;
                t.ctx.beginPath();
                t.ctx.moveTo(t.xcor+t.cnvWidth/2, t.cnvHeight/2-t.ycor);
                t.ctx.arc(sx, sy, ar, astart, aend, dir); 
                if(t.pensize!=0) t.ctx.stroke();
                if(t.fillpath) t.fillpath.push(function(){this.ctx.arc(sx, sy, ar, astart,aend, dir);});
            }
            t.seth(t.heading+a*sgn);
            t.xcor = cx-ar*this.cosdeg(t.heading);
            t.ycor = cy+ar*this.sindeg(t.heading);
        } 
    
        function leftArc(a,r){
            var sgn = r/Math.abs(r);
            var ar = Math.abs(r);
            var dx = ar*this.cosdeg(t.heading);
            var dy = ar*this.sindeg(t.heading);
            var cx = t.xcor-dx;
            var cy = t.ycor+dy;
            if(t.pendown){
                var sx=t.cnvWidth/2+cx, sy=t.cnvHeight/2-cy;
                var astart=this.rad(t.heading), aend=this.rad(t.heading+a*sgn);
                var dir = r>=0;
                if((a%360)==0) aend+=.0001;
                t.ctx.beginPath();
                t.ctx.moveTo(t.xcor+t.cnvWidth/2, t.cnvHeight/2-t.ycor);
                t.ctx.arc(sx, sy, ar, astart,aend, dir); 
                if(t.pensize!=0) t.ctx.stroke();
                if(t.fillpath) t.fillpath.push(function(){this.ctx.arc(sx, sy, ar, astart,aend, dir);});
            }
            t.seth(t.heading+a*sgn);
            t.xcor = cx+ar*this.cosdeg(t.heading);
            t.ycor = cy-ar*this.sindeg(t.heading);
        }
    }
    
    showTurtle(){this.element.style.visibility = 'visible';}
    hideTurtle(){this.element.style.visibility = 'hidden';}
    
    /////////////////////////
    //
    // Pen
    //
    /////////////////////////
    
    fillscreen(c,s){
        var oldcolor = this.color, oldshade=this.shade;
        if((typeof c)=='object') c = c[0];
        this.setCtxColorShade(c, s);
        this.ctx.fillRect(0,0,this.cnvWidth,this.cnvHeight);
        this.setCtxColorShade(this.color, this.shade);
    }
    
    setcolor(c){
        if((typeof c)=='object'){this.color = c[0]; this.shade = c[1];}
        else this.color = c;
        this.setCtxColorShade(this.color, this.shade);
    }
    
    setshade(sh){
        this.shade=sh;
        this.setCtxColorShade(this.color, this.shade);
    }
    
    setpensize(ps){
        this.pensize = ps;
        this.ctx.lineWidth = Math.abs(this.pensize);
    }
    
    startfill(){
        this.fillpath = new Array();
        var sx=this.xcor+this.cnvWidth/2, sy=this.cnvHeight/2-this.ycor;
        this.fillpath.push(function(){this.ctx.moveTo(sx, sy);});
    }
    
    endfill(){
        if(!this.fillpath) return
        this.ctx.beginPath();
        for(var i in this.fillpath){
            if(i>2000) break;
            this.fillpath[i]();
        }
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.fillpath = undefined;
    }
    
    setlinedash(l){
        this.ctx.setLineDash(l);
    }
    
    /////////////////////////
    //
    // Text
    //
    /////////////////////////
    
    drawString(str){
        var t = this;
        t.ctx.save();
        this.ctx.translate(t.xcor+t.cnvWidth/2, t.cnvHeight/2-t.ycor);
        t.ctx.rotate(this.rad(t.heading));
        t.ctx.fillText(str,0,0);
        t.ctx.restore();	
    }
    
    setfont(f){
        this.font = f;
        this.ctx.font = this.fontsize+'px '+f;
    }
    
    setfontsize(s){
        this.fontsize = s;
        this.ctx.font = s+'px '+this.font;
    }
    
    
    /////////////////////////
    //
    //  Basic stuff
    //
    /////////////////////////
    
    move(){
        var t = this;
        if(!t.img.complete) return;
        var img = t.element.firstChild;
        var dx = screenLeft();
        var dy = screenTop();
        var s = 10;
        //var s = canvas.offsetHeight/t.cnvHeight*t.zoom;
        t.element.style.webkitTransform = 'translate('+dx+'px, '+ dy+ 'px) rotate(' + t.heading + 'deg)'+' scale('+s+','+s+')';
        t.element.left = dx; 
        t.element.top = dy; 
    
        function screenLeft() {return -img.width/2+(t.xcor+t.cnvWidth/2)* 20 ;}
        function screenTop() {return -img.height/2+(t.cnvHeight/2-t.ycor)* 20 ;}
    
    }
    
    clean(){
        var t = this;
    //	t.xcor=0, t.ycor=0, t.heading=0;
        t.setCtxColorShade(-9999, 98); // #FAFAFA
        t.ctx.fillRect(0,0,t.cnvWidth,t.cnvHeight);
        //t.color=0, t.shade=50;
        t.setCtxColorShade(t.color, t.shade);
        t.pensize = 4;
        t.ctx.lineWidth=t.pensize;
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
    
    /////////////////////////
    //
    // loader
    //
    /////////////////////////
    
    loadimg(dataurl, fcn){
        var t = this;
        var ctx = this.ctx;
        var img = new Image;
        img.onload = drawImageToFit;
        img.src = dataurl;
    
        function drawImageToFit(){
        var s = t.cnvWidth/img.naturalWidth;
            ctx.save();
            ctx.scale(s,s);
            ctx.drawImage(img, 0, 0);
            ctx.restore();	
            if(fcn) fcn();
        }
    }
    
    loadpng(dataurl, fcn){
        var t = this;
        var ctx = this.ctx;
        var img = new Image;
        img.onload = drawImageToFit;
        img.src = dataurl;
    
        function drawImageToFit(){
            var code = readHiddenData();
            if(!procs){var procs = {value: "null"}; }
            procs.value = (code=='bad sig') ? '' : code;
        var s = t.cnvWidth/img.naturalWidth;
            ctx.save();
            ctx.scale(s,s);
            ctx.drawImage(img, 0, 0);
            ctx.restore();	
            this.readProcs();
            if(fcn) fcn();
        }
    
        function readHiddenData(){
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
    
    
    setCtxColorShade(color, shade){
        var t = this;
        setCtxColor(mergeColorShade(color, shade));
    
        function mergeColorShade(color, shade){
            var sh = Math.abs(shade.mod(200));
            if(sh>100) sh = 200 - sh;
            if(color==-9999) return blend(0x000000, 0xffffff, sh/100);
            var c = colorFromNumber(color);
            if(sh==50) return c;
            else if (sh<50) return blend(c, 0x000000, (50-sh)/60);
            else return blend(c, 0xffffff, (sh-50)/53);
        }
    
        function colorFromNumber (c){
            var mc = c.mod(100);
            var ic = Math.floor(mc);
            var fract = mc - ic;
            return blend(t.colors[ic], t.colors[ic+1], fract);
        }
    
        function blend(a, b, s){
            var ar=(a>>16)&0xff, ag=(a>>8)&0xff, ab=a&0xff; 
            var br=(b>>16)&0xff, bg=(b>>8)&0xff, bb=b&0xff; 
            var rr = Math.round(ar*(1-s)+br*s);
            var rg = Math.round(ag*(1-s)+bg*s);
            var rb = Math.round(ab*(1-s)+bb*s);
            return (rr<<16)+(rg<<8)+rb;
        }
    
        function setCtxColor(c){
            var cc = '#'+(c+0x1000000).toString(16).substring(1);
            t.ctx.strokeStyle = cc;
        //  console.log ('ctx color:',cc);
            t.ctx.fillStyle = cc; 
        } 
    
    }


    //tokenizer

    tokenize(){
        console.log("running tokenize");
        var t = this;
        return readList();
    
    function readList(){
        console.log("readList");
        var a = new Array();
        skipSpace();
        while(true){
            if(eof()) break;
            var token = readToken();
            if(token==null) break;
            a.push(token);
        }
        return a;
    }
    
    function readToken(){
        console.log("running readToken");
        var s = next();
        var n = Number(s);
        if(!isNaN(n)) return n;
        var first = s.charAt(0);
        if(first=="]") return null;
        if(first=="[") return readList();
        console.log(s);
        return s;
    }
    
    function next(){
        console.log("running next");
        if(peekChar()=="'") return readString();
        var res='';
        if(delim()) res=nextChar();
        else {
            while(true){
                if(eof()) break;
                if(delim()) break;
                else res+=nextChar();
        }}
        skipSpace();
        console.log(res);
        return res;
    }
    
    function readString(){
        nextChar();
        var res="'";
        while (true){
            if(eof()) return res+"'";
            var c=nextChar();
            res+=c;
            if(c=="'") {skipSpace(); return res;}
        }
        return null;
    }
    
    function nextLine(){
        var res='';
        while (true){
            if(eof()) return res;
            var c=nextChar();
            if(c=='\n') return res;
            res+=c;
        }
    }
    
    function skipSpace(){
        console.log("skipSpace");
        while(true){
            if(eof()) return;
            var c = peekChar();
            if(c==';') {skipComment(); continue;}
            if(" \t\r\n,".indexOf(c)==-1) return;
            nextChar();
        }	
    }
    
    function skipComment(){
        while(true){
            var c = nextChar();
            if(eof()) return;
            if(c== '\n') return;
        }	
    }
    
    function delim(){return "()[] \t\r\n".indexOf(peekChar())!=-1;}
    function peekChar(){return t.str.charAt(t.offset);}
    function nextChar(){return t.str.charAt(t.offset++);}
    function eof() {return t.str.length==t.offset;}	
    
    }

    parse(s){console.log("parse"); console.log(s); return new Megaclass(s).tokenize();}

    //procs js
    readProcs(){
        console.log("readProcs");
        var procs = document.getElementById("procs");
        this.procString(procs.value, 'normal');
        console.log(procs.value);
    }
    
    procString(str, type){
        gatherSource();
        parseProcs();
    
        function gatherSource(){
            console.log("gatherSource running: " + str + type);
            function parse(s){console.log("parse"); console.log(s); return new Megaclass(s).tokenize();}

            var thisproc = undefined;
            for(var i in prims) if((prims[i].type)=='normal') delete prims[i];
            var lines = str.split('\n');
            for(var i=0;i<lines.length;i++) procLines(lines[i]);
    
            function procLines(l){
                console.log("proclines: " + l);
                var sl = parse(l);
                if ((sl[0]=='to')&&(sl[1]!=undefined)) {
                    thisproc = sl[1];
                    prims[thisproc] = {nargs: sl.length-2};
                    prims[thisproc].fcn = '';
                    prims[thisproc].inputs = sl.slice(2);
                    prims[thisproc].type = type;
                    return;
                }
                else if (sl[0]=='end') {thisproc=undefined; return;}
                if(thisproc==undefined) return;
                prims[thisproc].fcn += (l+'\n');
            }
        }
    
        function parseProcs(){
            console.log("parseProcs");
            function parse(s){console.log("parse"); console.log(s); return new Megaclass(s).tokenize();}
            for(var p in prims){
                var prim = prims[p];
                var fcn = prim.fcn;
                if((typeof fcn)!='string') continue;
                console.log("cont1"); 
               // if(prim.parsed) continue;
                prim.parsed = parse(fcn);
                console.log(prim.parsed);
                
                for(var i in prim.inputs) {
                    console.log("running loop on prim.inputs");
                    if(prim.inputs[i].substring(0,1)==':') prim.inputs[i]=prim.inputs[i].substring(1);
                }
            }
        }
    }

    //i3-logo js from tlogo site
    setup(){
        console.log("setup");
        this.openText();
        window.requestAnimationFrame(this.ticker);
    }
    
    openText(){
        var procs = document.getElementById('procs');
        //procs.value = this.turtleStart;
        procs.focus();
    }
    
    
    ticker(){
        if(!this.isDone()){
            var end = this.now()+flushtime;
            while(this.now()<end){
                if(this.hold) break;
                if(this.isDone()) break;
                this.evalNext();
            }
         //   this.move();
        }
        window.requestAnimationFrame(this.ticker);
    }
    
    allowDrop (evt) { 
        evt.preventDefault(); 
        evt.stopPropagation();
    }
    
    handleDropFile (evt) { 
        evt.preventDefault(); 
        if (evt.stopPropagation) evt.stopPropagation();
        else evt.cancelBubble = true;
        var file = evt.dataTransfer.files[0];
        this.handleFile(file);
    }
    
    handleFile(file){
        if(file==undefined) return;
        var filename = file.name.split('.')[0];
        if(file.type=='text/plain'){
            var reader = new FileReader();
          reader.onload = readprocs;
          reader.readAsText(file);
        } else if(file.type=='image/png'){
            var reader = new FileReader();
          reader.onload = readimage;
          reader.readAsDataURL(file);
        } 
    
      function readprocs(){
            var procs = document.getElementById("procs");
            procs.value=reader.result; 
            this.readProcs();
      }
    
      function readimage(){
          this.loadpng(reader.result, this.createDragImage);
      }
    }
    

    //logo js
    reset(l){
        this.evline = l;
        this.cfun = undefined;
        this.arglist = [];
        this.priority = 0;
        this.stack = [];
        this.frame = [];
        this.locals = this.last(this.locals);
        this.hold = false;
        if(this.timeout!=undefined) clearTimeout(this.timeout);
        this.timeout = undefined;
        }
        
        lprint(x){console.log("lprint"); this.insert(x+'\n');}
        
        evalNext(){
            console.log("evalNext");
            var t = this;
            try {
                if(t.cfun){
                    if(t.arglist.length==prims[t.cfun].nargs){funcall(); return;}
                    if((prims[t.cfun].nargs=='ipm')&&(t.evline[0]==')')) {t.evline.shift(); funcall(); return}
                }
                if(t.evline.length==0){
                    if(t.cfun==undefined) t.evalEOL(); 
                    else throw 'not enough inputs to '+t.cfun;
                    return;
                }
                var token = t.evline.shift();
                if ((typeof token)=='string') evalString();
                else t.pushResult(token);
            } 
            catch(e){
                this.lprint(e);
                t.stack = [];
                t.evline = [];
            }
        
            function evalString(){
                console.log("evalString");
                if(token.substring(0,1)==':') t.pushResult(t.getValue(token.substring(1)));
                else if(token.substring(0,1)=='"') t.pushResult(token.substring(1));
                else if((token.substring(0,1)=="'")&&(token.slice(-1)=="'")) t.pushResult(token.substring(1,token.length-1));
                else if(constants[token]) t.pushResult(constants[token]);
                else {	
                    if(token=='(') handleParend();
                    if(prims[token]==undefined) throw "I don't know how to "+token; 
                    t.stack.push(t.cfun);
                    t.stack.push(t.arglist);
                    t.stack.push(t.priority);
                    t.cfun = token;
                    t.arglist = [];
                    t.priority = 0;
                }
        
                function handleParend(){
                    if(t.evline[0]=='se'){t.evline.shift(); token = 'se ';}
                    else token = '( ';
                }
            }
        
            function funcall(){
                console.log("funcall");
                if(prims[t.cfun].flow) prims[t.cfun].fcn.apply(t, t.arglist);
                else if((typeof prims[t.cfun].fcn)=='function') primCall();
                else if((typeof prims[t.cfun].fcn)=='string') procCall();
            }
        
        
            function primCall(){
                console.log("primCall");
                var arglist=t.arglist;
                var prim = t.cfun;
                var res = prims[t.cfun].fcn.apply(t, arglist);
                t.priority = t.stack.pop();
                t.arglist = t.stack.pop();
                t.cfun = t.stack.pop();
                if((res==undefined)&&(t.cfun!=undefined)) throw prim+" didn't output to "+t.cfun;
                t.pushResult(res);
            }
        
            function procCall(){
                console.log("proccall");
                var cfun = t.cfun, arglist=t.arglist;
                t.stack.push(t.evline);
                t.stack.push(t.frame);
                t.frame = [].concat(t.stack);
                bindArgs();
                t.evalLine(prims[cfun].parsed, t.procOutput);
        
                function bindArgs(){
                    var bindings = {};
                    var inputs = prims[cfun].inputs;
                    for(var i in inputs) bindings[inputs[i]]=arglist[i];
                   // t.locals.unshift(bindings);
                }
            }
        }
        
        pushResult(res){
            console.log("pushResult");
            var t = this;
            if(res==undefined) return;
            if(t.cfun==undefined) throw "you don't say what to do with "+t.printstr(res);
            if (isInfixNext()) infixCall(res);
            else t.arglist.push(res);
        
            function infixCall(arg){
                t.stack.push(t.cfun);
                t.stack.push(t.arglist);
                t.stack.push(t.priority);
                t.cfun = t.evline.shift();
                t.arglist = [arg];
                t.priority = prims[t.cfun].priority;
            }
        
            function isInfixNext(){
                if(t.evline.length==0) return false;
                var token = t.evline[0];
                if(prims[token]==undefined) return false;
                if(prims[token].priority==undefined) return false;
                return(prims[token].priority<t.priority);
            }
        }
        
        getValue(name){
            for(var i in this.locals) {
                if(this.locals[i][name]!=undefined) return this.locals[i][name];
            }
            throw name+' has no value';
        }
        
        setValue(name, value){
            var t = this;
            for(var i in t.locals) {
                if(t.locals[i][name]!=undefined){
                 t.locals[i][name]=value;
                 return;
                }
            }
            t.locals[t.locals.length-1][name] = value;
        }
        
        makeLocal(name){this.locals[0][name]=0;}
        
        procOutput(t, x){
            if(t.frame.length==0) {
                if(x!=undefined) throw "output can only be used in a procedure.";
                this.reset([]); 
                return;}
            t.stack = t.frame;
            t.frame = t.stack.pop();
            t.evline = t.stack.pop();
            t.priority = t.stack.pop();
            t.arglist = t.stack.pop();
            t.cfun = t.stack.pop();
            //t.locals.shift();
            t.pushResult(x);
        }
        
        evalLine(l,next){
            console.log("evalLine");
            var t = this;
            t.stack.push(t.cfun);
            t.stack.push(t.arglist);
            t.stack.push(t.evline);
            t.stack.push(next);
            t.cfun = undefined;
            t.arglist = [];
            t.evline = [].concat(l);
        }
        
        evalEOL(){
            console.log("evalEOL");
            var t = this;
            if(t.stack.length==0) return;
            var next = t.stack.pop();
            t.evline = t.stack.pop();
            t.arglist = t.stack.pop();
            t.cfun = t.stack.pop();
            next(t);
        }
        
        flowEnd(){
            var t = this;
            var prim = t.cfun;
            t.priority = t.stack.pop();
            t.arglist = t.stack.pop();
            t.cfun = t.stack.pop();
            if(t.cfun!=undefined) throw prim+" didn't output to "+t.cfun;
        }
        
        repeat(n,l){
            console.log("repeat");
            n = Math.round(this.getnum(n));
            this.stack.push(n);
            this.stack.push(l);
            repeatAgain(this);
        
            function repeatAgain(t){
                var l = t.stack.pop();
                var n = t.stack.pop();
                if(n<=0) {t.flowEnd(); return;}
                t.stack.push(--n);
                t.stack.push(l);
                t.evalLine(l,repeatAgain);
            }
        }
        
        loop(l){
            this.stack.push(l);
            loopAgain(this);
        
            function loopAgain(t){
                var l = t.stack.pop();
                t.stack.push(l);
                t.evalLine(l,loopAgain);
            }
        }
        
        logo_run(l){
            var t = this;
            t.evalLine(l, next);
            
            function next(){
                t.flowEnd();
            }
        }
        
        logo_if(b,l){
            var t = this;
            if(!b) t.flowEnd();
            else t.evalLine(l, next);
            
            function next(){
                t.flowEnd();
            }
        }
        
        logo_ifelse(b,l1,l2){
            var t = this;
            if(b) t.evalLine(l1, next);
            else t.evalLine(l2, next);
            
            function next(){
                t.flowEnd();
            }
        }
        
        ipm_se(l){
            var res = [];
            for(var i=0;i<l.length;i++) res = res.concat(l[i]);
            return res;
        }
        
        item(n,l){
            n = this.getnum(n);
            if((typeof l)=='object') return l[n-1];
            return String(l).substring(n-1,n);
        }
        
        first(l){
            if((typeof l)=='object') return l[0];
            return String(l).substring(0,1);
        }
        
        butfirst(l){
            if((typeof l)=='object') return l.slice(1);
            return String(l).substring(1);
        }
        
        last(l){
            if((typeof l)=='object') return l[l.length-1];
            return String(l).substring(String(l).length-1);
        }
        
        butlast(l){
            if((typeof l)=='object') return l.slice(0,-1);
            return String(l).substring(0,String(l).length-1);
        }
        
        count(l){
            if((typeof l)=='object') return l.length;
            return String(l).length;
        }
        
        word(a,b){
            if((typeof a)=='object') a=a.join(' ');
            if((typeof b)=='object') b=b.join(' ');
            return String(a)+String(b);
        }
        
        member(x,l){
            if((typeof l)=='object'){
                for(var i=0;i<l.length;i++) {if(this.equals(x,l[i])) return true;}
                return false;
            }
            return String(l).indexOf(x)!=-1;
        }
        
        time(){
            var now = this.getDate(); 
            var hour = now.getHours();
            if(hour==0) hour=12;
            if(hour>12) hour-=12;
            return [hour, now.getMinutes(), now.getSeconds()];
        }
        
        hours(){
            var now = this.getDate(); 
            var hour = now.getHours();
            var second = now.getSeconds();
            var minute = now.getMinutes();
            if(hour==0) hour=12;
            if(hour>12) hour-=12;
            hour+=minute/60;
            hour+=second/3600;
            return Math.floor(hour*100)/100;
        }
        
        minutes(){
            var now = this.getDate(); 
            var minute = now.getMinutes();
            var second = now.getSeconds();
            minute+=second/60;
            return Math.floor(minute*100)/100;
        }
        
        seconds(){
            var now = this.getDate(); 
            var second = now.getSeconds();
            var millis = now.getMilliseconds();
            second+=millis/1000;
            return Math.floor(second*100)/100;
        }

        now(){return new Date().getTime();}
        
        getDate(){
            //return new Date(t0+(now()-t0)*this.clockspeed);
            return new Date();
        }
        
        twoDigit(n){
            n = Math.floor(this.getnum(n));
            n = n.mod(100)+100;
            return String(n).substring(1);
        }
        
        scale(n,l){
            var len = l.length;
            for(var i=0;i<len-1;i++){
                if(l[0][0]==n) return l[0][1];
                if(l[1][0]>n){
                    var la = l[0];
                    var lb = l[1];
                    var fract = (n-la[0])/(lb[0]-la[0]);
                    return la[1]+fract*(lb[1]-la[1]);
                }
                l = l.slice(1);
            }
            return n;
        }
        
        textAlign(str){
            if(['center','left','right'].indexOf(str)>-1)  this.ctx.textAlign = str;
            else throw this.cfun+" doesn't like "+this.printstr(str)+' as input'; 
        }
        
        
        mwait(n){
            console.log("mwait: " + n);
            if(n<=0) return;
            console.log("mwait continued");
            this.hold=true;
            this.timeout = setTimeout(function(){this.timeout=undefined; this.hold=false;}, n);
        }
        
        printstr(x){
            var type = typeof x;
            if(type=='number') return String(Math.round(x*10000)/10000);
            if(type=='object'){
                var res = '';
                for(var i in x){res+= this.printstr(x[i]); res+=' ';}
                return '['+res.substring(0,res.length-1)+']';
            }
            else return String(x);
        }
        
        getnum(x){
            var n = Number(x);
            if(isNaN(n)||(String(x)=='false')||(String(x)=='true')) throw this.cfun+" doesn't like "+this.printstr(x)+' as input'; 
            return n;
        }
        
        getlist(x){
            if((typeof x) == 'object') return x;
            throw this.cfun+" doesn't like "+this.printstr(x)+' as input'; 
        }
        
        getbool(x){
            if(String(x)=='false') return false;
            if(String(x)=='true') return true;
            throw this.cfun+" doesn't like "+this.printstr(x)+' as input'; 
        }
        
        getcolor(x){
            var type = typeof x;
            if(type=='object') throw this.cfun+" doesn't like "+this.printstr(x)+' as input'; 
            if(type=='number') return x;
            var l = x.split('&');
            if(l.length==1) return Number(x);
            return [Number(l[0]), Number(l[1])];
        }
        
        equals(a,b){
            if((typeof a)!='object') return a.toString()==b.toString();
            if((typeof b)!='object') return a.toString()==b.toString();
            if(a.length!=b.length) return false;
            for(var i=0;i<a.length;i++){if(!this.equals(a[i],b[i])) return false;}
            return true;
        }
        
        stackPeek(n){return this.stack[this.stack.length-n-1];}
        isDone(){return (this.stack.length==0)&&(this.evline.length==0);}



    //extensions js
    loadStartup() {
        console.log("loadStartup");
        var req = new XMLHttpRequest();
        req.onreadystatechange = next;
        req.open('GET', 'startup.logo');
        req.send();

        function next() {
            if (req.readyState != 4) return;
            if (req.status != 200) return;
            this.procString(req.responseText, 'startup');
            if (prims['startup']) this.runLine('startup');
        }
    }

    //cc js
    insert(str) {
        console.log("insert");
        var cc = document.getElementById("cc");
        var startpos = this.selectionStart;
        var endpos = this.selectionEnd;
        var t = cc.value;
        var before = t.substring(0, startpos);
        var after = t.substring(endpos);
        var oldtop = cc.scrollTop;
        cc.value = before + str;
        var halfscroll = this.scrollHeight - this.scrollTop - this.offsetHeight;
        cc.value = before + str + after;
        cc.selectionStart = startpos + str.length;
        this.selectionEnd = startpos + str.length;
        if (halfscroll > 0) cc.scrollTop += halfscroll;
        else cc.scrollTop = oldtop;
    }

    runLine(str) {
        console.log("runline");
        console.log(str);
        var line = this.parse(str);
        this.reset(line);
    }


    //comms js


    readsensor(n) {
        this.hold = true;
        this.adread(n, this.gotsensor);
    }

    gotsensor(x) {
        var val = x[0] + 256 * x[1];
        this.arglist.pop();
        this.arglist.push(val);
        this.hold = false;
    }

    readpin(n) {
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

    rb(addr, fcn) {
        var cmd = [].concat(0xfe, this.twobytes(addr));
        this.sendReceive(cmd, 1, fcn);
    }

    wb(addr, data) {
        var cmd = [].concat(0xfd, this.twobytes(addr), 1, data);
        this.sendl(cmd);
    }

    pin_on(n) { this.sendl([0xe0 + n]); }
    pin_off(n) { this.sendl([0xd0 + n]); }
    led_on() { this.sendl([0xef]); }
    led_off() { this.sendl([0xdf]); }

    adread(n, fcn) { this.sendReceive([0xc0 + n], 2, fcn); }
    dread(n, fcn) { this.sendReceive([0xc0 + n], 1, fcn); }

    redraw(l) { this.sendl([].concat(0xb0, l)); }
    dotbrightness(b) { this.sendl([0xb1, b]); }


    twobytes(n) { return [n & 0xff, (n >> 8) & 0xff]; }

    sendReceive(sendMessage, n, fcn) {
        this.respfcn = fcn;
        this.resp = [];
        this.respCount = n;
        var message = new Uint8Array([sendMessage])
        const writer = this.outputStream.getWriter();
        writer.write(message);
        writer.releaseLock();

    }

    sendl(command) {

        var message = new Uint8Array([command])
        const writer = this.outputStream.getWriter();
        writer.write(message);
        writer.releaseLock();

    }


    async openSerialPort() {
        var t = this;
        port = await navigator.serial.requestPort();
        await port.open({ baudrate: 115200 });
        reader = port.readable.getReader();
        this.outputStream = port.writable;
        startReading();

        async function startReading() {
            while (true) {
                const { value, done } = await reader.read();
                if (value) {
                    onrecc(value);
                    if (value[1] != 0) {
                        var newValue = value[0] + 256 * value[1]
                    } else {
                        var newValue = value[0];
                    }

                }
                if (done) {
                    reader.releaseLock();
                    break;
                }
            }

        }


        function onrecc(r) {
            var l = Array.from(new Uint8Array(r));
            for (var i in l) {
                gotChar(l[i]);
            }
        }

        function gotChar(c) {
            if (t.respCount == 0) return;
            else {
                t.resp.push(c);
                if (t.respCount > t.resp.length) return;
                if (t.respfcn) {
                    t.respfcn(t.resp);
                    t.respCount = 0;
                    t.resp = [];
                }
            }
        }

        //turtle, outside of class

        function rad(a){return a*2*Math.PI/360;}
        function deg(a){return a*360/(2*Math.PI);}
        function sindeg(x){return Math.sin(x*2*Math.PI/360);}
        function cosdeg(x){return Math.cos(x*2*Math.PI/360);}

    }


}

export var prims = {};

prims['repeat'] = {nargs: 2, flow: true, fcn: function(a,b){this.repeat(a,b);}}
prims['forever'] = {nargs: 1, flow: true, fcn: function(a){this.loop(a);}}
prims['loop'] = {nargs: 1, flow: true, fcn: function(a){this.loop(a);}}
prims['if'] = {nargs: 2, flow: true, fcn: function(a,b){this.logo_if(this.getbool(a),b);}}
prims['ifelse'] = {nargs: 3, flow: true, fcn: function(a,t,f){this.logo_ifelse(this.getbool(a),t,f);}}
prims['run'] = {nargs: 1, flow: true, fcn: function(l){this.logo_run(l);}}

prims['stop'] = {nargs: 0, flow: true, fcn: function(){this.procOutput(this);}}
prims['output'] = {nargs: 1, flow: true, fcn: function(x){return this.procOutput(this,x);}}
prims['wait'] = {nargs: 1, fcn: function(x){this.mwait(100*this.getnum(x));}}

prims['+'] = {nargs: 2, priority: -1, fcn: function(a,b){return a+b;}}
prims['-'] = {nargs: 2, priority: -1, fcn: function(a,b){return a-b;}}
prims['*'] = {nargs: 2, priority: -2, fcn: function(a,b){return a*b;}}
prims['/'] = {nargs: 2, priority: -2, fcn: function(a,b){return a/b;}}
prims['='] = {nargs: 2, priority: -2, fcn: function(a,b){return  this.equals(a,b);}}
prims['!='] = {nargs: 2, priority: -2, fcn: function(a,b){return ! this.equals(a,b);}}
prims['>'] = {nargs: 2, priority: -2, fcn: function(a,b){return a>b;}}
prims['<'] = {nargs: 2, priority: -2, fcn: function(a,b){return a<b;}}
prims['remainder'] = {nargs: 2, fcn: function(a,b){return this.getnum(a).mod(this.getnum(b));}}
prims['round'] = {nargs: 1, fcn: function(a){return Math.round(this.getnum(a));}}
prims['int'] = {nargs: 1, fcn: function(a){return Math.floor(this.getnum(a));}}
prims['minus'] = {nargs: 1, fcn: function(a){return -a;}}
prims['sin'] = {nargs: 1, fcn: function(a){return  this.sindeg(this.getnum(a));}}
prims['cos'] = {nargs: 1, fcn: function(a){return  this.cosdeg(this.getnum(a));}}
prims['sqrt'] = {nargs: 1, fcn: function(a){return Math.sqrt(this.getnum(a));}}
prims['random2'] = {nargs: 2, fcn: function(a,b){return  this.random.pickRandom(a,b);}}
prims['oneof'] = {nargs: 2, fcn: function(a,b){return  this.random.oneof(a,b);}}

prims['sum'] = {nargs: 2, fcn: function(a,b){return a+b;}}
prims['product'] = {nargs: 2, fcn: function(a,b){return a*b;}}

prims['se'] = {nargs: 2, fcn: function(a,b){return [].concat(a,b);}}
prims['word'] = {nargs: 2, fcn: function(a,b){return  this.word(a,b);}}
prims['first'] = {nargs: 1, fcn: function(a){return  this.first(a);}}
prims['butfirst'] = {nargs: 1, fcn: function(a){return  this.butfirst(a);}}
prims['bf'] = {nargs: 1, fcn: function(a){return  this.butfirst(a);}}
prims['last'] = {nargs: 1, fcn: function(a){return  this.last(a);}}
prims['bl'] = {nargs: 1, fcn: function(a){return  this.butlast(a);}}
prims['fput'] = {nargs: 2, fcn: function(a,b){var res = [].concat(this.getlist(b)); 
    //res.unshift(a); 
    return res;}}
prims['lput'] = {nargs: 2, fcn: function(a,b){var res = [].concat(this.getlist(b)); res.push(a); return res;}}
prims['count'] = {nargs: 1, fcn: function(a){return  this.count(a);}}
prims['item'] = {nargs: 2, fcn: function(n,l){return  this.item(n,l);}}
prims['nth'] = {nargs: 2, fcn: function(n,l){return this.getlist(l)[this.getnum(n)];}}
prims['setnth'] = {nargs: 3, fcn: function(n,l,d){this.getlist(l)[this.getnum(n)]=d;}}
prims['member?'] = {nargs: 2, fcn: function(x,l){return  this.member(x,l);}}
prims['empty?'] = {nargs: 1, fcn: function(l){return l.length==0;}}
prims['pick'] = {nargs: 1, fcn: function(l){return l[ this.random.pickRandom(0,this.getlist(l).length-1)];}}

prims['print'] = {nargs: 1, fcn: function(x){this.lprint( this.printstr(x));}}

prims['clean'] = {nargs: 0, fcn: function(n){ this.clean();}}
prims['forward'] = {nargs: 1, fcn: function(n){ this.forward(this.getnum(n));}}
prims['fd'] = {nargs: 1, fcn: function(n){ this.forward(this.getnum(n));}}
prims['back'] = {nargs: 1, fcn: function(n){ this.forward(this.getnum(-n));}}
prims['bk'] = {nargs: 1, fcn: function(n){ this.forward(this.getnum(-n));}}
prims['right'] = {nargs: 1, fcn: function(n){ this.right(this.getnum(n));}}
prims['rt'] = {nargs: 1, fcn: function(n){ this.right(this.getnum(n));}}
prims['left'] = {nargs: 1, fcn: function(n){ this.right(this.getnum(-n));}}
prims['lt'] = {nargs: 1, fcn: function(n){ this.right(this.getnum(-n));}}
prims['setheading'] = {nargs: 1, fcn: function(n){ this.seth(this.getnum(n));}}
prims['seth'] = {nargs: 1, fcn: function(n){ this.seth(this.getnum(n));}}
prims['setxy'] = {nargs: 2, fcn: function(x,y){ this.setxy(this.getnum(x),this.getnum(y));}}
prims['lineto'] = {nargs: 2, fcn: function(x,y){ this.lineto(this.getnum(x),this.getnum(y));}}
prims['arc'] = {nargs: 2, fcn: function(a,r){ this.arc(this.getnum(a),this.getnum(r));}}

prims['fillscreen'] = {nargs: 2, fcn: function(c,s){ this.fillscreen(this.getcolor(c),s);}}
prims['setcolor'] = {nargs: 1, fcn: function(n){ this.setcolor(this.getcolor(n));}}
prims['setc'] = {nargs: 1, fcn: function(n){ this.setcolor(this.getcolor(n));}}
prims['setshade'] = {nargs: 1, fcn: function(n){ this.setshade(n);}}
prims['setsh'] = {nargs: 1, fcn: function(n){ this.setshade(n);}}
prims['setpensize'] = {nargs: 1, fcn: function(n){ this.setpensize(n);}}
prims['setps'] = {nargs: 1, fcn: function(n){ this.setpensize(n);}}
prims['pendown'] = {nargs: 0, fcn: function(n){ this.pendown=true;}}
prims['pd'] = {nargs: 0, fcn: function(n){ this.pendown=true;}}
prims['penup'] = {nargs: 0, fcn: function(n){ this.pendown=false;}}
prims['pu'] = {nargs: 0, fcn: function(n){ this.pendown=false;}}
prims['startfill'] = {nargs: 0, fcn: function(){ this.startfill();}}
prims['endfill'] = {nargs: 0, fcn: function(){ this.endfill();}}
prims['setopacity'] = {nargs: 1, fcn: function(n){ this.opacity=this.getnum(n)/100;}}

prims['drawtext'] = {nargs: 1, fcn: function(str){ this.drawString(this.printstr(str));}}
prims['textalign'] = {nargs: 1, fcn: function(str){ this.textAlign(str);}}
prims['setfont'] = {nargs: 1, fcn: function(f){ this.setfont(f);}}
prims['setfontsize'] = {nargs: 1, fcn: function(s){ this.setfontsize(s);}}
prims['setlinestyle'] = {nargs: 1, fcn: function(l){ this.setlinedash(l);}}

prims['xcor'] = {nargs: 0, fcn: function(n){return  this.xcor;}}
prims['ycor'] = {nargs: 0, fcn: function(n){return  this.ycor;}}
prims['heading'] = {nargs: 0, fcn: function(n){return  this.heading;}}
prims['color'] = {nargs: 0, fcn: function(n){return  this.color;}}
prims['shade'] = {nargs: 0, fcn: function(n){return  this.shade;}}
prims['pensize'] = {nargs: 0, fcn: function(n){return  this.pensize;}}
prims['opacity'] = {nargs: 0, fcn: function(n){return 100* this.opacity;}}

prims['hideturtle'] = {nargs: 0, fcn: function(n){ this.hideTurtle();}}
prims['ht'] = {nargs: 0, fcn: function(n){ this.hideTurtle();}}
prims['showturtle'] = {nargs: 0, fcn: function(n){ this.showTurtle();}}
prims['st'] = {nargs: 0, fcn: function(n){ this.showTurtle();}}

//prims['snapimage'] = {nargs: 1, fcn: function(n){ this.snaps[n] = canvas.toDataURL();}}
prims['drawsnap'] = {nargs: 1, fcn: function(n){ this.hold= true;  this.loadimg( this.snaps[n], function(){ this.hold=false;});}}

prims['flushtime'] = {nargs: 1, fcn: function(n){var flushtime=this.getnum(n);}}

prims['( '] = {nargs: 1, fcn: function(x){this.evline.shift(); return x;}}
prims['se '] = {nargs: 'ipm', fcn: function(){return this.ipm_se(arguments);}}


prims['storeinbox1'] = {nargs: 1, fcn: function(n){this.boxes[0]=n;}}
prims['box1'] = {nargs: 0, fcn: function(){return this.boxes[0];}}
prims['storeinbox2'] = {nargs: 1, fcn: function(n){this.boxes[1]=n;}}
prims['box2'] = {nargs: 0, fcn: function(){return this.boxes[1];}}
prims['storeinbox3'] = {nargs: 1, fcn: function(n){this.boxes[2]=n;}}
prims['box3'] = {nargs: 0, fcn: function(){return this.boxes[2];}}

prims['resett'] = {nargs: 0, fcn: function(n){this.resett();}}
prims['timer'] = {nargs: 0, fcn: function(){return this.timer();}}
prims['unixtime'] = {nargs: 0, fcn: function(){return Math.floor(Date.now()/1000);}}
prims['time'] = {nargs: 0, fcn: function(){return  this.time();}}
prims['hours'] = {nargs: 0, fcn: function(){return  this.hours();}}
prims['minutes'] = {nargs: 0, fcn: function(){return  this.minutes();}}
prims['seconds'] = {nargs: 0, fcn: function(){return  this.seconds();}}
prims['2digit'] = {nargs: 1, fcn: function(n){return  this.twoDigit(n);}}
prims['clockspeed'] = {nargs: 1, fcn: function(n){this.clockspeed=this.getnum(n);}}
prims['scale'] = {nargs: 2, fcn: function(n,l){return  this.scale(this.getnum(n),this.getlist(l));}}

prims['true'] = {nargs: 0, fcn: function(){return true;}} 
prims['false'] = {nargs: 0, fcn: function(){return false;}} 

prims['make'] = {nargs: 2, fcn: function(a,b){this.setValue(a,b);}}
prims['local'] = {nargs: 1, fcn: function(a,b){this.makeLocal(a);}}