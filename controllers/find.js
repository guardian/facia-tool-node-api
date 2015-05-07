var FaciaTool = require('aws-s3-facia-tool');
var config = require('../lib/config');
var Promise = require('es6-promise').Promise;

module.exports = function (req, res, next) {
	var tool = new FaciaTool(config({
		'env': req.query.env
	}));

	if (types[req.action[0]]) {
		var query;
		try {
			query = JSON.parse(decodeURIComponent(req.query.q), function (key, val) {
				if (key === '$regex') {
					return new RegExp(val, 'g');
				} else {
					return val;
				}
			});
		} catch (ex) {
			next(new Error('Invalid query string'));
		}
		if (query) {
			types[req.action[0]](req, res, next, tool, query);
		}
	} else {
		next(new Error('Unknown action'));
	}
};

function fronts (req, res, next, tool, query) {
	tool.fetchConfig()
	.then(function (config) {
		try {
			res.charSet('utf-8');
			res.send(config.fronts.find(query));
		} catch (ex) {
			next(new Error('Error while filtering: ' + ex.message));
		}
	}, function (err) {
		next(new Error('Unable to fetch the configuration: ' + err.message));
	});
}

function collections (req, res, next, tool, query) {
	tool.fetchConfig()
	.then(function (config) {
		try {
			var filteredByConfig = config.collections.find(query);
			if (filteredByConfig.length) {
				res.charSet('utf-8');
				res.send(filteredByConfig);
			} else {
				// Couldn't find anything that matches the config, check the collection's
				// content, WARN this is slow, that's why I don't do it at first
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.write('[');
				var sentAny = false;
				tool.findCollections(null, function (collection) {
					var json = collection.toJSON();
					if (tool.query(query, [json]).length) {
						res.write((sentAny ? ',' : '') + JSON.stringify(json));
						sentAny = true;
					}
				})
				.then(function () {
					res.write(']');
					res.end();
				})
				.catch(function (err) {
					next(new Error('Unable to list collections: ' + err.message));
				})
			}
		} catch (ex) {
			next(new Error('Error while filtering: ' + ex.message));
		}
	}, function (err) {
		next(new Error('Unable to fetch the configuration: ' + err.message));
	});
}

var types = {
	fronts: fronts,
	collections: collections
};
