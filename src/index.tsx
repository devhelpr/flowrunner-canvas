import * as React from 'react';
import { useState, useEffect,useRef, useCallback, useMemo } from 'react';
import { Suspense } from 'react';

import ReactDOM from 'react-dom';

import { Subject } from 'rxjs';

import fetch from 'cross-fetch';

import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { DebugInfo } from './components/debug-info';
import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
export type { IFlowrunnerConnector, IExecutionEvent } from './interfaces/IFlowrunnerConnector';
export { ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { IStorageProvider } from './interfaces/IStorageProvider';

import { setCustomConfig } from './config';
import { getFlowAgent } from './flow-agent';
import { FlowStorageProviderService} from './services/FlowStorageProviderService';

import { 
	flowrunnerStorageProvider , 
	configurableFlowrunnerStorageProvider, 
	readOnlyFlowrunnerStorageProvider
} from './flow-localstorage-provider';

import { createIndexedDBStorageProvider } from './flow-indexeddb-provider'; 

import { useFlowStore } from './state/flow-state';
import { useCanvasModeStateStore } from './state/canvas-mode-state';
import { useSelectedNodeStore } from './state/selected-node-state';

import { useFlows, FlowState } from './use-flows';
import { registerPlugins } from './external-plugins';
import { IFlowAgent } from './interfaces/IFlowAgent';

import { ErrorBoundary } from './helpers/error';

import { IModalSize } from './interfaces/IModalSize';
import { INodeDependency } from './interfaces/INodeDependency';

import { PositionProvider } from './components/contexts/position-context';

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

export const registerFlowRunnerCanvasPlugin = (name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName, flowType? : string) => {
	if (flowRunnerConnectorInstance) {
		pluginRegistry[FlowTaskPluginClassName] = {
			VisualizationComponent: VisualizationComponent,
			FlowTaskPlugin: FlowTaskPlugin,
			FlowTaskPluginClassName: FlowTaskPluginClassName,
			flowType: flowType || "playground"
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

export type { INodeDependency };
export type { IFlowAgent };
export type { IStorageProvider };
export { FlowConnector };

export { setCustomConfig };

export interface IFlowrunnerCanvasProps {
	hasShowDependenciesInMenu?: boolean;
	hasTaskNameAsNodeTitle? : boolean;
	hasCustomNodesAndRepository? : boolean;
	hasJSONEditInMenu? : boolean;
	modalSize? : IModalSize;

	developmentMode? : boolean;

	flowStorageProvider? : IStorageProvider;
	flowrunnerConnector? : IFlowrunnerConnector;

	onMessageFromFlow? : (message, flowAgent : IFlowAgent) => void;	
	getNodeDependencies?: (nodeName: string) => INodeDependency[];
	renderMenuOptions? : () => JSX.Element;
	onFlowHasChanged? : (flow : any) => void;
}

const InternalFlowrunnerCanvas = (props: IFlowrunnerCanvasProps) => {

	const [renderFlowCanvas , setRenderFlowCanvas] = useState(false);
	
	const flowrunnerConnector = useRef((props.flowrunnerConnector || new FlowConnector()) as IFlowrunnerConnector);
	const canvasToolbarsubject = useRef(undefined as any);
	const formNodesubject = useRef(undefined as any);

	const renderHtmlNode = useRef(undefined as any);
	const getNodeInstance = useRef(undefined as any);
	const flowAgent = useRef(undefined as any);
	const isUnmounting = useRef(false);

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

	if (!!props.developmentMode) {
		registerPlugins(registerFlowRunnerCanvasPlugin);
	}
	const flows = useFlows(flowrunnerConnector.current, useFlowStore, undefined,props.onFlowHasChanged);
	
	useEffect(() => {			

		canvasToolbarsubject.current = new Subject<string>();
		formNodesubject.current = new Subject<any>();
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
	
			flowAgent.current = getFlowAgent();
			if (props.onMessageFromFlow) {
				flowAgent.current.addEventListener("external", props.onMessageFromFlow);
			}
			flowAgent.current.postMessage("worker", {
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
				if (flowAgent) {
					flowAgent.current.removeEventListener("external", props.onMessageFromFlow);
					flowAgent.current.terminate();
				}
				flowAgent.current = getFlowAgent();
				if (props.onMessageFromFlow) {
					flowAgent.current.addEventListener("external", props.onMessageFromFlow);
				}
				flowAgent.current.postMessage("worker", {
					command: 'init'
				});
				if (flowrunnerConnector.current) {
					flowrunnerConnector.current.registerWorker(flowAgent.current);
				}
			}

			if (flowrunnerConnector.current) {	
				flowrunnerConnector.current.registerWorker(flowAgent.current);
				flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
				flowrunnerConnector.current.setAppMode(ApplicationMode.Canvas);
				console.log("RENDER ORDER 1");
				setRenderFlowCanvas(true);
			}			
		});

		return () => {
			isUnmounting.current = true;
			if (props.onMessageFromFlow && flowAgent) {
				flowAgent.current.removeEventListener("external", props.onMessageFromFlow);
				flowAgent.current.addEventListener("external", props.onMessageFromFlow);
			}
		}
	}, [props.flowStorageProvider , props.flowrunnerConnector]);		

	useEffect(() => {
		if (flows.flowState !== FlowState.idle) {
			flows.reloadFlow();
		}
	}, [props.flowStorageProvider , props.flowrunnerConnector]);
	
	if (!renderFlowCanvas || !flowrunnerConnector.current) {
		return <></>;
	}
	
	return <>
		<Suspense fallback={<div>Loading...</div>}>
			<ErrorBoundary>
				<DebugInfo flowrunnerConnector={flowrunnerConnector.current}></DebugInfo>
				
				<Toolbar 
					hasShowDependenciesInMenu={props.hasShowDependenciesInMenu}
					hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle || false}
					hasCustomNodesAndRepository={props.hasCustomNodesAndRepository || false}
					hasJSONEditInMenu={props.hasJSONEditInMenu || false}
					renderMenuOptions={props.renderMenuOptions}
					canvasToolbarsubject={canvasToolbarsubject.current} 
					hasRunningFlowRunner={true}
					isFlowEditorOnly={true}
					flowrunnerConnector={flowrunnerConnector.current}
					flow={flows.flow}
					flowId={flows.flowId}
					flows={flows.flows}
					flowType={flows.flowType}
					flowState={flows.flowState}
					modalSize={props.modalSize}
					getFlows={flows.getFlows}
					loadFlow={flows.loadFlow}
					saveFlow={flows.saveFlow}
					onGetFlows={flows.onGetFlows}
					getNodeInstance={getNodeInstance.current}
					renderHtmlNode={renderHtmlNode.current}
				></Toolbar>
											
				<CanvasComponent canvasToolbarsubject={canvasToolbarsubject.current}
					hasCustomNodesAndRepository={props.hasCustomNodesAndRepository !== undefined ? props.hasCustomNodesAndRepository : true}
					renderHtmlNode={renderHtmlNode.current}
					isEditingInModal={false}
					flowrunnerConnector={flowrunnerConnector.current}
					getNodeInstance={getNodeInstance.current}
					formNodesubject={formNodesubject.current}
					flowHasNodes={flows.flow && flows.flow.length > 0}
					flowId={flows.flowId}
					flowType={flows.flowType}
					flowState={flows.flowState}
					saveFlow={flows.saveFlow}
					modalSize={props.modalSize}
					initialOpacity={0}
					hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
					getNodeDependencies={props.getNodeDependencies}
					useFlowStore={useFlowStore}
					useCanvasModeStateStore={useCanvasModeStateStore}
					useSelectedNodeStore={useSelectedNodeStore}
					externalId="AppCanvas" 
				></CanvasComponent>				
			</ErrorBoundary>	
		</Suspense>		
	</>;
}

export const FlowrunnerCanvas = (props: IFlowrunnerCanvasProps) => {
	return <PositionProvider>
		<InternalFlowrunnerCanvas {...props} />
	</PositionProvider>
}

interface ITestAppProps {
	flowrunnerStorageProvider: IStorageProvider;
}

const TestApp = (props: ITestAppProps) => {
	const [debugList , setDebugList] = useState([] as string[]);
	const onMessageFromFlow = useCallback((event: any, flowAgent : any) => {
	  if (event && event.data) {
		if (event.data.command === 'RegisterFlowNodeObservers') {
			return;
		}
		console.log("onMessageFromFlow", event.data.command);
		
		if (event.data.command === 'SendNodeExecution') {

			//if (this.
			setDebugList(state => [...state,event.data.command + "-" + event.data.name]);
		}
	  }
	}, []);
  
	const flowMemoized = useMemo(() => <FlowrunnerCanvas
		developmentMode={true}
		flowStorageProvider={props.flowrunnerStorageProvider}
		onMessageFromFlow={onMessageFromFlow}
		flowrunnerConnector={new FlowConnector()}
	></FlowrunnerCanvas>, [props.flowrunnerStorageProvider]);
	
	return (
	  <div className="row no-gutters h-100">
		<div className="col-12 col-md-6 h-100">
		  	{flowMemoized}
		</div>
		<div className="col-12 col-md-6 h-100" 
			style={{
				overflow:"hidden",
				maxHeight:"100vh",
				overflowY:"scroll"
			}}>
			<div className="overflow-visible">
				{debugList.map((debugItem, index) => {
					return <div key={index}>{debugItem}</div>;
				})}
		  </div>
		</div>
	  </div>
	);
  }
  /*
  return (
	  <FlowrunnerCanvas
		flowStorageProvider={flowrunnerLocalStorageProvider} 
		onMessageFromFlow={onMessageFromFlow}     
	  ></FlowrunnerCanvas>
	);
  }
  */

export const startEditor = async (flowStorageProvider? : IStorageProvider, doLocalStorageFlowEditorOnly? : boolean) => {
	
	if (!!doLocalStorageFlowEditorOnly) {
		const root = document.getElementById('flowstudio-root');

		createIndexedDBStorageProvider().then((result) => {
			if (!result) {
				throw new Error("No Storage Provider is available");
			}
			const flowrunnerStorageProvider = result as IStorageProvider;
			console.log("flowrunnerStorageProvider",flowrunnerStorageProvider);
			(ReactDOM as any).render(<TestApp flowrunnerStorageProvider={flowrunnerStorageProvider}></TestApp>, root);
			/*
			(ReactDOM as any).render(<FlowrunnerCanvas 
				developmentMode={true}
				flowStorageProvider={flowrunnerLocalStorageProvider}></FlowrunnerCanvas>, root);
			*/
		}).catch(() => {
			throw new Error("Error when creating Storage Provider");
		});
		return;
	}

	import( './render-html-node').then((module) => 
	{ 
		fetch('/get-config')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(config => {			
			console.log("config", config);
			if (config) {
				Object.keys(config).forEach((keyName) => {
					setCustomConfig(keyName, config[keyName]);
				});
			}
									
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
	
			let worker = getFlowAgent();
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
				worker = getFlowAgent();
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
			let formNodesubject = new Subject<any>();

			interface IAppProps {
				isLoggedIn : boolean;
			}

			if (applicationMode === ApplicationMode.Canvas) {
				//import('./components/canvas').then((module) => {
					//const Canvas = module.Canvas;
					const App = (props : IAppProps) => {
						const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
						const [editorMode, setEditorMode] = useState("canvas");					
						const flows = useFlows(flowrunnerConnector, useFlowStore);

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
										<ErrorBoundary>									
											
											{!!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() && <DebugInfo
												flowrunnerConnector={flowrunnerConnector}></DebugInfo>}

											<Toolbar canvasToolbarsubject={canvasToolbarsubject}
												hasTaskNameAsNodeTitle={true}											
												hasRunningFlowRunner={!!hasRunningFlowRunner}
												flowrunnerConnector={flowrunnerConnector}
												hasCustomNodesAndRepository={true}
												hasJSONEditInMenu={true}
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
												getNodeInstance={getNodeInstance}
												renderHtmlNode={renderHtmlNode}
												></Toolbar>
											{editorMode == "canvas" &&
											<CanvasComponent canvasToolbarsubject={canvasToolbarsubject}
												hasCustomNodesAndRepository={true}
												isEditingInModal={false} 
												formNodesubject={formNodesubject} 
												renderHtmlNode={renderHtmlNode}
												flowrunnerConnector={flowrunnerConnector}
												getNodeInstance={getNodeInstance}
												flowHasNodes={flows.flow && flows.flow.length > 0}
												flowId={flows.flowId}
												flowType={flows.flowType}
												flowState={flows.flowState}
												saveFlow={flows.saveFlow}
												hasTaskNameAsNodeTitle={true}
												initialOpacity={0}
												useFlowStore={useFlowStore}
												useCanvasModeStateStore={useCanvasModeStateStore}
												useSelectedNodeStore={useSelectedNodeStore}
												externalId="AppCanvas"
											></CanvasComponent>}
											{editorMode == "uiview-editor" && <Suspense fallback={<div>Loading...</div>}>
												<UserInterfaceViewEditor 
												renderHtmlNode={renderHtmlNode}
												flowrunnerConnector={flowrunnerConnector}
												getNodeInstance={getNodeInstance} /></Suspense>}
											<FooterToolbar></FooterToolbar>
											
										</ErrorBoundary>		
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
						(ReactDOM as any).render(<PositionProvider>
							<App isLoggedIn={isLoggednIn}></App>
						</PositionProvider>, root);
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
						return <ErrorBoundary>
								<UserInterfaceView 						
								renderHtmlNode={renderHtmlNode}
								flowrunnerConnector={flowrunnerConnector}
								getNodeInstance={getNodeInstance}
							></UserInterfaceView>
						</ErrorBoundary>;
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

		
		})
		.catch(err => {
			console.error(err);
		});
	});
}

if (!!(window as any).autoStartFlowrunnerEditor) {
	startEditor();
} else
if (!!(window as any).autoStartFlowrunnerEditorOnly) {
	startEditor(undefined, true);
}
