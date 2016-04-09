/**
 * Angular Data Loader
 *
 * by Marcin Chwałek (marcinc81@gmail.com)
 */

angular.module('and-loader', [])

.factory('andLoader', function($http) {

	var _id = 1; // task serial

	var Task = function(parent, root) {
		this.id = _id++;	// new id
		this.tasks = [];	// list of sub-tasks to process 'then' (after)
		this.todo = [];		// list of requests to process 
		this.parent = parent || this;	// reference to parent task
		this.root = root || this;	// reference to root task
		this.status;

		if (this.root == this)
			this.root.reset();
	}

	// reset stats
	Task.prototype.reset = function() {
		this.status = {
			processed: 0,
			loaded: 0,
			failed: 0,
			total: 0
		}; 
	};

	// create sub-task
	Task.prototype.load = function() {
		var t = new Task(this, this.root);
		this.tasks.push(t);
		return t;
	}

	// end chain of sub-task's definitions
	Task.prototype.end = function() {
		return this.parent;
	}

	// process all sub-tasks
	Task.prototype.processTasks = function(cd_status) {
		for (var n in this.tasks) {
			var t = this.tasks[n];
			t._run(cd_status);
		}
	}

	// start loader
	Task.prototype.run = function(cb_status) {
		return this.root._run(cb_status);
	}

	// process all requests
	Task.prototype._run = function(cb_status) {
		var self = this;
		var processed = 0;

		for (var n in self.todo) {
			var t = self.todo[n];
			$http(t)
				.then(function(res) {
					self.root.status.loaded++;
					self.root.status.processed++;
					// if processed all requests then process all sub-tasks
					if (++processed == self.todo.length) self.processTasks(cb_status);

					if (cb_status) cb_status(self.root.status);
					if (res.config.cb) {
						res.config.cb(res);
					}
				}, function(res) {
					self.root.status.failed++;
					self.root.status.processed++;
					// if processed all requests then process all sub-tasks
					if (++processed == self.todo.length) self.processTasks(cb_status);

					// TODO exec other method for error handling
					if (cb_status) cb_status(self.root.status);
					if (res.config.cb) res.config.cb(res);
				});
		}

		return this;
	}

	// new GET request 
	Task.prototype.get = function(url, cb) {
		this.todo.push({
			url: url,
			method: 'GET',
			cb: cb
		});
		this.root.status.total++;
		return this;
	}

	// new POST request
	Task.prototype.post = function(url, data, cb) {
		this.todo.push({
			url: url,
			method: 'POST',
			data: data,
			cb: cb
		});
		this.root.status.total++;
		return this;	
	}

	// begin new sub-task group (tasks to be exec after)
	Task.prototype.then = function() {
		return this.parent.load();
	}

	return function() {
		return new Task();
	}
});

