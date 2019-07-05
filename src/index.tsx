import { startFlow, getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider } from 'react-redux';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { Canvas } from './components/canvas/canvas';

let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{	
		name:"test1",
		shapeType: "Circle", x: 100, y: 140,
		_outputs: ["test2"]
	},
	{	name:"test2",
		shapeType: "Rect", x: 200, y: 180},
	{name:"test3",shapeType: "Circle", x: 300, y: 220},
	{name:"test4",shapeType: "Circle", x: 400, y: 260},
	{name:"test5",shapeType: "Rect", x: 500, y: 300}
]});

const flowEventRunner = getFlowEventRunner();
console.log(flowPackage.flow);

startFlow(flowPackage).then((services : any) => {
	ReactDom.render(<>
			<Provider store={services.getStore()}>
			<>
				<Canvas nodes={flowPackage.flow}></Canvas>
			</>
		</Provider>
	</>, document.getElementById('flowstudio-root'));
})
