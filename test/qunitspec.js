var tasks = require('../routes/tasks');

var debugOutput = false

var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/todo?auto_reconnect', {
    safe: true
});

var req = {};
req.db = {};
req.db.tasks = db.collection('tasks');

var res = {};
res.currPage = "UI HOME";
res.renderObj = {};
res.httpCode = 0;
res.render = function(pageName, object) {

    if (debugOutput)
        console.info("RENDER: " + pageName);

    this.currPage = pageName;
    this.renderObj = object;
};

res.redirect = function(pageName) {
    if (debugOutput)
        console.info("REDIRECT: " + pageName);

    this.currPage = pageName;
}

res.send = function(sendCode) {
    if (debugOutput)
        console.info("SENDING: " + sendCode);

    this.httpCode = sendCode;
}

var next = function(error) {
    if (debugOutput)
        console.info("ERROR: " + error);
}

QUnit.testStart(function(details) {
  populateDB(req, res, next);
});

QUnit.testDone(function() {
  tearDownDB(req, res, next);
});

QUnit.module("Task Spec");

asyncTest('All tasks can be shown', function() {
	tasks.list(req, res, next, function () {
        equal(res.currPage, "tasks", "Correct page is being rendered.");
        equal(res.renderObj.tasks.length, 2, "Both tasks are being shown.");
        start();
    });
});

asyncTest("A task can be added", function() {
    req.body = {};
    req.body.name = "Add Task";

    tasks.add(req, res, next, function () {
        req.db.tasks.count({completed:false}, function(error, itemCount) {
            if (error) return next(error);
            
            equal(itemCount, 3, "The additional task is present.");
            req.db.tasks.find({name:"Add Task"}).count(function(error, numTasks) {
                if (error) return next(error);

                equal(numTasks, 1, "The exact task we added is there.");
                start();
            });
        }); 
    });
});

asyncTest("All tasks can be marked completed", function () {
    req.body.all_done = "true";

    tasks.markAllCompleted(req, res, next, function () {
        req.db.tasks.find({completed: true}).count(function(error, numTasks) {
            equal(numTasks, 2, "Both tasks are marked complete.");
            start();
        });
    });
});

asyncTest("All completed tasks can be shown.", function () {
    res.currPage = "BAD";

    req.db.tasks.findOne({completed: false}, function (error, task) {
        req.db.tasks.updateById(task._id, {
            $set: {
                completed: true
            }
        }, function (error, count) {
            equal(count, 1, "marked one as completed");

            tasks.completed(req, res, next, function () {
                equal(res.renderObj.tasks.length, 1, "The one we marked completed is shown.");
                equal(res.currPage, 'tasks_completed', "The correct page is shown.");
                start();
            });
        });
    });
});

asyncTest("A single task can be marked as completed", function () {
    req.task = {};

    req.db.tasks.findOne({completed: false}, function (error, task) {
        req.body.completed = "true"

        req.task._id = task._id;
        tasks.markCompleted(req, res, next, function () {
            req.db.tasks.find({_id: req.task._id, completed: true}).count(function (error,  numTasks) {
                equal(numTasks, 1, "Our one task is marked completed.");
                start();
            });
        });            
    });
});

asyncTest("A task can be deleted.", function () {
    req.task = {};

    req.db.tasks.findOne({completed: false}, function (error, task) {
        req.body.completed = "true"

        req.task._id = task._id;
        tasks.del(req, res, next, function () {
            req.db.tasks.find().count(function (error,  numTasks) {
                equal(numTasks, 1, "Only one task remains.");
                equal(res.httpCode, 200, "Page was sent the delete code, 200");
                start();
            });
        });            
    });
});

function populateDB(req, res, next) {
    addTask("Task One", req, res, next);
    addTask("Task Two", req, res, next);
}

function addTask(taskName, req, res, next) {
    req.db.tasks.save({
        name: taskName,
        completed: false
    }, function(error, task) {
        if (error) return next(error);
        if (!task) return next(new Error('Failed to save.'));
        
        if (debugOutput)
            console.info('Added %s with id=%s', task.name, task._id);
    });
}

function tearDownDB(req, res, next) {
    req.db.tasks.remove(function (error, tasks) {
        if (debugOutput)
            console.info("\nRemoved %s tasks.\n", tasks);
    });
}
