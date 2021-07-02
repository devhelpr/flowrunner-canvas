The below description doesn't work anymore
.. you currently need webpack to build it first
.. TODO : when publishing the component also publish a directly usable version

# How to use Flowrunner-canvas in your own project directly with Node.js

The following instructions assume yarn/node.js.

- add flowrunner-canvas as dev dependency:

yarn add @devhelpr/flowrunner-canvas --dev

- add dev server via node.js:

add the following to a new file 'flowrunner-canvas.js' in the root of your project :

```
let startFlowStudioServer = require('@devhelpr/flowrunner-canvas/server/startFlowStudioServer');

startFlowStudioServer.start('./assets/flow.json');
```

- add default flow file in assets directory :

flow.json 

with contents an empty array : []

(you can place this file in another location, in that case change the location in the flowrunner-canvas.js file)

- start flowrunner-canvas server via NodeJs directly:

node flowrunner-canvas.js

- in your local browser (chrome is preferred) visit localhost:4000 to start the flowrunner-canvas webapp


# How to use Flowrunner-canvas in your own project directly with Gulp

- yarn add @devhelpr/flowrunner-canvas --dev

- add the following to your gulpfile: 

var startFlowStudioServer = require('./server/startFlowStudioServer');

```
gulp.task('startFlowServer', function(cb) {
	startFlowStudioServer.start('./assets/flow.json');
	cb();
});
```

- add default flow file in assets directory:

flow.json 

with contents an empty array : []

(you can place this file in another location, in that case change the location in your gulpfile)

- either add the startFlowServer task to your other gulp tasks using gulp.series and just run gulp or start it directly from the commandline using 'gulp startFlowServer'


# How to use Flowrunner-canvas in your own project with webpack and as import

Requirements : 
- webpack 5
- webpack 5 required config :
	experiments: {
    	asyncWebAssembly: true
    }
- wasm extension should be allowed on your webserver
