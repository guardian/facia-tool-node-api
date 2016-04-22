var generateHandler = require('../lib/generate-handler');
var filters = require('../lib/filters');

var handlers = {
	fronts: listFronts,
	collections: listCollections,
	deleted: listDeleted
};

module.exports = generateHandler(handlers);

var possibleFilters = {
	fronts: {
		priority: function (value, config) {
			return function (front) {
				return config.front(front).priority() === value;
			};
		}
	},
	collections: {
		front: function (value, config) {
			var front = config.front(value);
			if (!front.config) {
				return new Error('Front \'' + value + '\' does not exist');
			} else {
				return function (collectionId) {
					return front.config.collections.indexOf(collectionId) !== -1;
				};
			}
		},
		metadata: function (value, config) {
			return function (collectionId) {
				var collection = config.collection(collectionId);
				return collection.hasMetadata(value);
			};
		}
	}
};
var possibleSorters = {
	collections: function (filters, filteredList, config) {
		// Sort only if there's a single 'front' filter
		var frontFilters = [];
		filters.forEach(function (filter) {
			if (filter.key === 'front') {
				frontFilters.push(filter.value);
			}
		});
		if (frontFilters.length === 1) {
			var collectionList = config.front(frontFilters[0]).config.collections;
			return filteredList.sort(function (a, b) {
				return collectionList.indexOf(a) - collectionList.indexOf(b);
			});
		} else {
			return filteredList;
		}
	}
};

function listFronts (req, res, next, tool) {
	tool.config.fetch()
	.then(function (config) {
		var list = config.listFrontsIds();
		var filtered = applyFilters(req.action, 'fronts', config, list);

		if (filtered instanceof Error) {
			next(filtered);
		} else {
			req.argos.send(filtered, req.action.length === 0 ? {
				'by/priority': {
					append: '/{priority}'
				}
			} : {
				'and/by/priority': {
					append: '/{priority}'
				}
			});
		}
	})
	.catch(next);
}

function listCollections (req, res, next, tool) {
	tool.config.fetch()
	.then(function (config) {
		var list = config.listCollectionsIds();
		var filtered = applyFilters(req.action, 'collections', config, list);

		if (filtered instanceof Error) {
			next(filtered);
		} else {
			req.argos.send(filtered, req.action.length === 0 ? {
				'by/front': {
					append: '/{id}'
				},
				'by/metadata': {
					append: '/{type}'
				}
			} : {
				'and/by/front': {
					append: '/{id}'
				},
				'and/by/metadata': {
					append: '/{type}'
				}
			});
		}
	})
	.catch(next);
}

function listDeleted (req, res, next, tool) {
	if (req.action[0] === 'collections') {
		tool.config.fetch()
		.then(function (config) {
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
		})
		.catch(next);
	} else {
		req.argos.send([], {
			'collections': true
		});
	}
}

function applyFilters (action, method, config, list) {
	var apply = filters(action);
	for (var i = 0, len = apply.length; i < len; i += 1) {
		var currentFilter = apply[i];
		var filterGenerator = (possibleFilters[method] || {})[currentFilter.key];

		if (!filterGenerator) {
			return new Error('Unknown filter \'' + currentFilter.key + '\'');
		} else if (filterGenerator instanceof Error) {
			return filterGenerator;
		} else {
			list = list.filter(filterGenerator(currentFilter.value, config));
		}
	}
	var sortFunction = possibleSorters[method];
	if (sortFunction) {
		list = sortFunction(apply, list, config);
	}
	return list;
}
