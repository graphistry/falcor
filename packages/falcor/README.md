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
- An optional `recycleJSON` flag has been introduced which instructs the Model to diff and recycle the output JSON Objects across `get` calls. This allows us to make some significant performance improvements (see `get` performance numbers below).
- An `onChangesCompleted` callback has been added to the API. This callback is similar to the existing `onChange` callback, except it's only called after all the operations that will change the cache have finished (this is more explicit than debouncing the `onChange` callback).
- `falcor-http-datasource` has been removed from the public browser build.
- The path syntax has been removed. To use the path syntax, you can use the [@graphistry/falcor-path-syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-path-syntax) module to parse strings into paths. Better yet, use the new [query syntax](https://github.com/graphistry/falcor/tree/master/packages/falcor-query-syntax) template string.

## Roadmap

- Apply `get` improvements to `set`.
- Internal code cleanup to reduce boilerplate and filesize.

## Performance Comparison

```
@netflix/falcor    getJSON - 100 paths from cache:
    11836.819404310283 ops/s
    0.08 ms/op
    0.48% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from cache:
    29952.45570157102 ops/s
    0.03 ms/op
    0.18% of 1 frame @ 60FPS

@graphistry/falcor getJSON - 100 paths from cache recycling the JSON:
    8356718.688533832 ops/s
    0 ms/op
    0% of 1 frame @ 60FPS

@netflix/falcor    setCache - cache with 100 videos:
    970.2200269131123 ops/s
    1.03 ms/op
    6.18% of 1 frame @ 60FPS

@graphistry/falcor setCache - cache with 100 videos:
    1308.6495876713034 ops/s
    0.76 ms/op
    4.56% of 1 frame @ 60FPS

@netflix/falcor    setJSONGraph - 100 paths into Cache:
    4487.478073921594 ops/s
    0.22 ms/op
    1.32% of 1 frame @ 60FPS

@graphistry/falcor setJSONGraph - 100 paths into Cache:
    5937.631079472985 ops/s
    0.17 ms/op
    1.02% of 1 frame @ 60FPS

@netflix/falcor    getVersion:
    2190813.937211525 ops/s
    0 ms/op
    0% of 1 frame @ 60FPS

@graphistry/falcor getVersion:
    3437878.525428905 ops/s
    0 ms/op
    0% of 1 frame @ 60FPS

@netflix/falcor    getJSON + setJSONGraph + getJSON - 100 paths from DataSource:
    528.3908358610701 ops/s
    1.89 ms/op
    11.34% of 1 frame @ 60FPS

@graphistry/falcor getJSON + setJSONGraph + getJSON - 100 paths from DataSource:
    583.6132178573525 ops/s
    1.71 ms/op
    10.26% of 1 frame @ 60FPS

@netflix/falcor    getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource:
    404.2896033359927 ops/s
    2.47 ms/op
    14.82% of 1 frame @ 60FPS

@graphistry/falcor getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource:
    399.88145166775513 ops/s
    2.5 ms/op
    15% of 1 frame @ 60FPS
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
