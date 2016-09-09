<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1016365/8711049/66438ebc-2b03-11e5-8a8a-75934f7ca7ec.png">
</p>

# Falcor

This is the [Graphistry](http://graphistry.com) fork of the FalcorJS client library. This library includes a number of bug fixes, performance improvements, and additional features, and will be actively maintained and developed.

## Differences between this project and Netflix/falcor

- Critical bugs have been fixed.
- Core `get` algorithm has been improved by ~100%.
- `getVersion` runtime is now `O(1)`.
- Performance tests have been added to benchmark against Netflix/falcor wherever possible.
- An optional `branchSelector` has been introduced to allow users to customize the results from `get` calls.
- An optional `JSONWithHashCodes` flag has been added which uses the `branchSelector` function to output JSON with lazily computed hashcodes so the JSON can be easily diff'd in methods like React's `shouldComponentUpdate`, Rx's `distinctUntilChanged`, etc.
- An `onChangesCompleted` callback has been added to the API. This callback is similar to the existing `onChange` callback, except it's only called after all the operations that will change the cache have finished (this is more explicit than debouncing the `onChange` callback).
- `falcor-http-datasource` has been removed from the public browser build.
- The path syntax has been removed. To use the path syntax, you can use the [@graphistry/falcor-path-syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-path-syntax) module to parse strings into paths. Better yet, use the new [query syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-query-syntax) template string.

## Roadmap

- Apply `get` improvements to `set`.
- Internal code cleanup to reduce boilerplate and filesize.
- Add an option to diff and recycle the same JSON tree across `get` calls to make React integration more seamless and further improve `get` performance.

## Performance tests

```
running Get Tests
finished Get Tests
@netflix/falcor    getJSON - 100 paths from Cache reusing the JSON seed: 
    14351.183452763491 ops/s
    0.07 ms/op
    0.42% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from Cache reusing the JSON seed: 
    31000.389350234313 ops/s
    0.03 ms/op
    0.18% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from Cache reusing the JSON seed with hash codes: 
    30572.051743342377 ops/s
    0.03 ms/op
    0.18% of 1 frame @ 60FPS

@netflix/falcor    getJSON - 100 paths from Cache with a new JSON seed each time: 
    14270.922475469748 ops/s
    0.07 ms/op
    0.42% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from Cache with a new JSON seed each time: 
    28208.509515725207 ops/s
    0.04 ms/op
    0.24% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from Cache with a new JSON seed each time with hash codes: 
    13935.847714830654 ops/s
    0.07 ms/op
    0.42% of 1 frame @ 60FPS

@netflix/falcor    getJSONGraph - 100 paths from Cache with a new JSON seed each time: 
    2952.6794755701467 ops/s
    0.34 ms/op
    2.04% of 1 frame @ 60FPS

@graphistry/falcor getJSONGraph - 100 paths from Cache with a new JSON seed each time: 
    3622.151260827047 ops/s
    0.28 ms/op
    1.68% of 1 frame @ 60FPS

running Set Tests
finished Set Tests
@netflix/falcor    setCache - cache with 100 videos: 
    958.7964400940479 ops/s
    1.04 ms/op
    6.24% of 1 frame @ 60FPS

@graphistry/falcor setCache - cache with 100 videos: 
    1346.9744029939243 ops/s
    0.74 ms/op
    4.44% of 1 frame @ 60FPS

@netflix/falcor    setJSONGraph - 100 paths into Cache: 
    4900.926111980225 ops/s
    0.2 ms/op
    1.2% of 1 frame @ 60FPS

@graphistry/falcor setJSONGraph - 100 paths into Cache: 
    5848.8269367686025 ops/s
    0.17 ms/op
    1.02% of 1 frame @ 60FPS

running Get Version Tests
finished Get Version Tests
@netflix/falcor    getVersion: 
    2389084.197179795 ops/s
    0 ms/op
    0% of 1 frame @ 60FPS

@graphistry/falcor getVersion: 
    3460093.371710837 ops/s
    0 ms/op
    0% of 1 frame @ 60FPS

running DataSource Tests
finished DataSource Tests
@netflix/falcor    getJSON + setJSONGraph + getJSON - 100 paths from DataSource: 
    817.0315602606574 ops/s
    1.22 ms/op
    7.32% of 1 frame @ 60FPS

@graphistry/falcor getJSON + setJSONGraph + getJSON - 100 paths from DataSource: 
    922.4957205839061 ops/s
    1.08 ms/op
    6.48% of 1 frame @ 60FPS

@netflix/falcor    getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource: 
    681.1629459899017 ops/s
    1.47 ms/op
    8.82% of 1 frame @ 60FPS

@graphistry/falcor getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource: 
    635.8154879127488 ops/s
    1.57 ms/op
    9.42% of 1 frame @ 60FPS
```

## Getting Started

You can check out a working example server for a Netflix-like application [here](http://github.com/netflix/falcor-express-demo) right now. Alternately you can go through this barebones tutorial in which we use the Falcor Router to create a Virtual JSON resource. In this tutorial we will use Falcor's express middleware to serve the Virtual JSON resource on an application server at the URL /model.json. We will also host a static web page on the same server which retrieves data from the Virtual JSON resource.

### Creating a Virtual JSON Resource

In this example we will use the falcor Router to build a Virtual JSON resource on an app server and host it at /model.json. The JSON resource will contain the following contents:

~~~js
{
  "greeting": "Hello World"
}
~~~

Normally Routers retrieve the data for their Virtual JSON resource from backend datastores or other web services on-demand. However in this simple tutorial the Router will simply return static data for a single key.

First we create a folder for our application server.

~~~bash
mkdir falcor-app-server
cd falcor-app-server
npm init
~~~

Now we install the falcor Router.

~~~bash
npm install falcor-router --save
~~~

Then install express and falcor-express.  Support for restify is also available, as is support for hapi via a [third-party implementation](https://github.com/Netflix/falcor-hapi).

~~~bash
npm install express --save
npm install falcor-express --save
~~~

Now we create an index.js file with the following contents:

~~~js
// index.js
var falcorExpress = require('falcor-express');
var Router = require('falcor-router');

var express = require('express');
var app = express();

app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
  // create a Virtual JSON resource with single key ("greeting")
  return new Router([
    {
      // match a request for the key "greeting"
      route: "greeting",
      // respond with a PathValue with the value of "Hello World."
      get: function() {
        return {path:["greeting"], value: "Hello World"};
      }
    }
  ]);
}));

// serve static files from current directory
app.use(express.static(__dirname + '/'));

var server = app.listen(3000);

~~~

Now we run the server, which will listen on port 3000 for requests for /model.json.

~~~sh
node index.js
~~~

### Retrieving Data from the Virtual JSON resource

Now that we've built a simple virtual JSON document with a single read-only key "greeting", we will create a test web page and retrieve this key from the server.

Now create an index.html file with the following contents:

~~~html
<!-- index.html -->
<html>
  <head>
    <!-- Do _not_  rely on this URL in production. Use only during development.  -->
    <script src="https://netflix.github.io/falcor/build/falcor.browser.js"></script>
    <!-- For production use. -->
    <!-- <script src="https://cdn.jsdelivr.net/falcor/{VERSION}/falcor.browser.min.js"></script> -->
    <script>
      var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json') });

      // retrieve the "greeting" key from the root of the Virtual JSON resource
      model.
        get("greeting").
        then(function(response) {
          document.write(response.json.greeting);
        });
    </script>
  </head>
  <body>
  </body>
</html>
~~~

Now visit http://localhost:3000/index.html and you should see the message retrieved from the server:

Hello World

## Additional Resources

For detailed high-level documentation explaining the Model, the Router, and JSON Graph check out the [Falcor website](http://netflix.github.io/falcor).

For API documentation, go [here](http://netflix.github.io/falcor/doc/Model.html)

For a working example of a Router, check out the [falcor-router-demo](http://github.com/netflix/falcor-router-demo).

For questions and discussion, use [Stack Overflow](http://stackoverflow.com/questions/tagged/falcor).
