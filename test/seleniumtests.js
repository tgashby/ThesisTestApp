var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

driver.get('http://localhost:3000/tasks');
driver.findElement(webdriver.By.id('add-task')).sendKeys('Laundry');
driver.findElement(webdriver.By.id('add-task')).sendKeys('\n');
driver.findElement(webdriver.By.id('task-list')).findElements({className: 'task'}).then(function(elements) {
	var i = 0;

	driver.wait(function() {
		if (i < elements.length) {
			var ele = elements[i++];

	  		return ele.findElement({className: 'task-name'}).getText().then(function (innerText) {
	  			return innerText === 'Laundry';
	  		});
		}
	}, 2000);
});

driver.quit();
