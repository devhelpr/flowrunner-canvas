import * as React from 'react';
import { useEffect } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/FlowrunnerConnector';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';

export interface CustomNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	taskSettings? : any;
}

export class  CustomNodeHtmlPluginInfo {

	_taskSettings? : any;
	constructor(taskSettings? : any) {
		this._taskSettings = taskSettings;
	}

	getWidth = (node) => {
		return;
	}

	getHeight(node) {
		return;
	}
}

export const  CustomNodeHtmlPlugin = (props :  CustomNodeHtmlPluginProps) => {

	const canvasMode = useCanvasModeStateStore();
	useEffect(() => {
		console.log("CustomNodeHtmlPlugin", props);
	}, []);

	const config = props.taskSettings.config || props.node.config;

	return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
		{config && 
			config.objects.map((object, index) => {
				return <div key={"custom-node-object-"+index} 
					className={object.css || ""} 
					style={{}}>
					{object.iconSpec && <i className={object.iconSpec}></i>}
					{object.imageUrl && <img src={object.imageUrl} style={{objectFit:"cover"}}></img>}
				</div>;	
			})
		}
	</div>;	
}