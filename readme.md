# Falcor Socket DataSource

[![Build Status](https://travis-ci.org/giovannicalo/falcor-socket-datasource.svg?branch=master)](https://travis-ci.org/giovannicalo/falcor-socket-datasource)
[![Coverage Status](https://coveralls.io/repos/giovannicalo/falcor-socket-datasource/badge.svg?branch=master&service=github)](https://coveralls.io/github/giovannicalo/falcor-socket-datasource?branch=master)
[![bitHound Score](https://www.bithound.io/github/giovannicalo/falcor-socket-datasource/badges/score.svg)](https://www.bithound.io/github/giovannicalo/falcor-socket-datasource)

A socket DataSource for [Falcor](https://github.com/Netflix/falcor).

## Installation

```
npm install falcor-socket-datasource
```

## Usage

1. Import Falcor and this library
2. Create a new `Falcor.Model`
3. Set its source to a new `FalcorSocketDataSource`
4. Use the model as usual

```
import Falcor from "falcor";
import FalcorSocketDataSource from "falcor-socket-datasource";

const model = new Falcor.Model({
	source: new FalcorSocketDataSource("ws://localhost:8080")
});

model.get(...).subscribe(...);
```

This library uses [Socket.IO Client](https://github.com/socketio/socket.io-client), so using [Socket.IO](https://github.com/socketio/socket.io) as a server would be a wise choice.

An example of a simple socket server can be found in [this test file](https://github.com/giovannicalo/falcor-socket-datasource/blob/master/test/server.js).
