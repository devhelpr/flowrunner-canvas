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
import { DebugInfo } from './components/debug-info';
import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';

import { ExecuteNodeHtmlPlugin } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPlugin, DebugNodeHtmlPluginInfo } from './components/html-plugins/debug-node';
import { SliderNodeHtmlPlugin, ContainedSliderNodeHtmlPlugin } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin } from './components/html-plugins/input-node';

import { setCustomConfig } from './config';

import Worker from "worker-loader!./flow-worker";

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
(window as any).react = React;

let pluginRegistry = {};

const root = document.getElementById('flowstudio-root');

const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";

let worker : Worker;

let flowrunnerConnector : any = undefined;

if (!!hasRunningFlowRunner) {
	flowrunnerConnector = new FlowConnector();
	worker = new Worker();
 	flowrunnerConnector.registerWorker(worker);
} else {
	flowrunnerConnector = new EmptyFlowConnector();
}


let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{
		"name" : "dummyReducer",
		"taskType": "ReduxPropertyStateType",
		"subtype": "registrate",
		"variableName": "dummy"
	}
]});

const getNodeInstance = (node: any, flowrunnerConnector: IFlowrunnerConnector, nodes : any, flow: any) => {
	
	if (node.htmlPlugin == "executeNode") {
		return new ExecuteNodeHtmlPlugin({
			node: node,
			flowrunnerConnector: flowrunnerConnector
		});
	} else
	if (node.htmlPlugin == "sliderNode") {
		return new ContainedSliderNodeHtmlPlugin({
			selectedNode: undefined,
			flowrunnerConnector: flowrunnerConnector,
			node: node,
			nodes: nodes,
			flow: flow
		});
	} else
	if (node.htmlPlugin == "inputNode") {
		return;	
	} else	
	if (node.htmlPlugin == "debugNode") {
		return new DebugNodeHtmlPluginInfo();
	}

	return;
}

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
	} else
	if (pluginRegistry[node.htmlPlugin]) {
		const Plugin = pluginRegistry[node.htmlPlugin].VisualizationComponent;
		
		node.visualizer = "children";
		
		return <DebugNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			nodes={nodes}
			flow={flow}
		><Plugin></Plugin></DebugNodeHtmlPlugin>;
	}

	return <div style={{
			width:node.width || 250,
			height:node.height || 250,
			backgroundColor: "white"
		}}></div>;
}

const flowEventRunner = getFlowEventRunner();
const hasLogin = root && root.getAttribute("data-has-login") === "true";
const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";

let canvasToolbarsubject = new Subject<string>();

interface IAppProps {
	isLoggedIn : boolean;
}

interface DefaultProps {

}

const App = (props : IAppProps) => {
	const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
	
	const onClose = () => {
		setLoggedIn(true);
		return true;
	}

	/*let Plugin : React.FunctionComponent<DefaultProps>;
	
	Plugin = React.Fragment;

	if (pluginRegistry["piechart"]) {
		Plugin = pluginRegistry["piechart"];
	}
	*/

	return <>
		{hasLogin && !loggedIn ? <Login onClose={onClose}></Login> : 
			<>
				<Taskbar></Taskbar>
				{!!hasUIControlsBar && flowrunnerConnector.isActiveFlowRunner() &&<UIControlsBar renderHtmlNode={renderHtmlNode}
					flowrunnerConnector={flowrunnerConnector}></UIControlsBar>}
				{!!hasUIControlsBar && flowrunnerConnector.isActiveFlowRunner() && <DebugInfo
					flowrunnerConnector={flowrunnerConnector}></DebugInfo>}

				<Toolbar canvasToolbarsubject={canvasToolbarsubject} flowrunnerConnector={flowrunnerConnector}></Toolbar>
				<Canvas canvasToolbarsubject={canvasToolbarsubject} 
					renderHtmlNode={renderHtmlNode}
					flowrunnerConnector={flowrunnerConnector}
					getNodeInstance={getNodeInstance}
				></Canvas>
				<FooterToolbar></FooterToolbar>	
			</>
		}
	</>;
}


startFlow(flowPackage, reducers).then((services : any) => {
	
	flowrunnerConnector.setPluginRegistry(pluginRegistry);

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
		console.log("pluginRegistry", pluginRegistry);
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


function registerFlowRunnerCanvasPlugin(name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName) {
	pluginRegistry[FlowTaskPluginClassName] = {
		VisualizationComponent: VisualizationComponent,
		FlowTaskPlugin: FlowTaskPlugin,
		FlowTaskPluginClassName: FlowTaskPluginClassName
	}
	console.log(pluginRegistry);

	setCustomConfig(FlowTaskPluginClassName, {
		shapeType: 'Html',
		presetValues : {
			htmlPlugin: FlowTaskPluginClassName
		}
	})
	flowrunnerConnector.setPluginRegistry(pluginRegistry);
}

(window as any).registerFlowRunnerCanvasPlugin = registerFlowRunnerCanvasPlugin;