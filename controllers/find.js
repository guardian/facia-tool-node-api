var generateHandler = require('../lib/generate-handler');

var handlers = {
	fronts: fronts,
	collections: collections
};

module.exports = generateHandler(handlers, function (req) {
	try {
		return JSON.parse(decodeURIComponent(req.query.q), function (key, val) {
			if (key === '$regex') {
				return new RegExp(val, 'g');
			} else {
				return val;
			}
		});
	} catch (ex) {
		return new Error('Invalid query string');
	}
});

function fronts (req, res, next, tool, query) {
	tool.config.fetch()
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
	tool.config.fetch()
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
					} else {
						// To keep the buffer going. If I don't write for a while
						// the collection is terminated because idle
						res.write((sentAny ? ',' : '') + 'null');
					}
					sentAny = true;
				})
				.then(function () {
					res.write(']');
					res.end();
				})
				.catch(function (err) {
					next(new Error('Unable to list collections: ' + err.message));
				});
			}
		} catch (ex) {
			next(new Error('Error while filtering: ' + ex.message));
		}
	}, function (err) {
		next(new Error('Unable to fetch the configuration: ' + err.message));
	});
}
