import commandCenter from './cc';
import Logo from './logo';
import {prims} from './prims';
import Tokenizer from './tokenizer';
var boxes = [0,0,0];

const logo = new Logo;
const cc = new commandCenter;


export default class Procedures {

constructor(){
	var t = this;
	this.autocapitalize = 'off';
	this.autocorrect = 'off';
	this.autocomplete = 'off';
	this.spellcheck = false;
	this.focused = false;
	this.onfocus = function(){this.focused = true;};
	this.onblur = function(){this.focused = false; t.readProcs()};
	this.onkeydown = handleKeyDown;

	function handleKeyDown(e) {
	 if(e.ctrlKey){
	 	if(e.keyCode==70) {e.preventDefault(); e.stopPropagation(); cc.focus();}
	 	if(e.keyCode==71) {e.preventDefault(); e.stopPropagation(); t.readProcs(); commandCenter.runLine('go');}
	 	if(e.keyCode==190) {commandCenter.insert('stopped!\n'); logo.reset([]);}
	 }
	}
}

	
readProcs(){
	this.procString(this.value, 'normal');
}

procString(str, type){
	gatherSource();
	parseProcs();

	function gatherSource(){
		var thisproc = undefined;
		for(var i in prims) if((prims[i].type)=='normal') delete prims[i];
		var lines = str.split('\n');
		for(var i=0;i<lines.length;i++) procLines(lines[i]);

		function procLines(l){
			var sl = Tokenizer.parse(l);
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
		for(var p in prims){
			var prim = prims[p];
			var fcn = prim.fcn;
			if((typeof fcn)!='string') continue;
			if(prim.parsed) continue;
			prim.parsed = Tokenizer.parse(fcn);
			for(var i in prim.inputs) {
				if(prim.inputs[i].substring(0,1)==':') prim.inputs[i]=prim.inputs[i].substring(1);
			}
		}
	}
}
}
