var express = require('express');
var app = express();
var sleep = require('sleep');

app.use(express.static('public'));


app.get('/', function (req, res) {
  res.send('<a href="index.html">index</a>');
});

app.get('/res/', function (req, res) {
	var d = Math.random() * 1000000 + 100000;
	sleep.usleep(Math.floor(d));
  	res.send('delayed ' + d);
});

app.get('/res-1/', function (req, res) {
	sleep.usleep(1000000);
  	res.send('res 1');
});

app.get('/res-2/', function (req, res) {
	sleep.usleep(1500000);
  	res.send('res 2');
});

app.get('/res-3/', function (req, res) {
	sleep.usleep(1750000);
  	res.send('res 3');
});

app.get('/res-4/', function (req, res) {
	sleep.usleep(2500000);
  	res.send('res 4');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});