import * as React from 'react';
import { useEffect, useState, useRef } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import Slider from '@material-ui/core/Slider';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class SliderNodeHtmlPluginInfo {
	getWidth = (node) => {
		return 300;
	}

	getHeight(node) {
		return;
	}
}

export interface SliderNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;
}

export interface SliderNodeHtmlPluginState {
	value : number | number[];
	receivedPayload : any[];
}


export const SliderNodeHtmlPlugin = (props : SliderNodeHtmlPluginProps) => {

	const [value, setValue] = useState(props.node.defaultValue || 0);
	const [receivedPayload, setReceivedPayload] = useState([] as any[]);

	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();

	const observableId = useRef(uuidV4());


	useEffect(() => {
		console.log("componentDidMount slider");
		if (props.node) {
			props.flowrunnerConnector.modifyFlowNode(
				props.node.name, 
				props.node.propertyName, 
				props.node.defaultValue || 0,
				""
			);
			setValue(props.node.defaultValue || 0);
		}
	}, []);

	useEffect(() => {
		if (props.node) {
			props.flowrunnerConnector.modifyFlowNode(
				props.node.name, 
				props.node.propertyName, 
				value,
				props.node.onChange || props.node.name
			);
		}
		
	}, [props.flow]);
	
	const onChange = (event: object, value: number | number[]) => {
		console.log("slider", value);
		if (props.node) {
			props.flowrunnerConnector.modifyFlowNode(
				props.node.name, 
				props.node.propertyName, 
				value,
				props.node.onChange || props.node.name,
				"onChangeSlider"
			);
			let preventLoop = false;
			if (!selectedNode || !selectedNode.payload) {
				//props.selectNode(props.node.name, props.node);
			}
			setValue(value);
		}
	}

	
	return <div className="html-plugin-node" style={{			
		backgroundColor: "white"
	}}>
		<div className="w-100 h-auto text-center">
			{props.node.title && <div className="text-center"><strong>{props.node.title}</strong></div>}
			<div style={{
				fontSize: "24px",
				marginBottom: "20px"
			}}>
				{props.node.preLabel && <span>{props.node.preLabel}</span>}
				<span>{(selectedNode && 
						selectedNode.node &&
						selectedNode.node.payload &&
						props.node.propertyName &&
						selectedNode.node.payload[props.node.propertyName]
						) || value}</span>
				{props.node.afterLabel && <span>{props.node.afterLabel}</span>}
			</div>				
			<Slider 
				min={props.node.minValue || 0}
				max={props.node.maxValue || 100} 
				disabled={!!canvasMode.isFlowrunnerPaused}
				value={(selectedNode && 
					selectedNode.node &&
					selectedNode.node.payload &&
					props.node.propertyName &&
					selectedNode.node.payload[props.node.propertyName]) ||
					value || 0} 
				onChange={onChange} 
			/>
		</div>
	</div>;
}