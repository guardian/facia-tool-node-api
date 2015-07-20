var FaciaTool = require('aws-s3-facia-tool');
var createConfig = require('../lib/config');

module.exports = function (handlers) {
	return function (req, res, next) {
		if (!req.action || req.action.length < 1) {
			req.argos.send({}, handlers);
		} else if (handlers[req.action[0]]) {
			var tool = new FaciaTool(createConfig({
				'env': req.query.env
			}));

			// shift to consume an action
			handlers[req.action.shift()](req, res, next, tool);
		} else {
			next(new Error('Unknown action'));
		}
	};
};
