import { startFlow, getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider } from 'react-redux';

import fetch from 'cross-fetch';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { reducers } from './redux/reducers';
import { Canvas } from './components/canvas';
import { Toolbar } from './components/toolbar';

let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{
		"name" : "dummyReducer",
		"taskType": "ReduxPropertyStateType",
		"subtype": "registrate"
	}
]});

const flowEventRunner = getFlowEventRunner();

startFlow(flowPackage, reducers).then((services : any) => {

	fetch('/get-flow')
	.then(res => {
		if (res.status >= 400) {
			throw new Error("Bad response from server");
		}
		return res.json();
	})
	.then(flowPackage => {
		console.log(flowPackage);	
		
		//const convertedFlow = HumanFlowToMachineFlow.convert(flowPackage);

		ReactDom.render(<>
			<Provider store={services.getStore()}>
					<Toolbar></Toolbar>
					<Canvas nodes={flowPackage}></Canvas>
			</Provider>
		</>, document.getElementById('flowstudio-root'));
		})
	.catch(err => {
		console.error(err);
	});
})
