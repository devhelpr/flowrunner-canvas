import * as React from 'react';
import { useRef , useState, useEffect , useMemo, useCallback, useLayoutEffect} from 'react';
import { Shapes } from '../shapes';

import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { IFlowrunnerConnector } from '../../../interfaces/FlowrunnerConnector';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { IFlowState} from '../../../state/flow-state';
import { Subject } from 'rxjs';
import { ThumbFollowFlow, ThumbPositionRelativeToNode } from '../shapes/shape-types';
import { usePositionContext } from '../../contexts/position-context';

export interface IHtmlNodeProps {
	hasTaskNameAsNodeTitle?: boolean;
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
	onShowNodeEditor: any;
	formNodesubject?: Subject<any>;

	onMouseStart: any;
	onMouseOver: any;
	onMouseOut: any;
	onTouchStart: any;
	onMouseEnd: any;
	onMouseMove: any;
	onMouseLeave: any;
	onClickShape: any;

	onMouseConnectionStartOver: any;
	onMouseConnectionStartOut: any;
	onMouseConnectionStartStart: any;
	onMouseConnectionStartMove: any;
	onMouseConnectionStartEnd: any;

	onMouseConnectionEndOver : any;
	onMouseConnectionEndOut: any;
	onMouseConnectionEndStart: any;
	onMouseConnectionEndMove: any;
	onMouseConnectionEndEnd: any;
	onMouseConnectionEndLeave: any;

	useFlowStore : () => IFlowState;
}

export const HtmlNode = React.forwardRef((props: IHtmlNodeProps, ref) => {
	const positionContext = usePositionContext();

	let shapeType = useMemo(() => FlowToCanvas.getShapeType(props.node.shapeType, props.node.taskType, props.node.isStartEnd), 
		[props.node]);

	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.node.taskType, props.node), [props.node]);

	//const selectedNode = useSelectedNodeStore();
	const flowStore = props.useFlowStore();

	const Shape = Shapes[shapeType];
	
	if (shapeType === "Html" && Shape) {
		const nodeClone = {...props.node};
		const position = positionContext.getPosition(props.node.name) || props.node;
		let nodeState = (props.nodesStateLocal || "") === "error" ? " has-error" : "";

		const isSelected = false;//selectedNode && selectedNode.node.name === props.node.name;
		nodeClone.htmlPlugin = props.node.htmlPlugin || (settings as any).htmlPlugin || "";

		let hasClone = true;
		if ((settings as any).hasClone !== undefined) {
			hasClone = (settings as any).hasClone; 
		}
		
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

		let htmlPlugin = props.node.htmlPlugin;
		if (!htmlPlugin || htmlPlugin == "") {
			htmlPlugin = (settings as any).htmlPlugin;
		}

		let additionalStyles : any = {};

		if (htmlPlugin === "shapeNode") {
			additionalStyles.height = (height || props.node.height || 250) + "px";
		}
		if ((settings as any).styleNode) {
			additionalStyles = {...additionalStyles, ...(settings as any).styleNode};
		}
		let selected = "";
		if (isSelected) {
			selected = "canvas__html-shape--selected ";

			// TODO : handle this in canvas in  useEffect(() => useSelectedNodeStore.subscribe( 

		}
		return <div
			style={{transform: "translate(" + (position.x) + "px," + 
					( (position.y) ) + "px) " +
					"scale(" + (1) + "," + (1) + ") ",
					width: (width || props.node.width || 250) + "px",
					minHeight: (height || props.node.height || 250) + "px",
					
					top: "0px",
					left: "0px",
					opacity: (!props.canvasHasSelectedNode) ? 1 : 1, //0.5
					...additionalStyles, 										 
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
												 
			className={selected + "canvas__html-shape canvas__html-shape-" + props.node.name + 			
				nodeState + 
				(settings.background ? ` ${settings.background} ` : "") + 
				(FlowToCanvas.getHasOutputs(shapeType, settings) ? "" : "canvas__html-shape--no-outputs") + " " +
				(FlowToCanvas.getHasInputs(shapeType, settings) ? "" : "canvas__html-shape--no-inputs")
				}
				onMouseUp={(event) => props.onMouseEnd(props.node, event)}
				>
				<div className={"canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" :"")}
					onMouseOver={(event) => props.onMouseOver(props.node, event)}
					onMouseOut={props.onMouseOut}
					onTouchStart={(event) => props.onTouchStart(props.node, event)}
					onTouchEnd={(event) => props.onMouseEnd( props.node, event)}
					onTouchMove={(event) => props.onMouseMove(props.node, event)}
					onMouseDown={(event) => props.onMouseStart(props.node, event)}
					onMouseMove={(event) => props.onMouseMove(props.node, event)}
					onMouseUp={(event) => props.onMouseEnd(props.node, event)}
					onMouseLeave={(event) => props.onMouseLeave(props.node, event)}	
					onClick={(event) => props.onClickShape(props.node, event)}			
				>
					<span className="canvas__html-shape-bar-title">{settings.icon && <span className={"canvas__html-shape-title-icon fas " +  settings.icon}></span>}
					<span>{!!props.hasTaskNameAsNodeTitle ? props.node.label || props.node.taskType : props.node.label ? props.node.label : props.node.name}</span></span>
					{hasClone && <a href="#" onClick={(event) => props.onCloneNode(props.node, event)}
						onFocus={props.onFocus}
						className="canvas__html-shape-bar-icon far fa-clone"></a>}							
					{!!settings.hasConfigMenu && <a href="#"
						onFocus={props.onFocus} 
						onClick={(event) => props.onShowNodeSettings(props.node, settings, event)} 
						className="canvas__html-shape-bar-icon fas fa-cog"></a>}
					{(htmlPlugin === "formNode" || 
						(htmlPlugin === "shapeNode" && (settings as any).metaInfo && (settings as any).metaInfo.length > 0)) && 
						<a href="#"
							onFocus={props.onFocus} 
							onClick={(event) => props.onShowNodeEditor(props.node, settings, event)} 
							className="canvas__html-shape-bar-icon fas fa-window-maximize"></a>}	
				</div>
				<div className="canvas__html-shape-body" style={{...(settings && (settings as any).styleShapeBody)}}>
				{props.renderHtmlNode && props.renderHtmlNode(nodeClone, props.flowrunnerConnector, props.flowMemo, settings, props.formNodesubject, props.flowId, props.useFlowStore)}</div>
				<div className={"canvas__html-shape-thumb-start canvas__html-shape-0"}
					onMouseOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
					onMouseOut={(event) => props.onMouseConnectionStartOut(props.node,false,event)}
					onMouseDown={(event) => props.onMouseConnectionStartStart(props.node,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.default,event)}
					onMouseMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
					onMouseUp={(event) => props.onMouseConnectionStartEnd(props.node,false,ThumbPositionRelativeToNode.default,event)}				
				></div>
				<div className={"canvas__html-shape-thumb-startbottom"}
					onMouseOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
					onMouseOut={(event) => props.onMouseConnectionStartOut(props.node,false,event)}
					onMouseDown={(event) => props.onMouseConnectionStartStart(props.node,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.bottom,event)}
					onMouseMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
					onMouseUp={(event) => props.onMouseConnectionStartEnd(props.node,false,ThumbPositionRelativeToNode.default,event)}		
				></div>
				<div className={"canvas__html-shape-thumb-endtop"}
					onMouseOver={(event) => props.onMouseConnectionEndOver(props.node,false,event,ThumbPositionRelativeToNode.top)}
					onMouseOut={(event) => props.onMouseConnectionEndOut(props.node,false,event)}
					onMouseDown={(event) => props.onMouseConnectionEndStart(props.node,false,event)}
					onMouseMove={(event) => props.onMouseConnectionEndMove(props.node,false,event)}
					onMouseUp={(event) => props.onMouseConnectionEndEnd(props.node,false,event,ThumbPositionRelativeToNode.top)}
					onMouseLeave={(event) => props.onMouseConnectionEndLeave(props.node,false,event)}
				
				></div>
				<div className={"canvas__html-shape-thumb-end canvas__html-shape-0"}
					onMouseOver={(event) => props.onMouseConnectionEndOver(props.node,false,event)}
					onMouseOut={(event) => props.onMouseConnectionEndOut(props.node,false,event)}
					onMouseDown={(event) => props.onMouseConnectionEndStart(props.node,false,event)}
					onMouseMove={(event) => props.onMouseConnectionEndMove(props.node,false,event)}
					onMouseUp={(event) => props.onMouseConnectionEndEnd(props.node,false,event)}
					onMouseLeave={(event) => props.onMouseConnectionEndLeave(props.node,false,event)}				
				></div>
				{settings.events && settings.events.map((event ,eventIndex) => {
					return <div className={"canvas__html-shape-event canvas__html-shape-" + (eventIndex + 1)} key={"_" + props.node.name + (props.flowId || "") + "-" + eventIndex}></div>
				})}
		</div>;						
	}
	return null;
})
