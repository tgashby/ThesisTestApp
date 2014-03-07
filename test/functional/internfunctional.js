define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	var url = 'localhost:3000/tasks.html';

	registerSuite({
		name: 'Todo (functional)',

		'submit form': function () {
			return this.remote
				.get(require.toUrl(url))
				.elementById('add-task')
				.clickElement()
				.keys('Task 1')
				.keys('\n')
				.keys('Task 2')
				.keys('\n')
				.keys('Task 3')
				.keys('\n')
				.getAttribute('value')
				.then(function (val) {
					assert.ok(val.indexOf('Task 3') > -1, 'Task 3 should remain in the new todo');
				});
		},

		'taut': function () {
			assert.equals(true, true);
		}
	});
});