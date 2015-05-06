var FaciaTool = require('aws-s3-facia-tool');
var config = require('../lib/config');
var Promise = require('es6-promise').Promise;

module.exports = function (req, res, next) {
	var tool = new FaciaTool(config({
		"env": req.query.env
	}));

	if (!req.action || req.action.length < 1) {
		getConfig(req, res, next, tool);
	} else if (types[req.action[0]]) {
		types[req.action[0]](req, res, next, tool);
	} else {
		next(new Error('Unknown action'));
	}
};

function getConfig (req, res, next, tool) {
	tool.fetchConfig()
	.then(function (config) {
		res.send(config.json);
		next();
	})
	.catch(next);
}

function getCollection (req, res, next, tool) {
	var id = req.action.slice(1).join('/');
	if (id) {
		Promise.all([
			tool.fetchConfig(),
			tool.fetchCollection(id)
		]).then(function (result) {
			var collectionConfig = result[0].collection(id),
				collection = result[1];

			if (!collectionConfig) {
				next(new Error('Collection \'' + id + '\' does not exists'));
			}
			if (!collection) {
				next(new Error('Collection \'' + id + '\' was never pressed'));
			}

			// Keep the draft private
			delete collection.raw.draft;
			res.send({
				_id: id,
				config: collectionConfig,
				collection: collection.raw
			});
		})
		.catch(function (err) {
			next(new Error('Error retrieving collection ' + id + ': ' + err.message));
		});
	} else {
		next(new Error('Missing collection ID'));
	}
}

function getFront (req, res, next, tool) {
	var id = req.action.slice(1).join('/');
	if (id) {
		tool.fetchConfig()
		.then(function (config) {
			var frontConfig = config.front(id);

			if (!frontConfig) {
				next(new Error('Front \'' + id + '\' does not exists'));
			}
			res.send({
				_id: id,
				config: frontConfig,
				collections: frontConfig.collections.map(function (collectionId) {
					var collectionConfig = config.collection(collectionId) || {};
					collectionConfig._id = collectionId;
					return collectionConfig;
				})
			});
		}, function (err) {
			next(new Error('Unable to fetch the configuration: ' + err.message));
		});
	} else {
		next(new Error('Missing front name'));
	}
}

var types = {
	collection: getCollection,
	front: getFront
};
