var restify = require('restify');
var packJson = require('./package.json');
var fs = require('fs');
var path = require('path');

var server = restify.createServer({
	name: packJson.name,
	version: packJson.version
});

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
				function (req, res, next) {
					req.action = req.params[1] ? req.params[1].split('/') : null;
					next();
				},
				require('./controllers/' + fileName)
			);
		}
	});

	server.listen(process.env.PORT || 9090);
});
