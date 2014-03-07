module.exports = {
  "Task Add" : function (browser) {
    browser
      .url("http://localhost:3000/tasks")
      .waitForElementVisible('body', 1000)
      .setValue('#add-task', 'nightwatch')
      .setValue('#add-task', '\n')
      .pause(1000)
      .assert.elementPresent('span.task-name[name=nightwatch]')
      .end();
  }
};
