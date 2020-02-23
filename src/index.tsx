import { startFlow, getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import fetch from 'cross-fetch';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { reducers } from './redux/reducers';
import { Canvas } from './components/canvas';
import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';

let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{
		"name" : "dummyReducer",
		"taskType": "ReduxPropertyStateType",
		"subtype": "registrate",
		"variableName": "dummy"
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
		// nodes={flowPackage}
			(ReactDOM as any).createRoot(
				document.getElementById('flowstudio-root')
			).render(<Provider store={services.getStore()}>
					<Toolbar></Toolbar>
					<Canvas></Canvas>
					<FooterToolbar></FooterToolbar>
				</Provider>
			);		
		})
	.catch(err => {
		console.error(err);
	});
}).catch((err) => {
	console.log("error during start flowunner (check internal startFlow error)", err);
})
