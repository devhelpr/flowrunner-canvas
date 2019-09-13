#Publish and build

- npx gulp 

	(also needed before publishing a new version)

- npm version [new version number]
- npm publish

#How to use flowrunner-canvas in your own project

The following instructions assume yarn/node.js and/or gulp and the npm package @devhelpr/flowrunner-redux as project dependencies. Other variations are also possible but for now I focus on this.

- add flowrunner-canvas as dev dependency:

yarn add @devhelpr/flowrunner-canvas --dev

- add default flow file in assets directory :

flow.json 

with contents an empty aray : []


- add dev server via node.js:

add the following to file 'flowrunner-canvas.js' in the root of your project (adding this to gulp is also possible):


let startFlowStudioServer = require('@devhelpr/flowrunner-canvas/server/startFlowStudioServer');

let flowRunner = require('@devhelpr/flowrunner-redux').getFlowEventRunner();
let startFlow = require('@devhelpr/flowrunner-redux').startFlow;
startFlow({flow: []}, {
	dummyReducer : (state = {}, action) => {
		return state;
	}
}).then(function (services) {

	const metaDataInfo = flowRunner.getTaskMetaData().sort((a, b) => {
	  if (a.fullName < b.fullName) {
		return -1;
	  }
	  if (a.fullName > b.fullName) {
		return 1;
	  }
	  return 0;
	});

	startFlowStudioServer.start('./assets/flow.json',metaDataInfo);

}).catch((err) => {
	console.log("error", err);
});

- start flowrunner-canvas server via NodeJs directly:

node flowrunner-canvas.js

- in your local browser (chrome is preferred) visit localhost:4000 to start the flowrunner-canvas webapp



