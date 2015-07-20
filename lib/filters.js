module.exports = function (actions) {
	var filters = [];

	if (actions && actions[0] === 'by') {
		var terms = actions.slice(1);

		do {
			filters.push({
				key: terms.shift() || '-invalid query string-',
				value: terms.shift()
			});
		}
		while (terms.length);
	}

	return filters;
};
