import * as React from 'react';
import { useState, useEffect,useRef } from 'react';
import { Suspense } from 'react';

import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';

import fetch from 'cross-fetch';

import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { Taskbar } from './components/Taskbar';
import { DebugInfo } from './components/debug-info';
import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { IStorageProvider } from './interfaces/IStorageProvider';

import { setCustomConfig } from './config';
import { getWorker } from './flow-worker';
import { FlowStorageProviderService} from './services/FlowStorageProviderService';

import { 
	flowrunnerStorageProvider , 
	configurableFlowrunnerStorageProvider, 
	readOnlyFlowrunnerStorageProvider
} from './flow-localstorage-provider';

import { useFlows } from './use-flows';

let flowRunnerConnectorInstance : IFlowrunnerConnector;
let flowRunnerCanvasPluginRegisterFunctions : any[] = [];

const UserInterfaceViewEditor = React.lazy(() => import('./components/userinterface-view-editor').then(({ UserInterfaceViewEditor }) => ({ default: UserInterfaceViewEditor })));
const CanvasComponent = React.lazy(() => import('./components/canvas').then(({ Canvas }) => ({ default: Canvas })));

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
//
(window as any).react = React;

let pluginRegistry : any = {};

export const flowrunnerLocalStorageProvider = flowrunnerStorageProvider;
export const configurableFlowrunnerLocalStorageProvider = configurableFlowrunnerStorageProvider;
export const readOnlyFlowrunnerLocalStorageProvider = readOnlyFlowrunnerStorageProvider;

export const registerFlowRunnerCanvasPlugin = (name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName) => {
	if (flowRunnerConnectorInstance) {
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
		flowRunnerConnectorInstance.setPluginRegistry(pluginRegistry);
	}
}

export const addRegisterFunction = (registerFunction : () => void) => {
	flowRunnerCanvasPluginRegisterFunctions.push(registerFunction);
}

export interface IFlowrunnerCanvasProps {
	flowStorageProvider? : IStorageProvider;
}

/*
	TODO : 

		- fix red squigly lines in codesandbox .. why can't TS typedefs be found?
			- in locale CRA this doesn't happen
		- remove circular dependencies : flow-worker and form-node
*/

export const FlowrunnerCanvas = (props: IFlowrunnerCanvasProps) => {

	const [renderFlowCanvas , setRenderFlowCanvas] = useState(false);
	const flowrunnerConnector = useRef(new FlowConnector());
	const canvasToolbarsubject = useRef(undefined as any);
	const renderHtmlNode = useRef(undefined as any);
	const getNodeInstance = useRef(undefined as any);

	let hasStorageProvider = false;

	let storageProvider : IStorageProvider | undefined= undefined;
	if (props.flowStorageProvider !== undefined) {
		storageProvider = props.flowStorageProvider as IStorageProvider;
		hasStorageProvider = true;
		FlowStorageProviderService.setFlowStorageProvider(storageProvider);
	}

	flowrunnerConnector.current.hasStorageProvider = hasStorageProvider;
	flowrunnerConnector.current.storageProvider = storageProvider;
	flowRunnerConnectorInstance = flowrunnerConnector.current;

	const flows = useFlows(flowrunnerConnector.current);
	
	useEffect(() => {
		canvasToolbarsubject.current = new Subject<string>();

		import( './render-html-node').then((moduleRenderHtmlNode) => 
		{
			const setPluginRegistry = moduleRenderHtmlNode.setPluginRegistry;
			
			renderHtmlNode.current = moduleRenderHtmlNode.renderHtmlNode;
			getNodeInstance.current = moduleRenderHtmlNode.getNodeInstance;
		
			const options : any = {
			}
	
			if (hasStorageProvider) {			
				options.initialStoreState = storageProvider?.getFlowPackage();
			}
	 
			let worker = getWorker();
			worker.postMessage("worker", {
				command: 'init'
			});
	
			if (flowRunnerCanvasPluginRegisterFunctions) {
				flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
					registerFunction();
					return true;
				});
			}
			flowrunnerConnector.current.setPluginRegistry(pluginRegistry);
			
			setPluginRegistry(pluginRegistry);			

			const onDestroyAndRecreateWorker = () => {
				console.log("onDestroyAndRecreateWorker handling");
				if (worker) {
					worker.terminate();
				}
				worker = getWorker();
				worker.postMessage("worker", {
					command: 'init'
				});
				if (flowrunnerConnector.current) {
					flowrunnerConnector.current.registerWorker(worker);
				}
			}

			if (flowrunnerConnector.current) {	
				flowrunnerConnector.current.registerWorker(worker);
				flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
				flowrunnerConnector.current.setAppMode(ApplicationMode.Canvas);
				console.log("RENDER ORDER 1");
				setRenderFlowCanvas(true);
			}
		});

		return () => {

		}
	}, []);	

	if (!renderFlowCanvas || !flowrunnerConnector.current) {
		return <></>;
	}
	
	return <>
		<Suspense fallback={<div>Loading...</div>}>
			<Taskbar flowrunnerConnector={flowrunnerConnector.current}></Taskbar>
			<DebugInfo flowrunnerConnector={flowrunnerConnector.current}></DebugInfo>
			<Toolbar canvasToolbarsubject={canvasToolbarsubject.current} 
					hasRunningFlowRunner={true}
					isFlowEditorOnly={true}
					flowrunnerConnector={flowrunnerConnector.current}
					flow={flows.flow}
					flowId={flows.flowId}
					flows={flows.flows}
					flowType={flows.flowType}
					flowState={flows.flowState}
					getFlows={flows.getFlows}
					loadFlow={flows.loadFlow}
					saveFlow={flows.saveFlow}
					onGetFlows={flows.onGetFlows}
			></Toolbar>
							
			<CanvasComponent canvasToolbarsubject={canvasToolbarsubject.current} 
				renderHtmlNode={renderHtmlNode.current}
				flowrunnerConnector={flowrunnerConnector.current}
				getNodeInstance={getNodeInstance.current}
				flow={flows.flow}
				flowId={flows.flowId}
				flowType={flows.flowType}
				flowState={flows.flowState}
				saveFlow={flows.saveFlow}
			></CanvasComponent>
		</Suspense>		
	</>;
}

export const startEditor = (flowStorageProvider? : IStorageProvider, doLocalStorageFlowEditorOnly? : boolean) => {
	
	if (!!doLocalStorageFlowEditorOnly) {
		const root = document.getElementById('flowstudio-root');
		(ReactDOM as any).render(<FlowrunnerCanvas flowStorageProvider={flowrunnerLocalStorageProvider}></FlowrunnerCanvas>, root);
		return;
	}

	import( './render-html-node').then((module) => 
	{ 
		const setPluginRegistry = module.setPluginRegistry;
		const renderHtmlNode = module.renderHtmlNode;
		const getNodeInstance = module.getNodeInstance;

		let hasStorageProvider = false;

		let storageProvider : IStorageProvider | undefined= undefined;
		if (flowStorageProvider !== undefined) {
			storageProvider = flowStorageProvider as IStorageProvider;
			hasStorageProvider = true;
			FlowStorageProviderService.setFlowStorageProvider(storageProvider);
		}

		const options : any = {
		}

		if (hasStorageProvider) {			
			options.initialStoreState = storageProvider?.getFlowPackage();
		}
 
		let worker = getWorker();
		worker.postMessage("worker", {
			command: 'init'
		});

		setPluginRegistry(pluginRegistry);

		const root = document.getElementById('flowstudio-root');

		const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";

		let flowrunnerConnector : any = undefined;

		const onDestroyAndRecreateWorker = () => {
			console.log("onDestroyAndRecreateWorker handling");
			if (worker) {
				worker.terminate();
			}
			worker = getWorker();
			worker.postMessage("worker", {
				command: 'init'
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
		flowRunnerConnectorInstance = flowrunnerConnector;

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
		
		const hasLogin = root && root.getAttribute("data-has-login") === "true";
		const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";

		let canvasToolbarsubject = new Subject<string>();

		interface IAppProps {
			isLoggedIn : boolean;
		}

		if (applicationMode === ApplicationMode.Canvas) {
			//import('./components/canvas').then((module) => {
				//const Canvas = module.Canvas;
				const App = (props : IAppProps) => {
					const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
					const [editorMode, setEditorMode] = useState("canvas");					
					const flows = useFlows(flowrunnerConnector);

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
								<Suspense fallback={<div>Loading...</div>}>
									{editorMode == "canvas" && <Taskbar flowrunnerConnector={flowrunnerConnector}></Taskbar>}
									
									{!!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() && <DebugInfo
										flowrunnerConnector={flowrunnerConnector}></DebugInfo>}

									<Toolbar canvasToolbarsubject={canvasToolbarsubject} 
										hasRunningFlowRunner={!!hasRunningFlowRunner}
										flowrunnerConnector={flowrunnerConnector}
										onEditorMode={onEditorMode}
										flow={flows.flow}
										flowId={flows.flowId}
										flows={flows.flows}
										flowType={flows.flowType}
										flowState={flows.flowState}
										getFlows={flows.getFlows}
										loadFlow={flows.loadFlow}
										saveFlow={flows.saveFlow}
										onGetFlows={flows.onGetFlows}
										></Toolbar>
									{editorMode == "canvas" &&
									<CanvasComponent canvasToolbarsubject={canvasToolbarsubject} 
										renderHtmlNode={renderHtmlNode}
										flowrunnerConnector={flowrunnerConnector}
										getNodeInstance={getNodeInstance}
										flow={flows.flow}
										flowId={flows.flowId}
										flowType={flows.flowType}
										flowState={flows.flowState}
										saveFlow={flows.saveFlow}
									></CanvasComponent>}
									{editorMode == "uiview-editor" && <Suspense fallback={<div>Loading...</div>}>
										<UserInterfaceViewEditor 
										renderHtmlNode={renderHtmlNode}
										flowrunnerConnector={flowrunnerConnector}
										getNodeInstance={getNodeInstance} /></Suspense>}
									<FooterToolbar></FooterToolbar>	
								</Suspense>
							</>
						}
					</>;
				}				
					
				if (flowRunnerCanvasPluginRegisterFunctions) {
					flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
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
			//});
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
					
					if (flowRunnerCanvasPluginRegisterFunctions) {
						flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
							registerFunction();
							return true;
						});
					}
					flowrunnerConnector.setPluginRegistry(pluginRegistry);

					console.log("pluginRegistry", pluginRegistry);
					(ReactDOM as any).render(<App></App>, root);												
			});
		}
		/*
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
		*/

	});
}

if (!!(window as any).autoStartFlowrunnerEditor) {
	startEditor();
} else
if (!!(window as any).autoStartFlowrunnerEditorOnly) {
	startEditor(undefined, true);
}
