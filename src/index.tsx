import { startFlow, getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider } from 'react-redux';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { Canvas } from './components/canvas/canvas';

let flowPackage = HumanFlowToMachineFlow.convert({flow: [

]});

const flowEventRunner = getFlowEventRunner();

startFlow(flowPackage).then((services : any) => {
	ReactDom.render(<>
			<Provider store={services.getStore()}>
			<>
				<Canvas></Canvas>
			</>
		</Provider>
	</>, document.getElementById('flowstudio-root'));
})
