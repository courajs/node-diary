var fs = require('fs');
var readline = require('readline');
var path = require('path');

var diary_file = __dirname + '/diary.txt';
var archive = __dirname + '/diarchive';

if(!fs.existsSync(archive))
	fs.mkdir(archive);

if (fs.existsSync(diary_file)) {
	var files = fs.readdirSync(archive);
	var nums = files.map(function(name){return parseInt(path.basename(name, '.txt'))});
	var last = nums.reduce(function(a,b){return Math.max(a,b)}, 0);
	var filename = last + 1;
	fs.renameSync(diary_file, archive+'/'+filename+'.txt');
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('> ', 2);

clear();
rl.prompt();

var handler = short_handler;

rl.on('line', function(line){
	handler(line);
});

rl.on('close', function(){
console.log();	
})


var is_long_quote = false;
var long_quote = '';

function short_handler(line){
	if (line[0] === '"') {
		is_long_quote = true;
		rl.setPrompt('');
		handler = long_handler;
		long_handler(line.slice(1));
	}
	else {
		save_line(line);
		clear();
		rl.prompt();
	}
}

function long_handler(line){
	if (line[line.length - 1] === '"') {
		is_long_quote = false;
		long_quote += line.slice(0,-1);
		rl.setPrompt('> ');
		handler = short_handler;
		clear();
		save_block();
	}
	else
		long_quote += line + '\n';

	rl.prompt();
}

function clear() {
	process.stdout.write('\u001B[2J\u001B[0;0f');
}

function save_line(line){
	var text = '';
	text += new Date();
	text += '\n';
	text += line;
	text += '\n\n';
	fs.appendFile(diary_file, text);
}

function save_block(){
	save_line(long_quote);
	long_quote = '';
}