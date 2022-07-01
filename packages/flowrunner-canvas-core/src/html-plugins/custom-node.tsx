import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';
import { useCanvasModeStateStore} from '../state/canvas-mode-state';

import * as uuid from 'uuid';

const uuidV4 = uuid.v4;

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
	const [receivedPayload, setReceivedPayload] = useState({} as any);
	const observableId = useRef(uuidV4());
	const unmounted = useRef(false);
	const canvasMode = useCanvasModeStateStore();

	useEffect(() => {
		console.log("CustomNodeHtmlPlugin", props);
		return () => {
			unmounted.current = true;
		}
	}, []);

	useEffect(() => {

		if (props.flowrunnerConnector) {
			props.flowrunnerConnector?.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		}
		return () => {
			if (props.flowrunnerConnector) {
				props.flowrunnerConnector?.unregisterFlowNodeObserver(props.node.name, observableId.current);
			}
		}
	}, [props.node, props.flowrunnerConnector]);

	const receivePayloadFromNode = useCallback((payload : any) => {
		console.log("receivePayloadFromNode", payload);
		if (unmounted.current) {
			return;
		}
		setReceivedPayload(payload);
		return;
	}, [props.taskSettings, props.node]);

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
					{(object.imageUrl || receivedPayload.imageUrl) && <img 
						src={(receivedPayload && receivedPayload.imageUrl) || object.imageUrl} 
						style={{objectFit:"cover"}}
						className={object.imageCss}></img>}
				</div>;	
			})
		}
	</div>;	
}