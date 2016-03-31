var generateHandler = require('../lib/generate-handler');
var filters = require('../lib/filters');

var handlers = {
	fronts: listFronts,
	collections: listCollections
};

module.exports = generateHandler(handlers);

function listFronts (req, res, next, tool) {
	var filter = filters(req.action)[0];

	tool.fetchConfig()
	.then(function (config) {
		if (filter) {
			if (filter.key === 'priority') {
				req.argos.send(config.listFrontsIds().filter(function (front) {
					return config.front(front).priority() === filter.value;
				}));
			} else {
				next(new Error('Unknown filter \'' + filter.key + '\''));
			}
		} else {
			req.argos.send(config.listFrontsIds(), {
				'by/priority': {
					append: '/{priority}'
				}
			});
		}
	})
	.catch(next);
}

function listCollections (req, res, next, tool) {
	var filter = filters(req.action)[0];

	tool.fetchConfig()
	.then(function (config) {
		if (filter) {
			if (filter.key === 'front' && filter.value === '-null-') {
				tool.listCollections()
				.then(function (list) {
					var missing = list.filter(function (object) {
						return !config.hasCollection(object.id);
					}).all.map(function (collection) {
						return collection.id;
					});
					req.argos.send(missing);
				})
				.catch(next);
			} else if (filter.key === 'front') {
				if (!config.hasFront(filter.value)) {
					next(new Error('Filtered front \'' + filter.value + '\' does not exist.'));
				} else {
					req.argos.send(config.front(filter.value).allCollections());
				}
			} else {
				next(new Error('Unknown filter \'' + filter.key + '\''));
			}
		} else {
			req.argos.send(config.listCollectionsIds(), {
				'by/front': {
					append: '/{id}'
				}
			});
		}
	})
	.catch(next);
}
