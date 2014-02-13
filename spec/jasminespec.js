describe("Task Spec", function() {
    var tasks = require('../routes/tasks');
    var http = require('http');
    var mongoskin = require('mongoskin');
    var db = mongoskin.db('mongodb://localhost:27017/todo?auto_reconnect', {safe:true});

    var req = {};
    req.db = {};
    req.db.tasks = db.collection('tasks');

    var res = ...

    var next = ...

    // Prepopulate DB
    populateDB(req);
    
    it("should be able to list all tasks", function() {
        tasks.list(...);

        expect(...).toBe(...);
    });

    it("should be able to add a task", function() {
        tasks.add(...);

        expect(...).toBe(...);
    });

    it("should be able to mark all tasks completed", function() {
        tasks.markAllCompleted(...);

        expect(...).toBe(...);
    });

    it("should be able to show all completed tasks", function() {
        tasks.completed(...);

        expect(...).toBe(...);
    });

    it("should be able to mark a single task as completed", function() {
        tasks.markCompleted(...);

        expect(...).toBe(...);
    });;

    it("should be able to delete a task", function() {
        tasks.del(...);

        expect(...).toBe(...);
    });
});

function populateDB (req, res, next) {
    req.db.tasks.save({
      name: "Task One",
      completed: false
    }, function(error, task){
      if (error) return next(error);
      if (!task) return next(new Error('Failed to save.'));
      console.info('Added %s with id=%s', task.name, task._id);
      // res.redirect('/tasks');
    });

    req.db.tasks.save({
      name: "Task Two",
      completed: false
    }, function(error, task){
      if (error) return next(error);
      if (!task) return next(new Error('Failed to save.'));
      console.info('Added %s with id=%s', task.name, task._id);
      // res.redirect('/tasks');
    });
}