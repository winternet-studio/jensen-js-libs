var assert = require('assert');
var DateTime = require('../src/DateTime.js');

describe('DateTime', function() {
	describe('toMysqlDateTime()', function() {
		it('should convert dates correctly', function() {
			assert.equal(DateTime.toMysqlDateTime('22/4/2020 2:48pm', 'dmy/', 'Hm:'), '2020-04-22 14:48:00');
			assert.equal(DateTime.toMysqlDateTime('22/4/2020 2:48:23pm', 'dmy/', 'Hms:'), '2020-04-22 14:48:23');
		});
	});
});
