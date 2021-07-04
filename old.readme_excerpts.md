The below description doesn't work anymore
.. you currently need webpack to build it first
.. TODO : when publishing the component also publish a directly usable version

previously webpack was configured to export an index.BUNDLE.js and
now it is index.js which gets overwritten by the tsc build





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
