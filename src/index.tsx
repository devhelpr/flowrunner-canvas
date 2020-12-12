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
import { IStorageProvider } from './interfaces/IStorageProvider';

import { setCustomConfig } from './config';
import { setPluginRegistry , renderHtmlNode , getNodeInstance } from './render-html-node';

export const startEditor = () => {
	let hasStorageProvider = false;

	let storageProvider : IStorageProvider | undefined= undefined;
	if ((window as any).flowrunnerStorageProvider !== undefined) {
		storageProvider = (window as any).flowrunnerStorageProvider as IStorageProvider;
		hasStorageProvider = true;
	}

	const options : any = {
		reduxMiddleware: undefined
	}

	if (hasStorageProvider) {
		options.reduxMiddleware = function(middlewareAPI: any) {
			return function(next: any) {
			return function(action: any) {	
				var result = next(action);
		
				let nextState = middlewareAPI.getState();
				if (storageProvider) {
					storageProvider.storeFlowPackage(nextState);
				}
				return result;
			};
			};
		};
		options.initialStoreState = storageProvider?.getFlowPackage();
	}

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
	setPluginRegistry(pluginRegistry);

	const root = document.getElementById('flowstudio-root');

	const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";


	let flowrunnerConnector : any = undefined;

	const onDestroyAndRecreateWorker = () => {
		if (worker) {
			worker.terminate();
			worker = new Worker("/worker.js");
			flowrunnerConnector.registerWorker(worker);
		}
	}

	if (!!hasRunningFlowRunner) {
		flowrunnerConnector = new FlowConnector();	
		flowrunnerConnector.registerWorker(worker);
		flowrunnerConnector.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
	} else {
		flowrunnerConnector = new EmptyFlowConnector();
	}
	flowrunnerConnector.hasStorageProvider = hasStorageProvider;
	flowrunnerConnector.storageProvider = storageProvider;

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

	const hasLogin = root && root.getAttribute("data-has-login") === "true";
	const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";

	let canvasToolbarsubject = new Subject<string>();

	interface IAppProps {
		isLoggedIn : boolean;
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
							{editorMode == "canvas" && <Taskbar flowrunnerConnector={flowrunnerConnector}></Taskbar>}
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
			
			startFlow(flowPackage, reducers , options).then((services : any) => {
				
				flowrunnerConnector.setPluginRegistry(pluginRegistry);

				const start = (isLoggednIn) => {
					console.log("pluginRegistry", pluginRegistry);
					// (ReactDOM as any).createRoot(
					(ReactDOM as any).render(<Provider store={services.getStore()}>
							<App isLoggedIn={isLoggednIn}></App>
						</Provider>, root
					);
				}

				if (hasStorageProvider) {
					start(true);
					return;
				}

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
					start((response as any).isLoggedIn);	
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

			startFlow(flowPackage, reducers, options).then((services : any) => {
				
				flowrunnerConnector.setPluginRegistry(pluginRegistry);

				console.log("pluginRegistry", pluginRegistry);
				//(ReactDOM as any).createRoot(
				(ReactDOM as any).render(<Provider store={services.getStore()}>
						<App></App>
					</Provider>, root
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

}

if ((window as any).autoStartFlowrunnerEditor) {
	startEditor();
}