var defaultConfig = {
	'bucket': 'facia-tool-store',
	'env': 'PROD',
	'configKey': 'frontsapi/config/config.json',
	'configHistoryPrefix': 'frontsapi/history/config',
	'collectionHistoryPrefix': 'frontsapi/history/collection',
	'collectionsPrefix': 'frontsapi/collection',
	'maxParallelRequests': 20
};

module.exports = function (override) {
	override = override || {};
	var config = {};
	Object.keys(defaultConfig).forEach(function (prop) {
		config[prop] = override[prop] !== undefined ? override[prop] : defaultConfig[prop];
	});
	return config;
};
