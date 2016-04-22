var FaciaTool = require('aws-s3-facia-tool');
var createConfig = require('../lib/config');

module.exports = function (req, res) {
	var tool = new FaciaTool(createConfig({
		'env': req.query.env
	}));

	tool.config.head()
	.then(function () {
		res.send(200, { status: 'ok' });
	})
	.catch(function (ex) {
		res.send(ex);
	});
};
