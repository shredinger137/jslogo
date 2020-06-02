
class Extensions {

constructor(){
	this.fe = undefined;
	loadbutton.onclick = load;
	saveasbutton.onclick = function(e){saveas(e)};
	savebutton.onclick = save;
	gobutton.onclick = function(){cc.focus(); commandCenter.runLine('go');}
	window.addEventListener('resize', resize);
	cnvframe.addEventListener('click', paneToggle);
	setTimeout(resize, 100);

	function load(){
		cc.focus();
	  var fr = new FileReader();
	  fr.onload = function(e){procs.value=e.target.result; procedures.readProcs();};
	  chrome.fileSystem.chooseEntry(next)

	  function next(fe){extensions.fe=fe; fe.file(next2);}

	  function next2(file){handleFile(file);}
	}

	function saveas(e){
		cc.focus();
		if(!e.shiftKey) saveAsText();
		else saveAsPNG()

		function saveAsText(){
			var name = (extensions.fe) ? extensions.fe.name : 'untitled.txt';
		  var blob = new Blob([procs.value], {type: 'plain/text'});
		  chrome.fileSystem.chooseEntry({type: "saveFile", suggestedName: name}, next1)

		  function next1(fe){if(fe){extensions.fe=fe; fe.createWriter(function(w){w.truncate(0);}); fe.createWriter(next2);}}
		  function next2(writer){writer.write(blob);}
		}

		function saveAsPNG(){
			var name = (extensions.fe) ? extensions.fe.name.replace('.txt','.png') : 'untitled.png';
		  chrome.fileSystem.chooseEntry({type: "saveFile", suggestedName: name}, next1)

		  function next1(fe){if(fe){fe.createWriter(function(w){w.truncate(0);}); fe.createWriter(next2);}}
		  function next2(writer){
		  	ImageData.setImageData(turtle.ctx, procs.value);
		  	canvas.toBlob(function(blob){next3(writer,blob);});
		  }
		  function next3(writer,blob){writer.write(blob);}
		 	}
	}

	function save(){
		cc.focus();
	  var blob = new Blob([procs.value], {type: 'plain/text'});
	  if(extensions.fe){
	  	extensions.fe.createWriter(function(w){w.truncate(0);});
	  	extensions.fe.createWriter(next2);
	  }

	  function next2(writer){writer.write(blob);}
	}

	function paneToggle () {
		if(cc.style.visibility=='hidden') onepane();
		else threepanes();
	}

	function onepane(){
	 	loadbutton.style.visibility = 'hidden';
	 	savebutton.style.visibility = 'hidden';
	 	saveasbutton.style.visibility = 'hidden';
	 	gobutton.style.visibility = 'hidden';
	}

	function threepanes(){
	 	loadbutton.style.visibility = 'visible';
	 	savebutton.style.visibility = 'visible';
	 	saveasbutton.style.visibility = 'visible';
	 	gobutton.style.visibility = 'visible';
	}

	function resize(){
		gobutton.style.left = (procs.offsetWidth+10-67)+'px';
	}

}

loadStartup(){
	var req = new XMLHttpRequest();
	req.onreadystatechange= next;	
	req.open('GET','startup.logo');
	req.send();
	
	function next(){
	  if (req.readyState!=4) return;
	  if (req.status!=200) return;
	  procedures.procString(req.responseText, 'startup');
	  if(prims['startup']) commandCenter.runLine('startup');
	}
}

}

