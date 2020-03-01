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
import { FlowConnector } from './flow-connector';
import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';

import { ExecuteNodeHtmlPlugin } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPlugin } from './components/html-plugins/debug-node';
import { SliderNodeHtmlPlugin } from './components/html-plugins/slider-node';

import Worker from "worker-loader!./service-worker";

const worker = new Worker();


let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{
		"name" : "dummyReducer",
		"taskType": "ReduxPropertyStateType",
		"subtype": "registrate",
		"variableName": "dummy"
	}
]});

const flowrunnerConnector = new FlowConnector();
flowrunnerConnector.registerWorker(worker);


const renderHtmlNode = (node: any, flowrunnerConnector: IFlowrunnerConnector) => {
	if (node.htmlPlugin == "iframe") {
		return <iframe width={node.width || 250}
			height={node.height || 250}
		src={node.url}></iframe>;
	} else
	if (node.htmlPlugin == "executeNode") {
		return <ExecuteNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></ExecuteNodeHtmlPlugin>;
	} else
	if (node.htmlPlugin == "sliderNode") {
		return <SliderNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></SliderNodeHtmlPlugin>;
	} else
	if (node.htmlPlugin == "debugNode") {
		return <DebugNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></DebugNodeHtmlPlugin>;
	}

	return <div style={{
			width:node.width || 250,
			height:node.height || 250,
			backgroundColor: "white"
		}}></div>;
}

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
					<Toolbar flowrunnerConnector={flowrunnerConnector}></Toolbar>
					<Canvas renderHtmlNode={renderHtmlNode}
						flowrunnerConnector={flowrunnerConnector}
					></Canvas>
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
