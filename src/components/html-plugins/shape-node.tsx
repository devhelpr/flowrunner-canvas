import * as React from 'react';
import { useEffect } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';

export interface ShapeNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	taskSettings? : any;
}

/*
	TODO in flow-to-canvas for lines start and end and thumbs, set positions for this nodetype
	(vertically centered left and right .. with height of ???)
*/

export class  ShapeNodeHtmlPluginInfo {

	_taskSettings? : any;
	constructor(taskSettings? : any) {
		this._taskSettings = taskSettings;
	}

	getWidth = (node) => {
		return (this._taskSettings && this._taskSettings.width) || node.width || 200;
	}

	getHeight(node) {
		return  (this._taskSettings && this._taskSettings.height) ||node.height || 100;
	}
}

export const  ShapeNodeHtmlPlugin = (props :  ShapeNodeHtmlPluginProps) => {

	const canvasMode = useCanvasModeStateStore();
	useEffect(() => {
		console.log("ShapeNodeHtmlPlugin", props);
	}, []);

	let style : any = {};
	if (props.taskSettings && props.taskSettings.style) {
		style = props.taskSettings.style;
	} else
	if (props.node && props.node.style) {
		style = props.node.style;
	}

	let iconBgCssClasses = "";
	if (props.taskSettings && props.taskSettings.iconBgCssClasses) {
		iconBgCssClasses = props.taskSettings.iconBgCssClasses;
	}

	return <div className="html-plugin-node" style={{			
			backgroundColor: "transparent",
			...style
		}}>{iconBgCssClasses && <span className={`html-plugin-node__icon ${iconBgCssClasses}`}></span>}		
	</div>;	
}