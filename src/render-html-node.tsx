import * as React from 'react';

import { ExecuteNodeHtmlPlugin, ExecuteNodeHtmlPluginInfo } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPlugin, DebugNodeHtmlPluginInfo } from './components/html-plugins/debug-node';
import { SliderNodeHtmlPlugin, ContainedSliderNodeHtmlPlugin, SliderNodeHtmlPluginInfo } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin } from './components/html-plugins/input-node';
import { FormNodeHtmlPlugin , FormNodeHtmlPluginInfo } from './components/html-plugins/form-node';
import { GridEditNodeHtmlPlugin, GridEditNodeHtmlPluginInfo } from './components/html-plugins/grid-edit';

import { IFlowrunnerConnector, ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { DataGridNodeHtmlPluginInfo , DataGridNodeHtmlPlugin} from './components/html-plugins/data-grid-node';

let _pluginRegistry;
export const setPluginRegistry = (pluginRegistry) => {
	_pluginRegistry = pluginRegistry;
}

export const renderHtmlNode = (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings: any) => {

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
	if (_pluginRegistry[htmlPlugin]) {
		const Plugin = _pluginRegistry[node.htmlPlugin].VisualizationComponent;
		
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


export const getNodeInstance = (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => {
	
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