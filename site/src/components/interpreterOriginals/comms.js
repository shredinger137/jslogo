class Comms {


	constructor() {
		this.respfcn = undefined;
		this.respCount = 0;
		this.resp = [];
		this.respStr = '';
		this.serialID = undefined;
	}

	readsensor(n) {
		logo.hold = true;
		comms.adread(n, comms.gotsensor);
	}

	gotsensor(x) {
		var val = x[0] + 256 * x[1];
		logo.arglist.pop();
		logo.arglist.push(val);
		logo.hold = false;
	}

	readpin(n) {
		logo.hold = true;
		comms.dread(n, comms.gotpin);
	}

	gotpin(x) {
		logo.arglist.pop();
		logo.arglist.push(x[0] == 0);
		logo.hold = false;
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
		if (outputStream) {
			const writer = this.outputStream.getWriter();
			writer.write(message);
			writer.releaseLock();
		}

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
			console.log(r);
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


	}

}

var port;
var reader;
var outputStream;

prims['openport'] = { nargs: 0, fcn: function () { comms.openSerialPort(); } }

prims['ledon'] = { nargs: 0, fcn: function () { comms.led_on(); this.mwait(1); } }
prims['ledoff'] = { nargs: 0, fcn: function () { comms.led_off(); this.mwait(1); } }

prims['dp3on'] = { nargs: 0, fcn: function () { comms.pin_on(3); this.mwait(1); } }
prims['dp3off'] = { nargs: 0, fcn: function () { comms.pin_off(3); this.mwait(1); } }
prims['dp4on'] = { nargs: 0, fcn: function () { comms.pin_on(4); this.mwait(1); } }
prims['dp4off'] = { nargs: 0, fcn: function () { comms.pin_off(4); this.mwait(1); } }
prims['dp5on'] = { nargs: 0, fcn: function () { comms.pin_on(5); this.mwait(1); } }
prims['dp5off'] = { nargs: 0, fcn: function () { comms.pin_off(5); this.mwait(1); } }
prims['dp6on'] = { nargs: 0, fcn: function () { comms.pin_on(6); this.mwait(1); } }
prims['dp6off'] = { nargs: 0, fcn: function () { comms.pin_off(6); this.mwait(1); } }
prims['dp7on'] = { nargs: 0, fcn: function () { comms.pin_on(7); this.mwait(1); } }
prims['dp7off'] = { nargs: 0, fcn: function () { comms.pin_off(7); this.mwait(1); } }

prims['readADC0'] = { nargs: 0, fcn: function () { comms.readsensor(0); return this.cfun; } }
prims['readADC1'] = { nargs: 0, fcn: function () { comms.readsensor(1); return this.cfun; } }
prims['readADC2'] = { nargs: 0, fcn: function () { comms.readsensor(2); return this.cfun; } }
prims['readADC3'] = { nargs: 0, fcn: function () { comms.readsensor(3); return this.cfun; } }
prims['readADC4'] = { nargs: 0, fcn: function () { comms.readsensor(4); return this.cfun; } }
prims['readADC5'] = { nargs: 0, fcn: function () { comms.readsensor(5); return this.cfun; } }

prims['connected8'] = { nargs: 0, fcn: function () { comms.readpin(8); return this.cfun; } }
prims['connected9'] = { nargs: 0, fcn: function () { comms.readpin(9); return this.cfun; } }
prims['connected10'] = { nargs: 0, fcn: function () { comms.readpin(10); return this.cfun; } }
prims['connected11'] = { nargs: 0, fcn: function () { comms.readpin(11); return this.cfun; } }
prims['connected12'] = { nargs: 0, fcn: function () { comms.readpin(12); return this.cfun; } }

