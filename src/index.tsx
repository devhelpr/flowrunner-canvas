import './public-path';
import * as React from 'react';
import { useState } from 'react';
import { Suspense } from 'react';

import ReactDOM from 'react-dom';
import { Observable, Subject } from 'rxjs';

import fetch from 'cross-fetch';

import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { Taskbar } from './components/Taskbar';
//import { UIControlsBar} from './components/ui-controls-bar';
import { DebugInfo } from './components/debug-info';
import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { IStorageProvider } from './interfaces/IStorageProvider';

import { setCustomConfig } from './config';

const UserInterfaceViewEditor = React.lazy(() => import('./components/userinterface-view-editor').then(({ UserInterfaceViewEditor }) => ({ default: UserInterfaceViewEditor })));

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
//
// This is basically a trick to have "micro-frontends" in react
//
(window as any).react = React;

export const startEditor = () => {
	import( './render-html-node').then((module) => 
	{ 
		const setPluginRegistry = module.setPluginRegistry;
		const renderHtmlNode = module.renderHtmlNode;
		const getNodeInstance = module.getNodeInstance;
		let hasStorageProvider = false;

		let storageProvider : IStorageProvider | undefined= undefined;
		if ((window as any).flowrunnerStorageProvider !== undefined) {
			storageProvider = (window as any).flowrunnerStorageProvider as IStorageProvider;
			hasStorageProvider = true;
		}

		const options : any = {
			//reduxMiddleware: undefined
		}

		if (hasStorageProvider) {
			/*
			TODO : fix using zustand middleware ??

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
			*/
			options.initialStoreState = storageProvider?.getFlowPackage();
		}

		/*global __webpack_public_path__ */
 
		let worker : Worker | null;
		worker = new Worker(new URL("./flow-worker", import.meta.url));
		worker.postMessage({
			command: 'init',
			publicPath: __webpack_public_path__
		});
		//worker = new Worker("/worker.js");

		let pluginRegistry = {};
		setPluginRegistry(pluginRegistry);

		const root = document.getElementById('flowstudio-root');

		const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";


		let flowrunnerConnector : any = undefined;

		const onDestroyAndRecreateWorker = () => {
			console.log("onDestroyAndRecreateWorker handling");
			if (worker) {
				worker.terminate();
				worker = null;
			}
			//worker = new Worker();
			worker = new Worker(new URL("./flow-worker", import.meta.url));
			//worker = new Worker("/worker.js");
			worker.postMessage({
				command: 'init',
				publicPath: __webpack_public_path__
			});
			flowrunnerConnector.registerWorker(worker);
		
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
		if (hasStorageProvider) {
			if (!!(storageProvider as any).isUI) {
				applicationMode = ApplicationMode.UI;
			}
		}

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
						flowrunnerConnector.flowView = editorMode;
						setEditorMode(editorMode);
					}
					/*
					{false && !!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() &&<UIControlsBar renderHtmlNode={renderHtmlNode}
									flowrunnerConnector={flowrunnerConnector}></UIControlsBar>}
					*/
					return <>
						{hasLogin && !loggedIn ? <Login onClose={onClose}></Login> : 
							<>
								{editorMode == "canvas" && <Taskbar flowrunnerConnector={flowrunnerConnector}></Taskbar>}
								
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
								{editorMode == "uiview-editor" && <Suspense fallback={<div>Loading...</div>}>
									<UserInterfaceViewEditor 
									renderHtmlNode={renderHtmlNode}
									flowrunnerConnector={flowrunnerConnector}
									getNodeInstance={getNodeInstance} /></Suspense>}
								<FooterToolbar></FooterToolbar>	
							</>
						}
					</>;
				}
				
				//startFlow(flowPackage, reducers , options).then((services : any) => {
					
					if ((window as any).flowRunnerCanvasPluginRegisterFunctions) {
						(window as any).flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
							registerFunction();
							return true;
						});
					}
					flowrunnerConnector.setPluginRegistry(pluginRegistry);

					// isLoggedIn is set below and it forced to true when running using a storageProvider
					// or it is not used if data-has-login="false" is set on the document root used by reactdom.render
					const start = (isLoggednIn) => {
						console.log("pluginRegistry", pluginRegistry);
						// (ReactDOM as any).createRoot(
						(ReactDOM as any).render(<App isLoggedIn={isLoggednIn}></App>, root);
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
								
						
				//}).catch((err) => {
				//	console.log("error during start flowunner (check internal startFlow error)", err);
				//})
			});
		} else
		if (applicationMode === ApplicationMode.UI) {
			import('./components/userinterface-view').then((module) => {
				const UserInterfaceView = module.UserInterfaceView;

				flowrunnerConnector.flowView = "uiview";

				const App = (props) => {
					return <UserInterfaceView 						
						renderHtmlNode={renderHtmlNode}
						flowrunnerConnector={flowrunnerConnector}
						getNodeInstance={getNodeInstance}
					></UserInterfaceView>;
				};

				//startFlow(flowPackage, reducers, options).then((services : any) => {
					
					if ((window as any).flowRunnerCanvasPluginRegisterFunctions) {
						(window as any).flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
							registerFunction();
							return true;
						});
					}
					flowrunnerConnector.setPluginRegistry(pluginRegistry);

					console.log("pluginRegistry", pluginRegistry);
					//(ReactDOM as any).createRoot(
					(ReactDOM as any).render(<App></App>, root);							
						
				//}).catch((err) => {
				//	console.log("error during start flowunner (check internal startFlow error)", err);
				//})
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

	});
}

if ((window as any).autoStartFlowrunnerEditor) {
	startEditor();
}