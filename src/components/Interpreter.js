export default class Interpreter  {

    translate(input) {
        console.log(input);
        if(LogoSendCommands[input]){
            console.log(LogoSendCommands[input]);
            return LogoSendCommands[input]
        } 
        if(input.match(/readADC/g))
        {
            console.log("conditional");
            return this.getReadADCCommand(input);
        }               
            return false;
        
    }

    getReadADCCommand(input){
        var inputArray = input.split(" ");
        var command = "0xc" + inputArray[1];
        return command;
    }


}




var LogoSendCommands = {
    OB1on: 0xef,
    OB1off: 0xdf,
    dp2on: 0xe2,
    dp3on: 0xe3,
    dp3off: 0xd3,
    dp4on: 0xe4,
    dp4off: 0xd4,
    dp5on: 0xe5,
    dp5off: 0xd5,
    dp6on: 0xe6,
    dp6off: 0xd6,
    dp7on: 0xe7,
    dp7off: 0xd7,
    dp8on: 0xe8,
    dp8off: 0xd8,
    dp9on: 0xe9,
    dp9off: 0xd9    
}

var logoWords = {};

logoWords['repeat'] = {args: 2, flow: true, fcn: function(a,b){this.repeat(a,b);}}
logoWords['plot'] = {args: 2, fcn: function(a,b){this.makeChart(a,b);}}
logoWords['plotpush'] = {args: 2, fcn: function(a,b){this.updateChart(a,b);}}
logoWords['forever'] = {args: 1, flow: true, fcn: function(a){this.loop(a);}}
logoWords['loop'] = {args: 1, flow: true, fcn: function(a){this.loop(a);}}
logoWords['if'] = {args: 2, flow: true, fcn: function(a,b){this.logo_if(this.getbool(a),b);}}
logoWords['ifelse'] = {args: 3, flow: true, fcn: function(a,t,f){this.logo_ifelse(this.getbool(a),t,f);}}
logoWords['run'] = {args: 1, flow: true, fcn: function(l){this.logo_run(l);}}

logoWords['stop'] = {args: 0, flow: true, fcn: function(){this.procOutput(this);}}
logoWords['output'] = {args: 1, flow: true, fcn: function(x){return this.procOutput(this,x);}}
logoWords['wait'] = {args: 1, fcn: function(x){this.mwait(100*this.getnum(x));}}

logoWords['+'] = {args: 2, priority: -1, fcn: function(a,b){return a+b;}}
logoWords['-'] = {args: 2, priority: -1, fcn: function(a,b){return a-b;}}
logoWords['*'] = {args: 2, priority: -2, fcn: function(a,b){return a*b;}}
logoWords['/'] = {args: 2, priority: -2, fcn: function(a,b){return a/b;}}

/*
logoWords['='] = {args: 2, priority: -2, fcn: function(a,b){return logo.equals(a,b);}}
logoWords['!='] = {args: 2, priority: -2, fcn: function(a,b){return !logo.equals(a,b);}}
logoWords['>'] = {args: 2, priority: -2, fcn: function(a,b){return a>b;}}
logoWords['<'] = {args: 2, priority: -2, fcn: function(a,b){return a<b;}}
logoWords['remainder'] = {args: 2, fcn: function(a,b){return this.getnum(a).mod(this.getnum(b));}}
logoWords['round'] = {args: 1, fcn: function(a){return Math.round(this.getnum(a));}}
logoWords['int'] = {args: 1, fcn: function(a){return Math.floor(this.getnum(a));}}
logoWords['minus'] = {args: 1, fcn: function(a){return -a;}}
logoWords['sin'] = {args: 1, fcn: function(a){return sindeg(this.getnum(a));}}
logoWords['cos'] = {args: 1, fcn: function(a){return cosdeg(this.getnum(a));}}
logoWords['sqrt'] = {args: 1, fcn: function(a){return Math.sqrt(this.getnum(a));}}
logoWords['random2'] = {args: 2, fcn: function(a,b){return random.pickRandom(a,b);}}
logoWords['oneof'] = {args: 2, fcn: function(a,b){return random.oneof(a,b);}}

logoWords['sum'] = {args: 2, fcn: function(a,b){return a+b;}}
logoWords['product'] = {args: 2, fcn: function(a,b){return a*b;}}

logoWords['se'] = {args: 2, fcn: function(a,b){return [].concat(a,b);}}
logoWords['word'] = {args: 2, fcn: function(a,b){return logo.word(a,b);}}
logoWords['first'] = {args: 1, fcn: function(a){return logo.first(a);}}
logoWords['butfirst'] = {args: 1, fcn: function(a){return logo.butfirst(a);}}
logoWords['bf'] = {args: 1, fcn: function(a){return logo.butfirst(a);}}
logoWords['last'] = {args: 1, fcn: function(a){return logo.last(a);}}
logoWords['bl'] = {args: 1, fcn: function(a){return logo.butlast(a);}}
logoWords['fput'] = {args: 2, fcn: function(a,b){var res = [].concat(this.getlist(b)); res.unshift(a); return res;}}
logoWords['lput'] = {args: 2, fcn: function(a,b){var res = [].concat(this.getlist(b)); res.push(a); return res;}}
logoWords['count'] = {args: 1, fcn: function(a){return logo.count(a);}}
logoWords['item'] = {args: 2, fcn: function(n,l){return logo.item(n,l);}}
logoWords['nth'] = {args: 2, fcn: function(n,l){return this.getlist(l)[this.getnum(n)];}}
logoWords['setnth'] = {args: 3, fcn: function(n,l,d){this.getlist(l)[this.getnum(n)]=d;}}
logoWords['member?'] = {args: 2, fcn: function(x,l){return logo.member(x,l);}}
logoWords['empty?'] = {args: 1, fcn: function(l){return l.length==0;}}
logoWords['pick'] = {args: 1, fcn: function(l){return l[random.pickRandom(0,this.getlist(l).length-1)];}}

logoWords['print'] = {args: 1, fcn: function(x){lprint(logo.printstr(x));}}

logoWords['clean'] = {args: 0, fcn: function(n){turtle.clean();}}
logoWords['forward'] = {args: 1, fcn: function(n){turtle.forward(this.getnum(n));}}
logoWords['fd'] = {args: 1, fcn: function(n){turtle.forward(this.getnum(n));}}
logoWords['back'] = {args: 1, fcn: function(n){turtle.forward(this.getnum(-n));}}
logoWords['bk'] = {args: 1, fcn: function(n){turtle.forward(this.getnum(-n));}}
logoWords['right'] = {args: 1, fcn: function(n){turtle.right(this.getnum(n));}}
logoWords['rt'] = {args: 1, fcn: function(n){turtle.right(this.getnum(n));}}
logoWords['left'] = {args: 1, fcn: function(n){turtle.right(this.getnum(-n));}}
logoWords['lt'] = {args: 1, fcn: function(n){turtle.right(this.getnum(-n));}}
logoWords['setheading'] = {args: 1, fcn: function(n){turtle.seth(this.getnum(n));}}
logoWords['seth'] = {args: 1, fcn: function(n){turtle.seth(this.getnum(n));}}
logoWords['setxy'] = {args: 2, fcn: function(x,y){turtle.setxy(this.getnum(x),this.getnum(y));}}
logoWords['lineto'] = {args: 2, fcn: function(x,y){turtle.lineto(this.getnum(x),this.getnum(y));}}
logoWords['arc'] = {args: 2, fcn: function(a,r){turtle.arc(this.getnum(a),this.getnum(r));}}

logoWords['fillscreen'] = {args: 2, fcn: function(c,s){turtle.fillscreen(this.getcolor(c),s);}}
logoWords['setcolor'] = {args: 1, fcn: function(n){turtle.setcolor(this.getcolor(n));}}
logoWords['setc'] = {args: 1, fcn: function(n){turtle.setcolor(this.getcolor(n));}}
logoWords['setshade'] = {args: 1, fcn: function(n){turtle.setshade(n);}}
logoWords['setsh'] = {args: 1, fcn: function(n){turtle.setshade(n);}}
logoWords['setpensize'] = {args: 1, fcn: function(n){turtle.setpensize(n);}}
logoWords['setps'] = {args: 1, fcn: function(n){turtle.setpensize(n);}}
logoWords['pendown'] = {args: 0, fcn: function(n){turtle.pendown=true;}}
logoWords['pd'] = {args: 0, fcn: function(n){turtle.pendown=true;}}
logoWords['penup'] = {args: 0, fcn: function(n){turtle.pendown=false;}}
logoWords['pu'] = {args: 0, fcn: function(n){turtle.pendown=false;}}
logoWords['startfill'] = {args: 0, fcn: function(){turtle.startfill();}}
logoWords['endfill'] = {args: 0, fcn: function(){turtle.endfill();}}
logoWords['setopacity'] = {args: 1, fcn: function(n){turtle.opacity=this.getnum(n)/100;}}

logoWords['drawtext'] = {args: 1, fcn: function(str){turtle.drawString(this.printstr(str));}}
logoWords['textalign'] = {args: 1, fcn: function(str){logo.textAlign(str);}}
logoWords['setfont'] = {args: 1, fcn: function(f){turtle.setfont(f);}}
logoWords['setfontsize'] = {args: 1, fcn: function(s){turtle.setfontsize(s);}}
logoWords['setlinestyle'] = {args: 1, fcn: function(l){turtle.setlinedash(l);}}

logoWords['xcor'] = {args: 0, fcn: function(n){return turtle.xcor;}}
logoWords['ycor'] = {args: 0, fcn: function(n){return turtle.ycor;}}
logoWords['heading'] = {args: 0, fcn: function(n){return turtle.heading;}}
logoWords['color'] = {args: 0, fcn: function(n){return turtle.color;}}
logoWords['shade'] = {args: 0, fcn: function(n){return turtle.shade;}}
logoWords['pensize'] = {args: 0, fcn: function(n){return turtle.pensize;}}
logoWords['opacity'] = {args: 0, fcn: function(n){return 100*turtle.opacity;}}

logoWords['hideturtle'] = {args: 0, fcn: function(n){turtle.hideTurtle();}}
logoWords['ht'] = {args: 0, fcn: function(n){turtle.hideTurtle();}}
logoWords['showturtle'] = {args: 0, fcn: function(n){turtle.showTurtle();}}
logoWords['st'] = {args: 0, fcn: function(n){turtle.showTurtle();}}

logoWords['snapimage'] = {args: 1, fcn: function(n){turtle.snaps[n] = canvas.toDataURL();}}
logoWords['drawsnap'] = {args: 1, fcn: function(n){logo.hold= true; turtle.loadimg(turtle.snaps[n], function(){logo.hold=false;});}}

logoWords['flushtime'] = {args: 1, fcn: function(n){flushtime=this.getnum(n);}}

logoWords['( '] = {args: 1, fcn: function(x){this.evline.shift(); return x;}}
logoWords['se '] = {args: 'ipm', fcn: function(){return this.ipm_se(arguments);}}


logoWords['storeinbox1'] = {args: 1, fcn: function(n){boxes[0]=n;}}
logoWords['box1'] = {args: 0, fcn: function(){return boxes[0];}}
logoWords['storeinbox2'] = {args: 1, fcn: function(n){boxes[1]=n;}}
logoWords['box2'] = {args: 0, fcn: function(){return boxes[1];}}
logoWords['storeinbox3'] = {args: 1, fcn: function(n){boxes[2]=n;}}
logoWords['box3'] = {args: 0, fcn: function(){return boxes[2];}}

logoWords['resett'] = {args: 0, fcn: function(n){resett();}}
logoWords['timer'] = {args: 0, fcn: function(){return timer();}}
logoWords['unixtime'] = {args: 0, fcn: function(){return Math.floor(Date.now()/1000);}}
logoWords['time'] = {args: 0, fcn: function(){return logo.time();}}
logoWords['hours'] = {args: 0, fcn: function(){return logo.hours();}}
logoWords['minutes'] = {args: 0, fcn: function(){return logo.minutes();}}
logoWords['seconds'] = {args: 0, fcn: function(){return logo.seconds();}}
logoWords['2digit'] = {args: 1, fcn: function(n){return logo.twoDigit(n);}}
logoWords['clockspeed'] = {args: 1, fcn: function(n){this.clockspeed=this.getnum(n);}}
logoWords['scale'] = {args: 2, fcn: function(n,l){return logo.scale(this.getnum(n),this.getlist(l));}}

logoWords['true'] = {args: 0, fcn: function(){return true;}} 
logoWords['false'] = {args: 0, fcn: function(){return false;}} 

logoWords['make'] = {args: 2, fcn: function(a,b){this.setValue(a,b);}}
logoWords['local'] = {args: 1, fcn: function(a,b){this.makeLocal(a);}}

*/
