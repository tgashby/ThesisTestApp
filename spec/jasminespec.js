describe("Task Spec", function() {
    var tasks = require('../routes/tasks');
    var http = require('http');
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
    res.render = function(pageName, object) {
        console.info("RENDER: " + pageName);
        console.info(object);

        this.currPage = pageName;
        this.renderObj = object;
    };

    res.redirect = function(pageName) {
        console.info("REDIRECT: " + pageName);

        this.currPage = pageName;
    }

    var next = function(error) {
        console.info("ERROR: " + error);
    }

    beforeEach(function() {
      populateDB(req, res, next);
    });

    afterEach(function() {
      tearDownDB(req, res, next);
    });

    it("should be able to list all tasks", function() {
        tasks.list(req, res, next);

        console.info("Res after list:")
        console.info(res)

        expect(res.currPage).toBe("tasks");
        expect(res.renderObj.tasks.length).toEqual(2);
    });

    // it("should be able to add a task", function() {
    //     tasks.add(...);

    //     expect(...).toBe(...);
    // });

    // it("should be able to mark all tasks completed", function() {
    //     tasks.markAllCompleted(...);

    //     expect(...).toBe(...);
    // });

    // it("should be able to show all completed tasks", function() {
    //     tasks.completed(...);

    //     expect(...).toBe(...);
    // });

    // it("should be able to mark a single task as completed", function() {
    //     tasks.markCompleted(...);

    //     expect(...).toBe(...);
    // });;

    // it("should be able to delete a task", function() {
    //     tasks.del(...);

    //     expect(...).toBe(...);
    // });
});

function populateDB(req, res, next) {
    req.db.tasks.save({
        name: "Task One",
        completed: false
    }, function(error, task) {
        if (error) return next(error);
        if (!task) return next(new Error('Failed to save.'));
        console.info('Added %s with id=%s', task.name, task._id);
        // res.redirect('/tasks');
    });

    req.db.tasks.save({
        name: "Task Two",
        completed: false
    }, function(error, task) {
        if (error) return next(error);
        if (!task) return next(new Error('Failed to save.'));
        console.info('Added %s with id=%s', task.name, task._id);
        // res.redirect('/tasks');
    });
}

function tearDownDB(req, res, next) {
    req.db.tasks.remove(function (error, tasks) {
        console.info("Removed %s tasks.", tasks);
    });
}
