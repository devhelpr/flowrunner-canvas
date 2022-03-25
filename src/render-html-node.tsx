import * as React from 'react';
import { Suspense } from 'react';
import { Subject } from 'rxjs';

import { CustomNodeHtmlPlugin, CustomNodeHtmlPluginInfo } from './components/html-plugins/custom-node';
import { ShapeNodeHtmlPlugin, ShapeNodeHtmlPluginInfo } from './components/html-plugins/shape-node';

import { ExecuteNodeHtmlPlugin, ExecuteNodeHtmlPluginInfo } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPluginInfo,GridEditNodeHtmlPluginInfo } from './components/html-plugins/visualizers/info';
import { SliderNodeHtmlPlugin, SliderNodeHtmlPluginInfo } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin , InputNodeHtmlPluginInfo } from './components/html-plugins/input-node';
import { FormNodeHtmlPlugin , FormNodeHtmlPluginInfo } from './components/html-plugins/form-node';

import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { DataGridNodeHtmlPluginInfo , DataGridNodeHtmlPlugin} from './components/html-plugins/data-grid-node';
import { IFlowState, useFlowStore } from './state/flow-state';

const DebugNodeHtmlPlugin = React.lazy(() => import('./components/html-plugins/debug-node').then(({ DebugNodeHtmlPlugin }) => ({ default: DebugNodeHtmlPlugin })));
const GridEditNodeHtmlPlugin = React.lazy(() => import('./components/html-plugins/grid-edit').then(({ GridEditNodeHtmlPlugin }) => ({ default: GridEditNodeHtmlPlugin })));


let _pluginRegistry;
export const setPluginRegistry = (pluginRegistry) => {
	_pluginRegistry = pluginRegistry;
}

export const renderHtmlNode = (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings: any, formNodesubject?: Subject<any>, flowId? : string, overideUseFlowStore? : () => IFlowState) => {

	let htmlPlugin = node.htmlPlugin;
	if (!htmlPlugin || htmlPlugin == "") {
		htmlPlugin = taskSettings.htmlPlugin;
	}
	if (htmlPlugin == "svgTestNode") {
		return <>
			<svg>
				<circle cx="50%" cy="50%" r="30%" stroke="black" strokeWidth="3" 
					fill="red" />
				<text x="50%" y="50%" fill="black" textAnchor="middle" dominantBaseline="middle">SVG!</text>
			</svg>
		</>;
	} else
	if (htmlPlugin == "customNode") {
		return <CustomNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
			taskSettings={taskSettings}
		></CustomNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "shapeNode") {
		return <ShapeNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
			taskSettings={taskSettings}
		></ShapeNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "iframe") {
		return <iframe width={node.width || 250}
			height={node.height || 250}
		src={node.url}></iframe>;
	} else
	if (htmlPlugin == "executeNode") {
		return <ExecuteNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
		></ExecuteNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "sliderNode") {
		return <SliderNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
			flow={flow}
		></SliderNodeHtmlPlugin>;
	} else
	if (htmlPlugin == "gridEditNode") {
		return <Suspense fallback={<div>Loading...</div>}>
			<GridEditNodeHtmlPlugin 
				key={(flowId ? "" : flowId) + node.name}
				flowrunnerConnector={flowrunnerConnector}
				node={node}
				flow={flow}
			></GridEditNodeHtmlPlugin>
		</Suspense>;
	} else
	if (htmlPlugin == "inputNode") {
		return <InputNodeHtmlPlugin 
		key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
		></InputNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "formNode") {
		return <FormNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
			taskSettings={taskSettings}
			isInFlowEditor={true}
			formNodesubject={formNodesubject}		
			useFlowStore={overideUseFlowStore || useFlowStore}	
		></FormNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "dataGridNode") {
		return <DataGridNodeHtmlPlugin 
			key={(flowId ? "" : flowId) + node.name}
			flowrunnerConnector={flowrunnerConnector}
			node={node}
		></DataGridNodeHtmlPlugin>;
	} else	
	if (htmlPlugin == "debugNode") {
		return <Suspense fallback={<div>Loading...</div>}>
				<DebugNodeHtmlPlugin 
					key={(flowId ? "" : flowId) + node.name}
					flowrunnerConnector={flowrunnerConnector}					
					node={node}
					flow={flow}
			></DebugNodeHtmlPlugin>
		</Suspense>;
	} else
	if (_pluginRegistry[htmlPlugin]) {
		const Plugin = _pluginRegistry[node.htmlPlugin].VisualizationComponent;
		
		node.visualizer = "children";
		
		return <Suspense fallback={<div>Loading...</div>}>
				<DebugNodeHtmlPlugin 
					key={(flowId ? "" : flowId) + node.name}
					flowrunnerConnector={flowrunnerConnector}
					node={node}
					flow={flow}					
				><Plugin></Plugin></DebugNodeHtmlPlugin>
		</Suspense>;
	}

	return <div style={{
			width:node.width || 250,
			height:node.height || 250,
			backgroundColor: "white"
		}}></div>;
}


export const getNodeInstance = (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => {
	if (!node) {
		return;
	}
	let htmlPlugin = node.htmlPlugin;
	if (!htmlPlugin || htmlPlugin == "") {
		if (taskSettings) {
			htmlPlugin = taskSettings.htmlPlugin;
		}
	}

	if (htmlPlugin == "customNode") {
		return new CustomNodeHtmlPluginInfo(taskSettings);
	} else
	if (htmlPlugin == "shapeNode") {
		return new ShapeNodeHtmlPluginInfo(taskSettings);
	} else
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
		return new InputNodeHtmlPluginInfo();	
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