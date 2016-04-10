# Angular Data Loader

This is a simple and powerful data loader wich helps you to track and keep right order of loaded resources on your website. Please imagine, you have to load 4 resources from 4 different URLs, when the last one must be loaded as last - and always last. Instead to write some complex logic or nesting requests in response handlers, you can just use andLoader. Check out how to use it, it's pretty simple!

## Installation
The simples way: `npm i and-loader --save`. More complex way: just download it and include to your website.


## Usage
Once `and-loader.js` is included, add dependency to your Angular app: `angular.module('yourApp', ['and-loader']);`

In your controller, inject `adnLoader`, and you're ready to use it!

```
app.controller('ctrl', function(andLoader) {
	andLoader()
	.get('/some-res', function(res) {
		// do something with the response!
	})
	.get('/data', function(res) {
		// do something with the response!	
	})
	.then()
	.post('/post', data, function(res) {
		// ...
	})
	.run();
})
```

### Methods chaining
All methods can be called in a chain. It means it doesn't need to be executed directly from andLoader object, but from result of previous method, exactly like in an example above.

## Methods reference
| Method | Description |
| --- | --- |
| `andLoader()` | create new loader instance |
| `get(addr, cb)` | simple HTTP GET request, where `addr` is resource URL and `cb` is just a callback, more in 'Callback function' section |
| `post(addr, data, cb)` | simple HTTP POST request, params as above, `data` is a request's payload |
| `res(fn, cb)` | promise request, `fn` function returning promise - this will be resolved inside loader and `cb` will be called |
| `cust(fn, cb)` | custom request, see 'Custom requests' section |
| `then()` | creates group of requests, which will be loaded after finishing of loading requests from previous group |
| `end()` | finishes block (after `then()`) of requests definitions and returns previous group (btw. it's probably useless) |
| `run(staus)` | runs the loader and start processing requests, `status` is a callback function used to track loading progress |

### Callback function
Use this function to process a response. Callback function used for each kind of requests has the same format:
```
function (res, error) {
	// ...
}
```

Parameters:
- `res` - a response object, more here: [AngularJS / $http](https://docs.angularjs.org/api/ng/service/$http)
- `error` - boolean value, if true: there was an error

### Custom requests
Sometimes you can't just fetch some URL, you need to do some preprocessing or prepare request parametres based on response of previous requests. Here comes more universal method 'cust' (abbr. of 'custom').

```
.cust(function(onSuccess, onError) {
	// do something, such as: $http.get('/url').then(onSuccess, onError); or:
	$http.get('data').then(function(res) {
		// here process you response
		onSuccess(res);
	}, function(res) {
		// and here handle error response
		onError(res);
	});
});
```

Usage is really simple. Do manually your request, handle respnse and call function 'onSucces' if was OK or 'onError' if not. `cb` (general callback function) is optional in this case, the loader will call it after processing its internal code. You don't need to use it, handle your response directly in `cust` function. It's just simpler.

## Grouping requests
The andLoader has nice feature helping you to keep a right order of loaded data. Use `then()` to separe group of requests to be loaded _after_ last requests from previous group got response.

For instance:
`.get('/1').then().get('/2').run()` - here `/2` will be loaded when `/1` got response (has been processed)
`.get('/1').then().get('/2').then('/3').run()` - `/3` will be last, `/2` after `/1`
`.get('/1').then().get('/2').end().get('/3').run()` - `/2` last, when `/1` & `/3` got responses

## Tracking progress
`run` method contains optional parameter: `status`. Use it to track loading progress! See example below:

```
andLoader()
	.get('/url')
	.get('/other')
	.then()
	.get('/do-something')
	.get('/and-this')
	.run(function(status) {
		$scope.progress = status.processed / status.total * 100;
	});
```

Status object properties:
- `total` - total number of requests to process
- `processed` - number of processed requests
- `loaded` - number of successfuly processed requests
- `failed` - number of failed requests

## Building dist release
To generate dist files use command `gulp dist`.
