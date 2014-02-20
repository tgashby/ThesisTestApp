var assert = require("chai").assert

var debugOutput = false

// function AsyncSteps(count, done) {
//     this.count = count;
//     this.done = done;

//     this.finish = function() {
//         this.count--;

//         if (this.count < 0)
//             console.log("Too many async calls");

//         if (this.count === 0)
//             this.done();        
//     }
// }

describe("Task Spec", function () {
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

    beforeEach(function() {
      populateDB(req, res, next);
    });

    afterEach(function() {
      tearDownDB(req, res, next);
    });

    after(function () {
        tearDownDB(req, res, next);
    });

    it('should be able to list all tasks', function (done) {
    	tasks.list(req, res, next, function () {
            assert.equal(res.currPage, "tasks");
            assert.equal(res.renderObj.tasks.length, 2);
            done();
        });
    });

    it("should be able to add a task", function (done) {
        req.body = {};
        req.body.name = "Add Task";

        tasks.add(req, res, next, function () {
            req.db.tasks.count({completed:false}, function(error, itemCount) {
                if (error) return next(error);
                
                assert.equal(itemCount, 3);
                req.db.tasks.find({name:"Add Task"}).count(function(error, numTasks) {
                    if (error) return next(error);

                    assert.equal(numTasks, 1);
                    done();
                });
            }); 
        });
    });

    it("should be able to mark all tasks completed", function (done) {
        req.body.all_done = "true";

        tasks.markAllCompleted(req, res, next, function () {
            req.db.tasks.find({completed: true}).count(function(error, numTasks) {
                assert.equal(numTasks, 2);
                done()
            });
        });
    });
    
    it("should be able to show all completed tasks", function (done) {
        res.currPage = "BAD";

        req.db.tasks.findOne({completed: false}, function (error, task) {
            req.db.tasks.updateById(task._id, {
                $set: {
                    completed: true
                }
            }, function (error, count) {
                assert.equal(count, 1, "marked one as completed");

                tasks.completed(req, res, next, function () {
                    assert.equal(res.renderObj.tasks.length, 1, "showing completed");
                    assert.equal(res.currPage, 'tasks_completed');
                    done();
                });
            });
        });
    });
    
    it("should be able to mark a single task as completed", function (done) {
        req.task = {};

        req.db.tasks.findOne({completed: false}, function (error, task) {
            req.body.completed = "true"

            req.task._id = task._id;
            tasks.markCompleted(req, res, next, function () {
                req.db.tasks.find({_id: req.task._id, completed: true}).count(function (error,  numTasks) {
                    assert.equal(numTasks, 1);
                    done();
                });
            });            
        });
    });
    
    it("should be able to delete a task", function (done) {
        req.task = {};

        req.db.tasks.findOne({completed: false}, function (error, task) {
            req.body.completed = "true"

            req.task._id = task._id;
            tasks.del(req, res, next, function () {
                req.db.tasks.find().count(function (error,  numTasks) {
                    assert.equal(numTasks, 1);
                    assert.equal(res.httpCode, 200);
                    done();
                });
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

