import { startFlow } from '@devhelpr/flowrunner-redux';
import * as React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Observable, Subject } from '@reactivex/rxjs';

import fetch from 'cross-fetch';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { reducers } from './redux/reducers';
import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { Taskbar } from './components/Taskbar';
import { UIControlsBar} from './components/ui-controls-bar';
import { DebugInfo } from './components/debug-info';
import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { UserInterfaceViewEditor } from './components/userinterface-view-editor';

import { ExecuteNodeHtmlPlugin, ExecuteNodeHtmlPluginInfo } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPlugin, DebugNodeHtmlPluginInfo } from './components/html-plugins/debug-node';
import { SliderNodeHtmlPlugin, ContainedSliderNodeHtmlPlugin, SliderNodeHtmlPluginInfo } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin } from './components/html-plugins/input-node';
import { FormNodeHtmlPlugin , FormNodeHtmlPluginInfo } from './components/html-plugins/form-node';
import { GridEditNodeHtmlPlugin, GridEditNodeHtmlPluginInfo } from './components/html-plugins/grid-edit';
import { setCustomConfig } from './config';
import { DataGridNodeHtmlPluginInfo , DataGridNodeHtmlPlugin} from './components/html-plugins/data-grid-node';

import { Flow } from './components/flow';

let worker : Worker;

worker = new Worker("/worker.js");

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
//
// This is basically a trick to have "micro-frontends" in react
//
(window as any).react = React;

let pluginRegistry = {};

const root = document.getElementById('flowstudio-root');

const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";


let flowrunnerConnector : any = undefined;

if (!!hasRunningFlowRunner) {
	flowrunnerConnector = new FlowConnector();
	//worker = new Worker();
 	flowrunnerConnector.registerWorker(worker);
} else {
	flowrunnerConnector = new EmptyFlowConnector();
}



let applicationMode = ApplicationMode.Canvas;
 
const paths = location.pathname.split("/");
if (paths.length > 1) {
	if (paths[1] == "ui") {
		applicationMode = ApplicationMode.UI;
	}
}
flowrunnerConnector.setAppMode(applicationMode);

let flowPackage = HumanFlowToMachineFlow.convert({flow: [
	{
		"name" : "dummyReducer",
		"taskType": "ReduxPropertyStateType",
		"subtype": "registrate",
		"variableName": "dummy"
	}
]});

const getNodeInstance = (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => {
	
	let htmlPlugin = node.htmlPlugin;
	if (!htmlPlugin || htmlPlugin == "") {
		if (taskSettings) {
			htmlPlugin = taskSettings.htmlPlugin;
		}
	}

	if (htmlPlugin == "executeNode") {
		return new ExecuteNodeHtmlPluginInfo();
	} else
	if (htmlPlugin == "sliderNode") {
		return new SliderNodeHtmlPluginInfo();
	} else
	if (htmlPlugin == "gridEditNode") {
		return new GridEditNodeHtmlPluginInfo();
	} else
	if (htmlPlugin == "inputNode") {
		return;	
	} else	
	if (htmlPlugin == "formNode") {
		
		// TODO : add config as parameter to getNodeInstance and pass to constructor

		return new FormNodeHtmlPluginInfo(taskSettings);
	} else	
	if (htmlPlugin == "debugNode") {
		return new DebugNodeHtmlPluginInfo();
	} else
	if (htmlPlugin == "dataGridNode") {
		return new DataGridNodeHtmlPluginInfo();
	}

	return;
}

const renderHtmlNode = (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings: any) => {

	let htmlPlugin = node.htmlPlugin;
	if (!htmlPlugin || htmlPlugin == "") {
		htmlPlugin = taskSettings.htmlPlugin;
	}

	if (htmlPlugin == "iframe") {
		return <iframe width={node.width || 250}
			height={node.height || 250}
		src={node.url}></iframe>;
	} else
	if (htmlPlugin == "executeNode") {
		return <ExecuteNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></ExecuteNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "sliderNode") {
		return <SliderNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			flow={flow}
		></SliderNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "gridEditNode") {
		return <GridEditNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			flow={flow}
		></GridEditNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "inputNode") {
		return <InputNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></InputNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "formNode") {
		return <FormNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			taskSettings={taskSettings}
		></FormNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "dataGridNode") {
		return <DataGridNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
		></DataGridNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "debugNode") {
		return <DebugNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			flow={flow}
		></DebugNodeHtmlPlugin>;
	} else
	if (pluginRegistry[htmlPlugin]) {
		const Plugin = pluginRegistry[node.htmlPlugin].VisualizationComponent;
		
		node.visualizer = "children";
		
		return <DebugNodeHtmlPlugin flowrunnerConnector={flowrunnerConnector}
			node={node}
			flow={flow}
		><Plugin></Plugin></DebugNodeHtmlPlugin>;
	}

	return <div style={{
			width:node.width || 250,
			height:node.height || 250,
			backgroundColor: "white"
		}}></div>;
}

const hasLogin = root && root.getAttribute("data-has-login") === "true";
const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";

let canvasToolbarsubject = new Subject<string>();



interface IAppProps {
	isLoggedIn : boolean;
}

interface DefaultProps {

}

if (applicationMode === ApplicationMode.Canvas) {
	import('./components/canvas').then((module) => {
		const Canvas = module.Canvas;
		const App = (props : IAppProps) => {
			const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
			const [editorMode, setEditorMode] = useState("canvas");

			const onClose = () => {
				setLoggedIn(true);
				return true;
			}

			const onEditorMode = (editorMode) => {
				setEditorMode(editorMode);
			}
			return <>
				{hasLogin && !loggedIn ? <Login onClose={onClose}></Login> : 
					<>
						{editorMode == "canvas" && <Taskbar></Taskbar>}
						{!!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() &&<UIControlsBar renderHtmlNode={renderHtmlNode}
							flowrunnerConnector={flowrunnerConnector}></UIControlsBar>}
						{!!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() && <DebugInfo
							flowrunnerConnector={flowrunnerConnector}></DebugInfo>}

						<Toolbar canvasToolbarsubject={canvasToolbarsubject} 
							hasRunningFlowRunner={!!hasRunningFlowRunner}
							flowrunnerConnector={flowrunnerConnector}
							onEditorMode={onEditorMode}
							></Toolbar>
						{editorMode == "canvas" &&
						<Canvas canvasToolbarsubject={canvasToolbarsubject} 
							renderHtmlNode={renderHtmlNode}
							flowrunnerConnector={flowrunnerConnector}
							getNodeInstance={getNodeInstance}
						></Canvas>}
						{editorMode == "uiview-editor" && <UserInterfaceViewEditor 
							renderHtmlNode={renderHtmlNode}
							flowrunnerConnector={flowrunnerConnector}
							getNodeInstance={getNodeInstance} />}
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
	});
} else
if (applicationMode === ApplicationMode.UI) {
	import('./components/userinterface-view').then((module) => {
		const UserInterfaceView = module.UserInterfaceView;
		const App = (props) => {
			return <UserInterfaceView 						
				renderHtmlNode={renderHtmlNode}
				flowrunnerConnector={flowrunnerConnector}
				getNodeInstance={getNodeInstance}
			></UserInterfaceView>;
		};

		startFlow(flowPackage, reducers).then((services : any) => {
			
			flowrunnerConnector.setPluginRegistry(pluginRegistry);

			console.log("pluginRegistry", pluginRegistry);
			(ReactDOM as any).createRoot(
				root
			).render(<Provider store={services.getStore()}>
					<App></App>
				</Provider>
			);							
				
		}).catch((err) => {
			console.log("error during start flowunner (check internal startFlow error)", err);
		})
	});
}

function registerFlowRunnerCanvasPlugin(name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName) {
	pluginRegistry[FlowTaskPluginClassName] = {
		VisualizationComponent: VisualizationComponent,
		FlowTaskPlugin: FlowTaskPlugin,
		FlowTaskPluginClassName: FlowTaskPluginClassName
	}
	console.log(pluginRegistry);

	setCustomConfig(FlowTaskPluginClassName, {
		shapeType: 'Html',
		hasUI : true,
		presetValues : {
			htmlPlugin: FlowTaskPluginClassName
		}
	})
	flowrunnerConnector.setPluginRegistry(pluginRegistry);
}

(window as any).registerFlowRunnerCanvasPlugin = registerFlowRunnerCanvasPlugin;