module.exports = function (actions) {
	return extractFilters(actions, []);
};

function extractFilters (actions, filters) {
	if (actions && actions[0] === 'by') {
		var terms = actions.slice(1);
		var key = terms.shift() || '-invalid query string-';

		var maybeOtherFilterIndex = findNextAndBy(terms);
		if (maybeOtherFilterIndex === -1) {
			filters.push({
				key: key,
				value: terms.join('/')
			});
		} else {
			filters.push({
				key: key,
				value: terms.slice(0, maybeOtherFilterIndex).join('/')
			});
			extractFilters(terms.slice(maybeOtherFilterIndex + 1), filters);
		}
	}
	return filters;
}

function findNextAndBy (terms, runningIndex) {
	runningIndex = runningIndex || 0;
	var maybeNextIndex = terms.indexOf('and', runningIndex);
	if (maybeNextIndex === -1) {
		return -1;
	} else if (terms[maybeNextIndex + 1] === 'by') {
		return maybeNextIndex;
	} else {
		return findNextAndBy(terms, maybeNextIndex + 1);
	}
}