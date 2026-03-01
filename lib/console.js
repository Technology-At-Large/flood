import * as util from 'util';
import * as child_process from 'child_process';
import { default as logTimestamp } from 'log-timestamp';

const exec = util.promisify(child_process.exec);
const instance_date = Date.now();

const reset = '\x1b[0m';
const dim = '\x1b[2m';
const black = '\x1b[30m';

const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';
const cyan = '\x1b[36m';
const white = '\x1b[37m';

const lRed = '\x1b[91m'; 	//Light Red
const lGre = '\x1b[92m'; 	//Light Green
const lYel = '\x1b[93m'; 	//Light Yellow
const lBlu = '\x1b[94m'; 	//Light Blue
const lMag = '\x1b[95m'; 	//Light Magenta
const lCya = '\x1b[96m'; 	//Light Cyan
const lWhi = '\x1b[97m'; 	//Light White

//=============================================================================
//	log decorations
//=============================================================================

function _no_log_decoration(){
    return '';
}

function _log_decoration() {
	let time_elapsed = Math.floor((parseInt(Date.now()) - parseInt(instance_date)) / 1000);
	let hb = new Date(Date.now());
	let d = hb.getUTCFullYear() + '-' + ('0' + hb.getUTCMonth()).slice(-2) + '-' + ('0' + hb.getUTCDate()).slice(-2) + ' ' + ('0' + hb.getUTCHours()).slice(-2) + ':' + ('0' + hb.getUTCMinutes()).slice(-2) + ':' + ('0' + hb.getUTCSeconds()).slice(-2) + '.' + ('000' + hb.getUTCMilliseconds()).slice(-3);

	return ' ┃ \x1b[2m' + d + '\x1b[0m ┃ \x1b[37m%s\x1b[0m \x1b[2m[' + time_elapsed + ']\x1b[0m';
}

//For Bunyun
function StdOutFormatter() {}
StdOutFormatter.prototype.write = function (rec) {
	let name = rec.name.toUpperCase();
	let time = rec.time.toISOString();
	let level = bunyan.nameFromLevel[rec.level].toUpperCase();
	let msg = rec.msg;
	let message = `<${name} | ${time} | ${level}>: ${msg}\n`;
	process.stdout.write(message);
}

const extendedConsole = Object.assign( console, {
	serviceStatusBox: function (message, status) {
		let padding_length = 76;
		let display_status = '';

		status = status || '';

		if (status.length != 0) {
			if (status == 'ON') {
				display_status = `${reset}[${lGre} ON ${reset}]`;
			} else if (status == 'OFF') {
				display_status = `${reset}[${lRed} OFF ${reset}]`;
			} else {
				display_status = `${reset}[${lCya} ${status} ${reset}]`;
			}

			padding_length = padding_length - (status.length + 4);
		} else {
			padding_length = padding_length - status.length;
		}

		message = message + ' '.repeat(80);
		message = message.substring(0, padding_length);
		message = message + display_status;

		console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
		console.log(`${reset}┃ ${message} ┃`);
		console.log(`${reset}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
	},
	serviceStatusBox2L: function (message1, message2, status) {
		let padding_length = 76;
		let display_status = '';

		status = status || '';

		if (status.length != 0) {
			if (status == 'ON') {
				display_status = `${reset}[${lGre} ON ${reset}]`;
			} else if (status == 'OFF') {
				display_status = `${reset}[${lRed} OFF ${reset}]`;
			} else {
				display_status = `${reset}[${lCya} ${status} ${reset}]`;
			}

			padding_length = padding_length - (status.length + 4);
		} else {
			padding_length = padding_length - status.length;
		}

		message1 = message1 + ' '.repeat(80);
		message1 = message1.substring(0, padding_length);
		message1 = message1 + display_status;

		message2 = message2 + ' '.repeat(80);
		message2 = message2.substring(0, 76);

		console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
		console.log(`${reset}┃ ${message1} ┃`);
		console.log(`${reset}┃ ${message2} ┃`);
		console.log(`${reset}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
	},
	serviceStatusBoxFromArray: function (title, itemArray, fnFormat = null) {
		let _this = this;

		if (itemArray.length > 0) {
			console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
			console.log((`${reset}┃ ` + title + ` `.repeat(100)).substring(0, 83) + `┃`);
			console.log(`${reset}┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫`);

			itemArray.forEach(function (item) {
				if (fnFormat !== null) {
					item = fnFormat(item);
				}
				console.log((`${reset}┃ ` + item + ` `.repeat(100)).substring(0, 83) + `┃`);
			});

			console.log(`${reset}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
		} else {
			console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
			console.log((`${reset}┃ ` + title + ` `.repeat(100)).substring(0, 83) + `┃`);
			console.log(`${reset}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
		}

		return this;
	},
	topBar: function () {
		logTimestamp( _no_log_decoration );
		// console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━┓`);
		// console.log(`${reset}┃╌╌╌╌╌╌╌ Timestamp ╌╌╌╌╌╌╌┃╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ Messages ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┃╌ Sec ╌┃`);
		// console.log(`${reset}┣━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━┛`);
		// logTimestamp( _log_decoration );
	},
	cliBar: function () {
		logTimestamp( _no_log_decoration );
		this.titleBox();
		// logTimestamp( _log_decoration );
	},

	titleBox: function () {
		console.log(`${reset}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
		console.log(`${reset}┃                                                                             ${reset} ┃`);
		console.log(`${reset}┃  ${lRed}     ██  █████  ███████ ██   █ ██ ███    █  █████  ██████  █████  ███    █  ${reset}┃`);
		console.log(`${reset}┃  ${lYel}     ██ ██    █ ██      ██   █ ██ ████   █ ██        ██   ██    █ ████   █  ${reset}┃`);
		console.log(`${reset}┃  ${lGre}     ██ ██    █ ███████ ██████ ██ ██ ██  █ ██  ███   ██   ██    █ ██ ██  █  ${reset}┃`);
		console.log(`${reset}┃  ${lBlu}██   ██ ██    █      ██ ██   █ ██ ██  ██ █ ██   ██   ██   ██    █ ██  ██ █  ${reset}┃`);
		console.log(`${reset}┃  ${lMag} █████   █████  ███████ ██   █ ██ ██   ███  █████    ██    █████  ██   ███  ${reset}┃`);
		console.log(`${reset}┃                                                                              ${reset}┃`);
		console.log(`${reset}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
	}
});


																			  
																			  


												
												
												



let fancyConsole = {};

fancyConsole = Object.assign( extendedConsole, console );

export { fancyConsole };