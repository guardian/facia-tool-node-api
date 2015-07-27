var restify = require('restify');
var packJson = require('./package.json');
var fs = require('fs');
var path = require('path');
var envInfo = require('./lib/env-info');

console.log(envInfo(packJson, ['AWS_SECRET_ACCESS_KEY']));

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
	var endpoints = [];

	data.forEach(function (fileName) {
		var match = fileName.match(/^([a-z]+)\.js/i);

		if (match) {
			var matchedPath = match[1].toLowerCase(),
				middleware = require('./controllers/' + fileName);

			endpoints[matchedPath] = middleware;
			server.get(
				new RegExp('^\/' + match[1].toLowerCase() + '(\/(.+))?'),
				middleware
			);
		}
	});

	server.get('/', function (req, res, next) {
		req.argos.send({
			description: 'Fronts tool node API version ' + packJson.version,
			version: packJson.version
		}, endpoints);
		next();
	});

	server.listen(process.env.PORT || 9090);
});
