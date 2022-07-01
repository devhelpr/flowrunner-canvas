import * as React from 'react';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

import { useCanvasModeStateStore} from '../state/canvas-mode-state';


export interface ExecuteNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export class ExecuteNodeHtmlPluginInfo {
	getWidth = (node) => {
		return;
	}

	getHeight(node) {
		return;
	}
}

export const ExecuteNodeHtmlPlugin = (props : ExecuteNodeHtmlPluginProps) => {

	const canvasMode = useCanvasModeStateStore();

	const click = (event) => {
		event.preventDefault();

		if (!!canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (props.node) {
			props.flowrunnerConnector.executeFlowNode(props.node.name, {});
		}
		return false;
	}
	
	return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
		<a href="#" className={(!!canvasMode.isFlowrunnerPaused ? "disabled " : "") + "btn btn-primary"} onClick={click}>Click to Execute</a>
	</div>;	
}