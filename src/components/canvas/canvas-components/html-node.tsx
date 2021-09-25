import * as React from 'react';
import { useRef , useState, useEffect , useMemo, useCallback, useLayoutEffect} from 'react';
import { Shapes } from '../shapes';

import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { getPosition } from '../../../services/position-service';
import { useSelectedNodeStore} from '../../../state/selected-node-state';
import { useFlowStore} from '../../../state/flow-state';

export interface IHtmlNodeProps {
	node : any;
	flowrunnerConnector : IFlowrunnerConnector;
	nodesStateLocal : any;
	getNodeInstance: any;
	onCloneNode: any;
	canvasHasSelectedNode : boolean;
	onFocus: any;
	onShowNodeSettings: any;
	renderHtmlNode: any;
	flowId?: string | number;
	flowMemo: any;
}

export const HtmlNode = React.forwardRef((props: IHtmlNodeProps, ref) => {

	let shapeType = useMemo(() => FlowToCanvas.getShapeType(props.node.shapeType, props.node.taskType, props.node.isStartEnd), 
		[props.node]);

	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.node.taskType, props.node), [props.node]);

	//const selectedNode = useSelectedNodeStore();
	const flowStore = useFlowStore();

	const Shape = Shapes[shapeType];
	
	if (shapeType === "Html" && Shape) {
		
		const nodeClone = {...props.node};
		const position = getPosition(props.node.name) || props.node;
		let nodeState = (props.nodesStateLocal || "") == "error" ? " has-error" : "";

		const isSelected = false;//selectedNode && selectedNode.node.name === props.node.name;
		nodeClone.htmlPlugin = props.node.htmlPlugin || (settings as any).htmlPlugin || "";
		
		let width = undefined;
		let height = undefined;

		if (props.getNodeInstance) {
			const instance = props.getNodeInstance(props.node, props.flowrunnerConnector, flowStore.flow, settings);
			if (instance) {
				if (instance.getWidth && instance.getHeight) {
					width = instance.getWidth(props.node);
					height = instance.getHeight(props.node);
				}
			}
		}

		return <div
			style={{transform: "translate(" + (position.x) + "px," + 
					( (position.y) ) + "px) " +
					"scale(" + (1) + "," + (1) + ") ",
					width: (width || props.node.width || 250) + "px",
					minHeight: (height || props.node.height || 250) + "px",
					height: (height || props.node.height || 250) + "px",
					top: "0px",
					left: "0px",
					opacity: (!props.canvasHasSelectedNode) ? 1 : 1 //0.5 										 
				}}
			id={props.node.name}
			data-node={props.node.name}
			data-task={props.node.taskType}
			data-html-plugin={nodeClone.htmlPlugin}
			data-visualizer={props.node.visualizer || "default"}
			data-x={position.x} 
			data-y={position.y}
			data-height={(height || props.node.height || 250)}
			ref={ref as React.LegacyRef<HTMLDivElement>}									 
			className={"canvas__html-shape canvas__html-shape-" + props.node.name + nodeState + 
				(settings.background ? " " + settings.background : "") + 
				(isSelected ? " canvas__html-shap--selected" :"") + " " +
				(FlowToCanvas.getHasOutputs(shapeType, settings) ? "" : "canvas__html-shape--no-outputs") + " " +
				(FlowToCanvas.getHasInputs(shapeType, settings) ? "" : "canvas__html-shape--no-inputs")
				}>
				<div className={"canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" :"")}>
					<span className="canvas__html-shape-bar-title">{settings.icon && <span className={"canvas__html-shape-title-icon fas " +  settings.icon}></span>}{props.node.label ? props.node.label : props.node.name}</span>
					<a href="#" onClick={(event) => props.onCloneNode(props.node, event)}
						onFocus={props.onFocus}
						className="canvas__html-shape-bar-icon far fa-clone"></a>									
					{!!settings.hasConfigMenu && <a href="#"
						onFocus={props.onFocus} 
						onClick={(event) => props.onShowNodeSettings(props.node, settings, event)} 
						className="canvas__html-shape-bar-icon fas fa-cog"></a>}</div>
				<div className="canvas__html-shape-body">
				{props.renderHtmlNode && props.renderHtmlNode(nodeClone, props.flowrunnerConnector, props.flowMemo, settings)}</div>
				<div className={"canvas__html-shape-thumb-start canvas__html-shape-0"}></div>
				<div className={"canvas__html-shape-thumb-startbottom"}></div>
				<div className={"canvas__html-shape-thumb-endtop"}></div>
				<div className={"canvas__html-shape-thumb-end canvas__html-shape-0"}></div>
				{settings.events && settings.events.map((event ,eventIndex) => {
					return <div className={"canvas__html-shape-event canvas__html-shape-" + (eventIndex + 1)} key={"_" + props.node.name + (props.flowId || "") + "-" + eventIndex}></div>
				})}
		</div>;						
	}
	return null;
})
