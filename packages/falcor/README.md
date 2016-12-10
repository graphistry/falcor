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
- An optional `recycleJSON` flag has been introduced which instructs the Model to diff and recycle the output JSON Objects across `get` calls. This allows us to significantly improve performance for stable queries (see `get` performance numbers below).
- An `onChangesCompleted` callback has been added to the API. This callback is similar to the existing `onChange` callback, except it's only called after all the operations that will change the cache have finished (this is more explicit than debouncing the `onChange` callback).
- `falcor-http-datasource` has been removed from the public browser build.
- The path syntax has been removed. To use the path syntax, you can use the [@graphistry/falcor-path-syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-path-syntax) module to parse strings into paths. Better yet, use the new [query syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-query-syntax) template string.

## Roadmap

- Apply `get` improvements to `set`.
- Internal code cleanup to reduce boilerplate and filesize.

## Performance Comparison

```
Get Tests:
   @netflix/falcor getJSON - 100 paths from cache x 13,715 ops/sec ±16.34% (70 runs sampled) (0.42% of 1 frame @ 60FPS)
@graphistry/falcor getJSON - 100 paths from cache x 26,009 ops/sec ±3.15% (75 runs sampled) (0.24% of 1 frame @ 60FPS)
@graphistry/falcor getJSON - 100 paths from cache x 3,100,760 ops/sec ±10.00% (78 runs sampled) (0% of 1 frame @ 60FPS) (recycled JSON)
   @netflix/falcor getJSONGraph - 100 paths from cache x 2,920 ops/sec ±2.10% (85 runs sampled) (2.04% of 1 frame @ 60FPS)
@graphistry/falcor getJSONGraph - 100 paths from cache x 2,516 ops/sec ±11.44% (67 runs sampled) (2.4% of 1 frame @ 60FPS)
   @netflix/falcor getVersion x 2,979,980 ops/sec ±2.41% (79 runs sampled) (0% of 1 frame @ 60FPS)
@graphistry/falcor getVersion x 5,019,760 ops/sec ±5.46% (78 runs sampled) (0% of 1 frame @ 60FPS)

Set Tests:
   @netflix/falcor setJSONGraph - 100 paths into cache x 5,800 ops/sec ±11.90% (77 runs sampled) (1.02% of 1 frame @ 60FPS)
@graphistry/falcor setJSONGraph - 100 paths into cache x 4,987 ops/sec ±10.68% (75 runs sampled) (1.2% of 1 frame @ 60FPS)
   @netflix/falcor setPathMaps - 100 paths into cache x 4,331 ops/sec ±1.67% (80 runs sampled) (1.38% of 1 frame @ 60FPS)
@graphistry/falcor setPathMaps - 100 paths into cache x 3,852 ops/sec ±6.05% (76 runs sampled) (1.56% of 1 frame @ 60FPS)
   @netflix/falcor setPathValues - 100 paths into cache x 2,354 ops/sec ±12.83% (68 runs sampled) (2.52% of 1 frame @ 60FPS)
@graphistry/falcor setPathValues - 100 paths into cache x 2,441 ops/sec ±9.82% (68 runs sampled) (2.46% of 1 frame @ 60FPS)

DataSource Tests:
   @netflix/falcor getJSON - 50 of 100 paths from DataSource x 1,100 ops/sec ±2.03% (81 runs sampled) (5.46% of 1 frame @ 60FPS)
@graphistry/falcor getJSON - 50 of 100 paths from DataSource x 1,557 ops/sec ±6.89% (73 runs sampled) (3.84% of 1 frame @ 60FPS)
@graphistry/falcor getJSON - 50 of 100 paths from DataSource x 47,791 ops/sec ±7.21% (78 runs sampled) (0.12% of 1 frame @ 60FPS) (recycled JSON)
   @netflix/falcor getJSONGraph - 50 of 100 paths from DataSource x 635 ops/sec ±8.75% (79 runs sampled) (9.42% of 1 frame @ 60FPS)
@graphistry/falcor getJSONGraph - 50 of 100 paths from DataSource x 614 ops/sec ±6.47% (73 runs sampled) (9.78% of 1 frame @ 60FPS)
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
