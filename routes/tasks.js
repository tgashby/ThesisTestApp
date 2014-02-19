/*
 * GET users listing.
 */

exports.list = function(req, res, next, callback) {
   req.db.tasks.find({
      completed: false
   }).toArray(function(error, tasks) {
      if (error) return next(error);
      res.render('tasks', {
         title: 'Todo List',
         tasks: tasks || []
      });

      if (callback)
         callback();
   });
};

exports.add = function(req, res, next, callback) {
   if (!req.body || !req.body.name) return next(new Error('No data provided.'));
   req.db.tasks.save({
      name: req.body.name,
      completed: false
   }, function(error, task) {
      if (error) return next(error);
      if (!task) return next(new Error('Failed to save.'));
      console.info('Added %s with id=%s', task.name, task._id);
      res.redirect('/tasks');

      if (callback)
         callback();
   })
};

exports.markAllCompleted = function(req, res, next, callback) {
   if (!req.body.all_done || req.body.all_done !== 'true') return next();
   req.db.tasks.update({
      completed: false
   }, {
      $set: {
         completed: true
      }
   }, {
      multi: true
   }, function(error, count) {
      if (error) return next(error);
      console.info('Marked %s task(s) completed.', count);
      res.redirect('/tasks');

      if (callback)
         callback();
   })
};

exports.completed = function(req, res, next, callback) {
   req.db.tasks.find({
      completed: true
   }).toArray(function(error, tasks) {
      res.render('tasks_completed', {
         title: 'Completed',
         tasks: tasks || []
      });

      if (callback)
         callback();
   });
};

exports.markCompleted = function(req, res, next, callback) {
   if (!req.body.completed) return next(new Error('Param is missing'));
   req.db.tasks.updateById(req.task._id, {
      $set: {
         completed: req.body.completed === 'true'
      }
   }, function(error, count) {
      if (error) return next(error);
      if (count !== 1) return next(new Error('Something went wrong.'));
      console.info('Marked task %s with id=%s completed.', req.task.name, req.task._id);
      res.redirect('/tasks');

      if (callback)
         callback();
   })
};

exports.del = function(req, res, next, callback) {
   req.db.tasks.removeById(req.task._id, function(error, count) {
      if (error) return next(error);
      if (count !== 1) return next(new Error('Something went wrong.'));
      console.info('Deleted task %s with id=%s completed.', req.task.name, req.task._id);
      res.send(200);

      if (callback)
         callback();
   });
};