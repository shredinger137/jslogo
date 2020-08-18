/////////////////////////
//
// CC Text Area
//
/////////////////////////

import Tokenizer from './tokenizer'
import Logo from './logo';


const logo = new Logo;
const tokenizer = new Tokenizer;

var runner;

export default class CommandCenter {

insert(str){
	var startpos = this.selectionStart;
	var endpos = this.selectionEnd;
	var t = this.value;
	var before = t.substring(0,startpos);
	var after = t.substring(endpos);
	var oldtop = this.scrollTop;
	this.value = before+str;
	var halfscroll = this.scrollHeight-this.scrollTop-this.offsetHeight;
	this.value = before+str+after;
	this.selectionStart = startpos+str.length;
	this.selectionEnd = startpos+str.length;
	if(halfscroll>0) this.scrollTop+=halfscroll;
	else this.scrollTop = oldtop;
}

runLine(str){
	var line = tokenizer.parse(str);
	logo.reset(line);
}

constructor(){
	this.autocapitalize = 'off';
	this.autocorrect = 'off';
	this.autocomplete = 'off';
	this.spellcheck = false;
	this.onkeydown = function(e){handleCCKeyDown(e);}
	this.focused = false;
	this.onfocus = function(){this.focused = true;};
	this.onblur = function(){this.focused = false;};
	this.value = 'Welcome to Logo!\n';
	this.selectionStart =  this.value.length + 1 ; 
	this.selectionEnd = this.value.length + 1;
	this.focus();
	

	function handleCCKeyDown(e) {
		var k = e.keyCode;
		if(k==13){
			if(e.shiftKey) insertcr(e);
			else handlecr(e);
		}
	 if(e.ctrlKey){
	 	//if(e.keyCode==70) {e.preventDefault(); e.stopPropagation(); procs.focus();}
	 	if(e.keyCode==71){e.preventDefault(); e.stopPropagation(); this.runLine('go');}
	  if(e.keyCode==190) {this.insert('stopped!\n'); logo.reset([]);}
	 }
	}

	function handlecr(e){
		var pos = this.selectionStart;
		var t = this.value;
		var start=t.lastIndexOf('\n', pos-1), end=t.indexOf('\n', pos);
		if(end<0) end=t.length;
		this.selectionStart = end+1;
		if(end!=t.length) e.preventDefault();
		var str = t.substring(start+1,end);
		this.runLine(str);
	}

	function insertcr(e){
		e.preventDefault();
		var pos = this.selectionStart;
		var t = this.value;
		var before = t.substring(0,pos);
		var after = t.substring(pos);
		this.value = before+'\n'+after;
		this.selectionStart = pos+1;
		this.selectionEnd = pos+1;
	}


}}
