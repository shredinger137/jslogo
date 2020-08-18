
import Procedures from './procs';
import commandCenter from './cc';
import { prims } from './prims';
import Turtle from './turtle';

const turtle = new Turtle;
const cc = new commandCenter;
const procedures = new Procedures;


export default class Extensions {

	constructor() {
		this.fe = undefined;
		//loadbutton.onclick = load;
		//saveasbutton.onclick = function(e){saveas(e)};
		//savebutton.onclick = save;
		//gobutton.onclick = function(){cc.focus(); commandCenter.runLine('go');}
		//window.addEventListener('resize', resize);
		//cnvframe.addEventListener('click', paneToggle);
		//setTimeout(resize, 100);

		function load() {
			//cc.focus();
			var fr = new FileReader();
			fr.onload = function (e) { procedures.value = e.target.result; procedures.readProcs(); };

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
				procedures.readProcs();
			}

			function readimage() {
				turtle.loadpng(reader.result, this.createDragImage);
			}
		}

		function saveas(e) {
			cc.focus();
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
					ImageData.setImageData(turtle.ctx, procs.value);
					//canvas.toBlob(function(blob){next3(writer,blob);});
				}
				function next3(writer, blob) { writer.write(blob); }
			}
		}

		function save() {
			cc.focus();
			if (!procs) { var procs = { value: "null" } }
			var blob = new Blob([procs.value], { type: 'plain/text' });
			if (this.fe) {
				this.fe.createWriter(function (w) { w.truncate(0); });
				this.fe.createWriter(next2);
			}

			function next2(writer) { writer.write(blob); }
		}

		function paneToggle() {
			if (cc.style.visibility == 'hidden') onepane();
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

	loadStartup() {
		var req = new XMLHttpRequest();
		req.onreadystatechange = next;
		req.open('GET', 'startup.logo');
		req.send();

		function next() {
			if (req.readyState != 4) return;
			if (req.status != 200) return;
			procedures.procString(req.responseText, 'startup');
			if (prims['startup']) commandCenter.runLine('startup');
		}
	}

}

