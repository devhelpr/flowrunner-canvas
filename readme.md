# What is Flowrunner-canvas?

Flowrunner-canvas is a flow based programming environment that can very easily be added to an existent frontend javascript/typescript toolchain.

Flowrunner-canvas is a visual editor for creating flows that can be run with the @devhelpr/flowrunner npm package. It runs within your dev environment in the browser, locally on a dev machine,

Flowrunner-canvas uses Nodejs express to add some basic http services to read and store the flows on the location where you specify it to be stored. 

The basic flowrunner-canvas just uses the standard flowrunner taskplugins, but you can add plugins depending on your needs.

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

with contents an empty aray : []

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

with contents an empty aray : []

(you can place this file in another location, in that case change the location in your gulpfile)

- either add the startFlowServer task to your other gulp tasks using gulp.series and just run gulp or start it directly from the commandline using 'gulp startFlowServer'

# Publish and build instruction in case you want to contribute to flowrunner-canvas itself

- npx gulp 

	(also needed before publishing a new version)

- npm version [new version number]
- npm publish
