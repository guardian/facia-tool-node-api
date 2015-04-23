var restify = require('restify');
var packJson = require('./package.json');
var fs = require('fs');
var path = require('path');

var server = restify.createServer({
	name: packJson.name,
	version: packJson.version
});

server.use(restify.gzipResponse());
server.use(restify.CORS());
server.use(restify.queryParser({ mapParams: false }));
server.use(require('./lib/augment-request'));

fs.readdir(path.join(__dirname, 'controllers'), function (err, data) {
	if (err) {
		console.error(err);
		return;
	}

	data.forEach(function (fileName) {
		var match = fileName.match(/^([a-z]+)\.js/i);
		if (match) {
			server.get(
				new RegExp('^\/' + match[1].toLowerCase() + '(\/(.+))?'),
				require('./controllers/' + fileName)
			);
		}
	});

	server.listen(process.env.PORT || 9090);
});
