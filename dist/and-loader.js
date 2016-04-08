var app  = angular.module('and-loader', []);

app.factory('andLoader', function($http) {

	var _id = 1;		// task serial
	var status = {		// loader status object
		processed: 0,
		loaded: 0,
		failed: 0,
		total: 0
	};

	var Task = function(parent) {
		this.id = _id++;							// new id
		this.tasks = [];							// list of sub-tasks to process 'then' (after)
		this.todo = [];								// list of requests to process 
		this.parent = parent || this;				// reference to parent task
	}

	// create sub-task
	Task.prototype.load = function() {
		var t = new Task(this);
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
		return main._run(cb_status);
	}

	// process all requests
	Task.prototype._run = function(cb_status) {
		var self = this;
		var processed = 0;

		for (var n in self.todo) {
			var t = self.todo[n];
			$http(t)
				.then(function(res) {
					status.loaded++;
					status.processed++;
					// if processed all requests then process all sub-tasks
					if (++processed == self.todo.length) self.processTasks(cb_status);

					if (cb_status) cb_status(status);
					if (res.config.cb) {
						res.config.cb(res);
					}
				}, function(res) {
					status.failed++;
					status.processed++;
					// if processed all requests then process all sub-tasks
					if (++processed == selg.todo.length) self.processTasks(cb_status);

					// TODO exec other method for error handling
					if (cb_status) cb_status(status);
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
		status.total++;
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
		status.total++;
		return this;	
	}

	// begin new sub-task group (tasks to be exec after)
	Task.prototype.then = function() {
		return this.parent.load();
	}

	// main task
	var main = new Task();
	return main;
});

