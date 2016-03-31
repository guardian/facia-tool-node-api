var test = require('tap').test;
var filters = require('../lib/filters');

test('extract filters', function (t) {
	t.same(filters([]), []);
	t.same(filters(['nothing']), []);
	t.same(filters(['by']), [{
		key: '-invalid query string-',
		value: ''
	}]);
	t.same(filters(['by', 'apple']), [{
		key: 'apple',
		value: ''
	}]);
	t.same(filters(['by', 'apple', 'pear']), [{
		key: 'apple',
		value: 'pear'
	}]);
	t.same(filters(['by', 'apple', 'pear', 'kiwi']), [{
		key: 'apple',
		value: 'pear/kiwi'
	}]);
	t.same(filters(['by', 'apple', 'pear', 'kiwi', 'banana']), [{
		key: 'apple',
		value: 'pear/kiwi/banana'
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'and']), [{
		key: 'fruit',
		value: 'apple/and'
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'and', 'pear']), [{
		key: 'fruit',
		value: 'apple/and/pear'
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'and', 'by']), [{
		key: 'fruit',
		value: 'apple'
	}, {
		key: '-invalid query string-',
		value: ''
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'and', 'by', 'pear']), [{
		key: 'fruit',
		value: 'apple'
	}, {
		key: 'pear',
		value: ''
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'and', 'by', 'color', 'yellow']), [{
		key: 'fruit',
		value: 'apple'
	}, {
		key: 'color',
		value: 'yellow'
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'pink', 'lady', 'and', 'by', 'color', 'yellow', 'striped']), [{
		key: 'fruit',
		value: 'apple/pink/lady'
	}, {
		key: 'color',
		value: 'yellow/striped'
	}]);
	t.same(filters(['by', 'fruit', 'apple', 'pink', 'lady',
		'and', 'by', 'color', 'yellow', 'striped',
		'and', 'by', 'size', 'small'
	]), [{
		key: 'fruit',
		value: 'apple/pink/lady'
	}, {
		key: 'color',
		value: 'yellow/striped'
	}, {
		key: 'size',
		value: 'small'
	}]);
	t.done();
});
