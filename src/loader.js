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
		this.processed;
		this.status_watchers = [];

		if (this.root == this)
			this.root.reset();
	}

	// reset stats
	Task.prototype.reset = function() {
		this.processed = 0;
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
		this.root.status_watchers.push(cb_status);
		this._update();
		return this.root._run();
	}

	// process all requests
	Task.prototype._run = function() {
		var self = this;
		for (var n in self.todo) {
			var t = self.todo[n];
			self._process(t);
		}
		return this;
	};


	// process to do item
	Task.prototype._process = function(t) {
		var self = this;
		// custom request
		if (t.cust) {
			t.cust(function(res) {
				self._handle(res, t, false);
			}, function(res) {
				self._handle(res, t, true);
			});
		} else 
		// promise request
		if (t.fn) {
			// is it promise object or function returning promise?
			var promise = t.fn.then? t.fn : t.fn();
			promise.then(function(res) {
				self._handle(res, t, false);
			}, function(res) {
				self._handle(res, t, true);
			});			
		} else {
			// simple http request
			$http(t)
				.then(function(res) {
					self._handle(res, t, false);
				}, function(res) {
					self._handle(res, t, true);
				});
		}
	};

	// handle task
	Task.prototype._handle = function(res, t, error) {
		var self = this; 
		if (error) self.root.status.failed++;
		else self.root.status.loaded++;

		self.root.status.processed++;
		if (++self.processed == self.todo.length) self.processTasks();

		this._update();
		if (t.cb) {
			t.cb(res, false);
		}

	};

	// update all status watchers
	Task.prototype._update = function() {
		for (var n in this.root.status_watchers) {
			var w = this.root.status_watchers[n];
			if (typeof w == 'function') w(this.root.status);
		}
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

	// add custom request, like $resource - it must return a promise
	Task.prototype.res = function(fn, cb) {
		this.todo.push({
			fn: fn,
			cb: cb
		});
		this.root.status.total++;
		return this;
	}

	Task.prototype.cust = function(fn, cb) {
		this.todo.push({
			cust: fn,
			cb: cb
		});
		this.root.status.total++;
		return this;
	}

	// begin new sub-task group (tasks to be exec after)
	Task.prototype.then = function() {
		return this.parent.load();
	}

	// watch loader state
	Task.prototype.watch = function(cb) {
		this.root.status_watchers.push(cb);
		return this;
	}

	return function() {
		return new Task();
	}
})

