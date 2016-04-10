require('angular');
require('./loader.js');

var app = angular.module('and-test', ['and-loader']);

app.controller('main', function($scope, $http, andLoader) {

	//$scope.progress = 0;
	$scope.done = false;

	andLoader()
		.cust(function(onSuccess, onError) {
				$http.get('/res-1').then(onSuccess, onError);
			}, function(res, error) {
				$scope.res1 = res.data;
			})
		.res(function() {
				return $http.get('/res-2');
			}, function(res) {
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
