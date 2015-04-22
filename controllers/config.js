var FaciaTool = require('aws-s3-facia-tool');
var config = require('../lib/config');
var Promise = require('es6-promise').Promise;

module.exports = function (req, res, next) {
	if (!req.action || req.action.length < 1) {
		getConfig(req, res, next);
	} else if (types[req.action[0]]) {
		types[req.action[0]](req, res, next);
	} else {
		next(new Error('Unknown action'));
	}
};

function getConfig (req, res, next) {
	var tool = new FaciaTool(config({
		"env": "CODE"
	}));

	tool.fetchConfig()
	.then(function (config) {
		res.send(config.json);
		next();
	})
	.catch(next);
}

function getCollection (req, res, next) {
	var tool = new FaciaTool(config({
		"env": "CODE"
	}));

	var id = req.action.slice(1).join('/');
	if (id) {
		Promise.all([
			tool.fetchConfig(),
			tool.fetchCollection(id)
		]).then(function (result) {
			var collectionConfig = result[0].collection(id),
				collection = result[1];

			if (!collectionConfig) {
				next(new Error('Collection ' + id + ' does not exists'));
			}
			if (!collection) {
				next(new Error('Collection ' + id + ' was never pressed'));
			}

			// Keep the draft private
			delete collection.raw.draft;
			res.send({
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

var types = {
	collection: getCollection
};
