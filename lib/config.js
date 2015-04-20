var defaultConfig = {
	"bucket": "aws-frontend-store",
	"env": "PROD",
	"configKey": "frontsapi/config/config.json",
	"configHistoryPrefix": "frontsapi/history/config",
	"collectionHistoryPrefix": "frontsapi/history/collection",
	"collectionsPrefix": "frontsapi/collection",
	"maxParallelRequests": 6
};

module.exports = function (override) {
	override = override || {};
	var config = {};
	Object.keys(defaultConfig).forEach(function (prop) {
		config[prop] = (prop in override) ? override[prop] : defaultConfig[prop];
	});
	return config;
};
