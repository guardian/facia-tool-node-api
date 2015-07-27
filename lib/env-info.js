var Table = require('cli-table');

var depTable = new Table({
	head: ['Package', 'Version']
});
var envTable = new Table({
	head: ['Variable', 'Value']
});

module.exports = function (packJson, secrets) {
	depTable.push([packJson.name, packJson.version]);
	iterateDependencies(packJson.dependencies, function (dep, pack) {
		depTable.push([dep, pack.version]);
	});

	for (var key in process.env) {
		if (keepSecret(key, secrets)) {
			envTable.push([key, ' -- secret -- ']);
		} else {
			envTable.push([key, process.env[key]]);
		}
	}

	return depTable.toString() + '\n' + envTable.toString();
};

function iterateDependencies (host, cb) {
	if (host) {
		for (var name in host) {
			var packPath = require(name + '/package.json');
			cb(name, packPath);
		}
	}
}

function keepSecret (key, all) {
	if (!all || all.length === 0) {
		return false;
	}

	for (var i = 0, len = all.length; i < len; i += 1) {
		var secret = all[i];

		if (typeof secret === 'string' && secret === key) {
			return true;
		} else if (secret instanceof RegExp && secret.test(key)) {
			return true;
		}
	}

	return false;
}
