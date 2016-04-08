require('angular');
require('angular-route');
require('./loader.js');

var app = angular.module('and-test', ['and-loader']);

app.controller('main', function($scope, andLoader) {

	$scope.progress = 0;
	$scope.done = false;

	andLoader
		.get('/res-1', function(res) {
			$scope.res1 = res.data;
		})
		.get('/res-2', function(res) {
			$scope.res2 = res.data;
		})
		.then()
		.get('/res-3', function(res) {
			$scope.res3 = res.data;
		})
		.run(function(status) {
			$scope.progress = status.processed / status.total * 100;
			$scope.done = status.processed == status.total;
		});

});
