var argos = require('../lib/argos');

module.exports = function (req, res, next) {
	req.action = req.params[1] ? req.params[1].split('/') : null;
	req.argos = argos(req, res, next);

	next();
};
