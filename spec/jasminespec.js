function Flag() {
    var flag = false;
    var self = this;

    this.isDone = function () {
        return self.flag;
    }

    this.finish = function () {
        self.flag = true;
    }
}

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
    res.httpCode = 0;
    res.render = function(pageName, object) {
        console.info("RENDER: " + pageName);

        this.currPage = pageName;
        this.renderObj = object;
    };

    res.redirect = function(pageName) {
        console.info("REDIRECT: " + pageName);

        this.currPage = pageName;
    }

    res.send = function(sendCode) {
        console.info("SENDING: " + sendCode);

        this.httpCode = sendCode;
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

        // This is unfortunately better than the alternative of just guessing at a time.
        // Have to make an object because there's no pointers in JS :-\
        var flag = new Flag();

        runs(function () {
            tasks.list(req, res, next);

            waitForDB(db, flag);
        });

        waitsFor(function () {
            return flag.isDone();
        }, "waiting for list to finish.", 500);

        runs(function () {
            expect(res.currPage).toBe("tasks");
            expect(res.renderObj.tasks.length).toEqual(2);
        });
    });

    it("should be able to add a task", function() {
        req.body = {};
        req.body.name = "Add Task";

        tasks.add(req, res, next);

        var count = 0;
        var flag = new Flag();
        var flag2 = new Flag();

        runs(function() {
            req.db.tasks.count({completed:false}, function(error, itemCount) {
                if (error) return next(error);
                
                count = itemCount;
            });

            waitForDB(db, flag);
        })

        waitsFor(function () {
            return flag.isDone();
        }, "The count should increase.", 500);

        runs(function() {
            expect(count).toEqual(3);

            req.db.tasks.find({name:"Add Task"}).count(function(error, numTasks) {
                count = numTasks;
            });

            waitForDB(db, flag2);
        });
        
        waitsFor(function () {
            return flag2.isDone();
        }, "The count should increase.", 500);

        runs(function () {
            expect(count).toEqual(1);
        });
    });

    it("should be able to mark all tasks completed", function() {
        var flag = new Flag();
        var completedTaskNum = 0;

        req.body.all_done = "true";

        tasks.markAllCompleted(req, res, next);
        
        runs(function () {
            req.db.tasks.find({completed: true}).count(function(error, numTasks) {
                completedTaskNum = numTasks;
            });

            waitForDB(db, flag);
        });

        waitsFor(function () {
            return flag.isDone();
        }, "marking all tasks complete", 500);

        runs(function () {
            expect(completedTaskNum).toEqual(2);
        });
    });

    it("should be able to show all completed tasks", function() {
        var setupFlag = new Flag();
        var completedFuncFlag = new Flag();
        var completedTasksNum = 0;
        res.currPage = "BAD";

        runs(function () { 
            req.db.tasks.findOne({completed: false}, function (error, task) {
                req.db.tasks.updateById(task._id, {
                    $set: {
                        completed: true
                    }
                }, function (error, count) {
                    completedTasksNum = count;
                    console.info("Finished: " + new Date().getTime())
                });
            });

            waitForDB(db, setupFlag);
        });

        
        waitsFor(function () {
            return setupFlag.isDone();
        }, "setting up show completed tasks test", 500);

        runs(function () {
            console.info("Tests: " + new Date().getTime());

            tasks.completed(req, res, next);

            waitForDB(db, completedFuncFlag);
        });

        waitsFor(function () {
            return completedFuncFlag.isDone();
        }, "completed func call", 500);

        runs(function () {
            expect(res.renderObj.tasks.length).toEqual(1);
            expect(res.currPage).toBe('tasks_completed');
        })
    });

    it("should be able to mark a single task as completed", function() {
        var getIdFlag = new Flag();
        var markCompletedFlag = new Flag();
        var countFlag = new Flag();

        var count = 0;
        req.task = {};

        runs(function () {
            req.db.tasks.findOne({completed: false}, function (error, task) {
                req.body.completed = "true"

                req.task._id = task._id;
            });

            waitForDB(db, getIdFlag);
        });

        waitsFor(function () {
            return getIdFlag.isDone();
        }, "get id in markCompleted", 500);

        runs(function () { 
            tasks.markCompleted(req, res, next);

            waitForDB(db, markCompletedFlag);
        });

        waitsFor(function () {
            return markCompletedFlag.isDone();
        }, "markCompleted function call", 500);

        runs(function () {
            req.db.tasks.find({_id: req.task._id, completed: true}).count(function (error,  numTasks) {
                count = numTasks;
            });

            waitForDB(db, countFlag);
        });

        waitsFor(function() {
            return countFlag.isDone();
        }, "count in markCompleted", 500);

        runs(function () {
            expect(count).toBe(1);
        });
    });

    it("should be able to delete a task", function() {
        var getIdFlag = new Flag();
        var deletedCompletedFlag = new Flag();
        var countFlag = new Flag();

        var count = 0;
        req.task = {};

        runs(function () {
            req.db.tasks.findOne({completed: false}, function (error, task) {
                req.task._id = task._id;
            });

            waitForDB(db, getIdFlag);
        });

        waitsFor(function () {
            return getIdFlag.isDone();
        }, "get id in del", 500);

        runs(function () { 
            tasks.del(req, res, next);

            waitForDB(db, deletedCompletedFlag);
        });

        waitsFor(function () {
            return deletedCompletedFlag.isDone();
        }, "del function call", 500);

        runs(function () {
            req.db.tasks.find().count(function (error,  numTasks) {
                count = numTasks;
            });

            waitForDB(db, countFlag);
        });

        waitsFor(function() {
            return countFlag.isDone();
        }, "count in del", 500);

        runs(function () {
            expect(count).toBe(1);
            expect(res.httpCode).toEqual(200);
        });
    });

    // Nav tests!
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
        console.info('Added %s with id=%s', task.name, task._id);
    });
}

function tearDownDB(req, res, next) {
    req.db.tasks.remove(function (error, tasks) {
        console.info("\nRemoved %s tasks.\n", tasks);
    });
}

function waitForDB(db, flagObj) {
    db.collection('$cmd.sys.inprog').findOne(function (err, data) {
        if (err) { throw err; }

        if (data.inprog.length > 0) {
            console.info("Actually waiting!")
            setTimeout(function() { waitForDB(db, flag) }, 50);
        }
        else {
            flagObj.finish();
        }
    });
}
