import { startFlow, getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Observable, Subject } from '@reactivex/rxjs';

import fetch from 'cross-fetch';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { reducers } from './redux/reducers';
import { Canvas } from './components/canvas';
import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { Taskbar } from './components/Taskbar';
import { UIControlsBar} from './components/ui-controls-bar';

import { FlowConnector } from './flow-connector';
import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';

import { ExecuteNodeHtmlPlugin } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPlugin } from './components/html-plugins/debug-node';
import { SliderNodeHtmlPlugin } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin } from './components/html-plugins/input-node';

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


const renderHtmlNode = (node: any, flowrunnerConnector: IFlowrunnerConnector, nodes : any, flow: any) => {
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
			nodes={nodes}
			flow={flow}
		></SliderNodeHtmlPlugin>;
	} else
	if (node.htmlPlugin == "inputNode") {
		return <InputNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></InputNodeHtmlPlugin>;
	} else	
	if (node.htmlPlugin == "debugNode") {
		return <DebugNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			nodes={nodes}
			flow={flow}
		></DebugNodeHtmlPlugin>;
	}

	return <div style={{
			width:node.width || 250,
			height:node.height || 250,
			backgroundColor: "white"
		}}></div>;
}

const flowEventRunner = getFlowEventRunner();
const root = document.getElementById('flowstudio-root');
const hasLogin = root && root.getAttribute("data-has-login") === "true";
const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";

let canvasToolbarsubject = new Subject<string>();

interface IAppProps {
	isLoggedIn : boolean;
}
const App = (props : IAppProps) => {
	const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
	
	const onClose = () => {
		setLoggedIn(true);
		return true;
	}

	return <>
		{hasLogin && !loggedIn ? <Login onClose={onClose}></Login> : 
			<>
				<Taskbar></Taskbar>
				{!!hasUIControlsBar && <UIControlsBar renderHtmlNode={renderHtmlNode}
					flowrunnerConnector={flowrunnerConnector}></UIControlsBar>}
				<Toolbar canvasToolbarsubject={canvasToolbarsubject} flowrunnerConnector={flowrunnerConnector}></Toolbar>
				<Canvas canvasToolbarsubject={canvasToolbarsubject} renderHtmlNode={renderHtmlNode}
					flowrunnerConnector={flowrunnerConnector}
				></Canvas>
				<FooterToolbar></FooterToolbar>
			</>
		}
	</>;
}


startFlow(flowPackage, reducers).then((services : any) => {

	fetch('/api/verify-token', {
		method: "GET",			
		headers: {
		  "Content-Type": "application/json"
		}
	  })
	.then(res => {
		if (res.status >= 400) {
			return {
				isLoggedIn : false
			}
		}
		return {
			isLoggedIn : true
		}
	})
	.then(response => {
		(ReactDOM as any).createRoot(
			root
		).render(<Provider store={services.getStore()}>
				<App isLoggedIn={(response as any).isLoggedIn}></App>
			</Provider>
		);	
	})
	.catch(err => {
		console.error(err);
	});

				
		
}).catch((err) => {
	console.log("error during start flowunner (check internal startFlow error)", err);
})
