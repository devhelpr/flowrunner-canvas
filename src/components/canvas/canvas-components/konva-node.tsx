import * as React from 'react';
import { useMemo } from 'react';
import { Shapes } from '../shapes';

import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { IFlowState } from '../../../state/flow-state';
import { Thumbs }  from '../shapes/thumbs';
import { ThumbsStart }  from '../shapes/thumbsstart';
import { useNodesTouchedStateStore} from '../../../state/nodes-touched';
import { ThumbFollowFlow, ThumbPositionRelativeToNode } from '../shapes/shape-types';
import { usePositionContext } from '../../contexts/position-context';

export interface IKonvaNodeProps {
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
	nodesConnectedToSelectedNode: any;

	shapeRefs : any;

	onMouseStart: any;
	onMouseOver: any;
	onMouseOut: any;
	onClickLine: any;
	onClickSetup: any;
	onClickShape: any;
	onDragStart: any;
	onDragEnd: any;
	onDragMove: any;
	onTouchStart: any;
	onMouseEnd: any;
	onMouseMove: any;
	onMouseLeave: any;

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

export const KonvaNode = (props: IKonvaNodeProps) => {
	const positionContext = usePositionContext();

	let shapeType = useMemo(() => FlowToCanvas.getShapeType(props.node.shapeType, props.node.taskType, props.node.isStartEnd), 
		[props.node]);

	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.node.taskType, props.node), [props.node]);

	//const selectedNode = useSelectedNodeStore();
	const flowStore = props.useFlowStore();
	const touchedNodesStore = useNodesTouchedStateStore();

	if (shapeType === "Html") {
		return null;
	}
	const Shape = Shapes[shapeType];
	let position = positionContext.getPosition(props.node.name);
	if (!position) {
		if (props.node.shapeType !== "Line") {
			
			positionContext.setPosition(props.node.name, {
				x: props.node.x,
				y: props.node.y
			});
		} else {
			
			positionContext.setPosition(props.node.name, {
				xstart: props.node.xstart,
				ystart: props.node.ystart,
				xend: props.node.xend,
				yend: props.node.yend
			});
		}  
		position = positionContext.getPosition(props.node.name);
	}

	if (props.node.shapeType !== "Line" && Shape && position) {

		let nodeState = "";
		
		nodeState = props.nodesStateLocal;
			
		let isConnectedToSelectedNode = false;//selectedNode && props.nodesConnectedToSelectedNode[props.node.name] === true;
		/*if (selectedNode && 
			selectedNode.node && 
			(selectedNode.node as any).shapeType === "Line") {

			if ((selectedNode.node as any).startshapeid === props.node.name) {
				isConnectedToSelectedNode = true;
			}

			if ((selectedNode.node as any).endshapeid === props.node.name) {
				isConnectedToSelectedNode = true;
			}								
		}
		*/

		return <React.Fragment><Shape
			x={position.x} 
			y={position.y} 
			name={props.node.name}
			flow={props.flowMemo}
			taskType={props.node.taskType}
			node={props.node}																	
			
			ref={ref => (props.shapeRefs.current[props.node.name] = ref)}

			shapeRefs={props.shapeRefs}
			positions={positionContext.getPosition}
			canvasHasSelectedNode={props.canvasHasSelectedNode}
			
			nodeState={nodeState}
			selectedNode={undefined}
			onLineMouseOver={props.onMouseOver}
			onLineMouseOut={props.onMouseOut}
			onClickLine={props.onClickLine}
			hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}

			onClickSetup={(event) => props.onClickSetup( props.node, settings,event)}
			onMouseOver={(event) => props.onMouseOver(props.node, event)}
			onMouseOut={props.onMouseOut}
			onDragStart={(event) => props.onDragStart(props.node, event)}
			onDragEnd={(event) => props.onDragEnd(props.node, event)}
			onDragMove={(event) => props.onDragMove( props.node, event)}
			onTouchStart={(event) => props.onTouchStart(props.node, event)}
			onTouchEnd={(event) => props.onMouseEnd( props.node, event)}
			onTouchMove={(event) => props.onMouseMove(props.node, event)}
			onClickShape={(event) => props.onClickShape(props.node, event)}
			onMouseStart={(event) => props.onMouseStart(props.node, event)}
			onMouseMove={(event) => props.onMouseMove(props.node, event)}
			onMouseEnd={(event) => props.onMouseEnd(props.node, event)}
			onMouseLeave={(event) => props.onMouseLeave(props.node, event)}
			isSelected={false}
			isConnectedToSelectedNode={isConnectedToSelectedNode}
			getNodeInstance={props.getNodeInstance}
			touchedNodes={touchedNodesStore.nodesTouched}
		></Shape>
		{(shapeType === "Rect" || (shapeType === "Diamond" && !settings.altThumbPositions) || shapeType === "Html") &&
		FlowToCanvas.getHasInputs(shapeType, settings) &&
			<Thumbs
				position={FlowToCanvas.getThumbEndPosition(shapeType, position)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumb_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}

				onMouseConnectionEndOver={(event) => props.onMouseConnectionEndOver(props.node,false,event)}
				onMouseConnectionEndOut={(event) => props.onMouseConnectionEndOut(props.node,false,event)}
				onMouseConnectionEndStart={(event) => props.onMouseConnectionEndStart(props.node,false,event)}
				onMouseConnectionEndMove={(event) => props.onMouseConnectionEndMove(props.node,false,event)}
				onMouseConnectionEndEnd={(event) => props.onMouseConnectionEndEnd(props.node,false,event)}
				onMouseConnectionEndLeave={(event) => props.onMouseConnectionEndLeave(props.node,false,event)}
				getNodeInstance={props.getNodeInstance}
			></Thumbs>}
		{(shapeType === "Diamond" && settings.altThumbPositions === 1) && 
		FlowToCanvas.getHasInputs(shapeType, settings) &&
			<Thumbs
				position={FlowToCanvas.getThumbEndPosition(shapeType, position, 0, ThumbPositionRelativeToNode.top)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumb_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				thumbPositionRelativeToNode={ThumbPositionRelativeToNode.top}

				onMouseConnectionEndOver={(event) => props.onMouseConnectionEndOver(props.node,false,event, ThumbPositionRelativeToNode.top)}
				onMouseConnectionEndOut={(event) => props.onMouseConnectionEndOut(props.node,false,event)}
				onMouseConnectionEndStart={(event) => props.onMouseConnectionEndStart(props.node,false,event)}
				onMouseConnectionEndMove={(event) => props.onMouseConnectionEndMove(props.node,false,event)}
				onMouseConnectionEndEnd={(event) => props.onMouseConnectionEndEnd(props.node,false,event, ThumbPositionRelativeToNode.top)}
				onMouseConnectionEndLeave={(event) => props.onMouseConnectionEndLeave(props.node,false,event)}
				getNodeInstance={props.getNodeInstance}
			></Thumbs>}
		{(shapeType === "Rect" || shapeType === "Html") && 
		FlowToCanvas.getHasOutputs(shapeType, settings) && 
			<ThumbsStart				
				position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumbstart_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				
				onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
				onMouseConnectionStartOut={(event) => props.onMouseConnectionStartOut(props.node,false,event)}
				onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.node,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.default,event)}
				onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
				onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.node,false,ThumbPositionRelativeToNode.default,event)}

				getNodeInstance={props.getNodeInstance}										
			></ThumbsStart>}
		{(shapeType === "Html") && 
		FlowToCanvas.getHasOutputs(shapeType, settings) && 
			<ThumbsStart				
				position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumbstartbottom_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				thumbPositionRelativeToNode={ThumbPositionRelativeToNode.bottom}

				onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
				onMouseConnectionStartOut={(event) => props.onMouseConnectionStartOut(props.node,false,event)}
				onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.node,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.bottom,event)}
				onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
				onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.node,false,ThumbPositionRelativeToNode.default,event)}

				getNodeInstance={props.getNodeInstance}										
			></ThumbsStart>}
		{(shapeType === "Html") && 
		FlowToCanvas.getHasInputs(shapeType, settings) && 
			<Thumbs				
				position={FlowToCanvas.getThumbEndPosition(shapeType, position, 0, ThumbPositionRelativeToNode.top)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumbtop_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				thumbPositionRelativeToNode={ThumbPositionRelativeToNode.top}

				onMouseConnectionEndOver={(event) => props.onMouseConnectionEndOver(props.node,false,event,ThumbPositionRelativeToNode.top)}
				onMouseConnectionEndOut={(event) => props.onMouseConnectionEndOut(props.node,false,event)}
				onMouseConnectionEndStart={(event) => props.onMouseConnectionEndStart(props.node,false,event)}
				onMouseConnectionEndMove={(event) => props.onMouseConnectionEndMove(props.node,false,event)}
				onMouseConnectionEndEnd={(event) => props.onMouseConnectionEndEnd(props.node,false,event, ThumbPositionRelativeToNode.top)}
				onMouseConnectionEndLeave={(event) => props.onMouseConnectionEndLeave(props.node,false,event)}

				getNodeInstance={props.getNodeInstance}										
			></Thumbs>}
		{(shapeType === "Diamond") && 
		FlowToCanvas.getHasOutputs(shapeType, settings) && 
			<ThumbsStart				
				position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0, 
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.top : ThumbPositionRelativeToNode.left)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumbstarttop_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				followFlow={ThumbFollowFlow.happyFlow}
				thumbPositionRelativeToNode={!settings.altThumbPositions ? ThumbPositionRelativeToNode.top : ThumbPositionRelativeToNode.left}
				onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
				onMouseConnectionStartOut={(event) => props.onMouseConnectionStartOut(props.node,false,event)}
				onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.node,false,"",
					ThumbFollowFlow.happyFlow, 
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.top : ThumbPositionRelativeToNode.left,
					event)}
				onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
				onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.node,false,
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.top : ThumbPositionRelativeToNode.left,
					event)}

				getNodeInstance={props.getNodeInstance}										
			></ThumbsStart>}
		{(shapeType === "Diamond") && 
		FlowToCanvas.getHasOutputs(shapeType, settings) && 
			<ThumbsStart				
				position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0, 
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.bottom : ThumbPositionRelativeToNode.right)}
				name={props.node.name}
				taskType={props.node.taskType}
				shapeType={shapeType}
				node={props.node}																	
				ref={ref => (props.shapeRefs.current["thumbstartbottom_" + props.node.name] = ref)} 									
				isSelected={false}
				isConnectedToSelectedNode={isConnectedToSelectedNode}									
				canvasHasSelectedNode={props.canvasHasSelectedNode}
				followFlow={ThumbFollowFlow.unhappyFlow}
				thumbPositionRelativeToNode={!settings.altThumbPositions ? ThumbPositionRelativeToNode.bottom : ThumbPositionRelativeToNode.right}
				onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.node,false,event)}
				onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.node,false,"",
					ThumbFollowFlow.unhappyFlow, 
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.bottom : ThumbPositionRelativeToNode.right,
					event)}
				onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.node,false,event)}
				onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.node,false,
					!settings.altThumbPositions ? ThumbPositionRelativeToNode.bottom : ThumbPositionRelativeToNode.right,
					event)}

				getNodeInstance={props.getNodeInstance}										
			></ThumbsStart>}
		{(shapeType === "Rect" || shapeType === "Html") && 
		FlowToCanvas.getHasOutputs(shapeType, settings) && 
		settings.events && settings.events.map((event ,eventIndex) => {
				return <ThumbsStart
					key={"node-thumbstart-" + props.flowId + props.node.name + "-" + eventIndex} 
					position={FlowToCanvas.getThumbStartPosition(shapeType, position, eventIndex + 1)}
					name={props.node.name}
					taskType={props.node.taskType}
					shapeType={shapeType}
					node={props.node}																	
					ref={ref => (props.shapeRefs.current["thumbstartevent_" + props.node.name + eventIndex] = ref)} 									
					isSelected={false}
					isConnectedToSelectedNode={isConnectedToSelectedNode}									
					canvasHasSelectedNode={props.canvasHasSelectedNode}

					onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.node,eventIndex,event)}
					onMouseConnectionStartOut={(event) => props.onMouseConnectionStartOut(props.node,eventIndex,event)}
					onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.node,eventIndex, event.eventName,
						ThumbFollowFlow.event, ThumbPositionRelativeToNode.default,event)}
					onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.node,eventIndex,event)}
					onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.node,eventIndex,ThumbPositionRelativeToNode.default,event)}

					getNodeInstance={props.getNodeInstance}										
			></ThumbsStart>
		})}
		
		</React.Fragment>;
	}
	
	return null;
}
