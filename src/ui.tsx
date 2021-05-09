import './public-path';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';


import { HumanFlowToMachineFlow } from '@devhelpr/flowrunner';

import { FlowConnector , EmptyFlowConnector} from './flow-connector';
import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { IStorageProvider } from './interfaces/IStorageProvider';

import { setCustomConfig } from './config';
import { renderHtmlNode, getNodeInstance , setPluginRegistry } from './render-html-node';
import { UserInterfaceView } from './components/userinterface-view';

export interface IUIViewProps {
	flowId : string;
	flowPackage? : any;
}
export const UIView = (props: IUIViewProps) => {
	const flowrunnerConnector = useRef(null as any);

	useEffect(() => {
		let hasStorageProvider = false;

		let storageProvider : IStorageProvider | undefined= undefined;
		if ((window as any).flowrunnerStorageProvider !== undefined) {
			storageProvider = (window as any).flowrunnerStorageProvider as IStorageProvider;
			hasStorageProvider = true;
		}

		const options : any = {
		}

		if (hasStorageProvider) {			
			options.initialStoreState = storageProvider?.getFlowPackage();
		}

		/*global __webpack_public_path__ */

		let worker : Worker | null;
		worker = new Worker(new URL("./flow-worker", import.meta.url));
		worker.postMessage({
			command: 'init',
			publicPath: __webpack_public_path__
		});

		let pluginRegistry = {};
		setPluginRegistry(pluginRegistry);

		const root = document.getElementById('flowstudio-root');

		const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";


		const onDestroyAndRecreateWorker = () => {
			console.log("onDestroyAndRecreateWorker handling");
			if (worker) {
				worker.terminate();
				worker = null;
			}
			worker = new Worker(new URL("./flow-worker", import.meta.url));
			worker.postMessage({
				command: 'init',
				publicPath: __webpack_public_path__
			});
			flowrunnerConnector.current.registerWorker(worker);		
		}

		if (!!hasRunningFlowRunner) {
			flowrunnerConnector.current = new FlowConnector();	
			flowrunnerConnector.current.registerWorker(worker);
			flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
		} else {
			flowrunnerConnector.current = new EmptyFlowConnector();
		}
		flowrunnerConnector.current.hasStorageProvider = hasStorageProvider;
		flowrunnerConnector.current.storageProvider = storageProvider;

		let applicationMode = ApplicationMode.UI;
				
		flowrunnerConnector.current.setAppMode(applicationMode);		
		
		flowrunnerConnector.current.flowView = "uiview";
			
		if ((window as any).flowRunnerCanvasPluginRegisterFunctions) {
			(window as any).flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
				registerFunction();
				return true;
			});
		}

		flowrunnerConnector.current.setPluginRegistry(pluginRegistry);
		console.log("pluginRegistry", pluginRegistry);

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
			flowrunnerConnector.current.setPluginRegistry(pluginRegistry);
		}
		(window as any).registerFlowRunnerCanvasPlugin = registerFlowRunnerCanvasPlugin;
	}, []);

	return <UserInterfaceView 						
		renderHtmlNode={renderHtmlNode}
		flowrunnerConnector={flowrunnerConnector.current}
		getNodeInstance={getNodeInstance}
		flowId={props.flowId}
		flowPackage={props.flowPackage}
	></UserInterfaceView>;
}

