import * as React from 'react';
import { useMemo, useRef } from 'react';
import { Line } from './line';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ErrorBoundary } from '../../../helpers/error';
import { ThumbPositionRelativeToNode } from './shape-types';
import { usePositionContext } from '../../contexts/position-context';

export interface ILineHelperProps {
	flow: any[],
	endshapeid : string,
	node,
	lineNode,
	getNodeInstance : any, 
	canvasHasSelectedNode : boolean, 
	isSelected : boolean,
	selectedNode : any, 
	shapeRefs,
	onLineMouseOver,
	onLineMouseOut,
	onClickLine,
	touchedNodes,
	newStartPosition,
	positions: any;
	flowHash?: any;
	onMouseStart: any;
	onMouseMove: any;
	onMouseEnd: any;

	onMouseConnectionStartOver?: any;
	onMouseConnectionStartOut?: any;
	onMouseConnectionStartStart?: any;
	onMouseConnectionStartMove?: any;
	onMouseConnectionStartEnd?: any;

	onMouseConnectionEndOver?: any;
	onMouseConnectionEndOut?: any;
	onMouseConnectionEndStart?: any;
	onMouseConnectionEndMove?: any;
	onMouseConnectionEndEnd?: any;
	onMouseConnectionEndLeave?: any;
}

export const LineHelper = (props : ILineHelperProps) => {
	const positionContext = usePositionContext();
	
	const endNode = useMemo(() => {
		const endIndex = props.flowHash.get(props.endshapeid).index;
		if (endIndex < 0) {
			return false;
		}
		return props.flow[endIndex];	
	}, [props.node.name, props.flow, props.flowHash, props.endshapeid]);
	
	/*
	const endNodes = useMemo(() => { 
		return props.flow.filter((node) => {
			return node.name == props.endshapeid;
		});
	}, [props.flow, props.node.name, props.endshapeid]);
	if (endNodes.length == 0) {
		return null;
	}
	let endNode = endNodes[0];
	*/
	let newEndPosition = {
		x: 0,
		y: 0
	};

	if (endNode) {
		
		let positionNode = props.positions(endNode.name) || endNode;
		newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
			x: positionNode.x,
			y: positionNode.y
		}, endNode, props.getNodeInstance,
			props.lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
	} else {
		let position = positionContext.getPosition(props.lineNode.name);
		if (!position) {				
				positionContext.setPosition(props.lineNode.name, {
					xstart: props.lineNode.xstart,
					ystart: props.lineNode.ystart,
					xend: props.lineNode.xend,
					yend: props.lineNode.yend
				});
				position = positionContext.getPosition(props.lineNode.name);
		}
		if (position) {
			newEndPosition = {
				x: position.xend || 0,
				y: position.yend || 0
			};
		}
	}
	
	return <Line
		ref={ref => (props.shapeRefs.current[props.lineNode.name] = ref)}									
		onMouseOver={(event) => props.onLineMouseOver(props.lineNode, event)}
		onMouseOut={(event) => props.onLineMouseOut(props.lineNode, event)}
		onClickLine={(event) => props.onClickLine(props.lineNode, event)}
		canvasHasSelectedNode={props.canvasHasSelectedNode}
		isSelected={false}
		onMouseStart={props.onMouseStart}
		onMouseMove={props.onMouseMove}
		onMouseEnd={props.onMouseEnd}
		lineNode={props.lineNode}
		shapeRefs={props.shapeRefs.current}
		isErrorColor={props.lineNode.followflow === 'onfailure'}
		isSuccessColor={props.lineNode.followflow === 'onsuccess'}
		xstart={props.newStartPosition.x} 
		ystart={props.newStartPosition.y}
		xend={newEndPosition.x} 
		yend={newEndPosition.y}
		isEventNode={props.lineNode.event !== undefined && props.lineNode.event !== ""}
		selectedNodeName={""}
		startNodeName={props.lineNode.startshapeid}
		endNodeName={props.lineNode.endshapeid}
		hasEndThumb={props.endshapeid === undefined}
		noMouseEvents={false}	
		touchedNodes={props.touchedNodes}
		name={props.lineNode.name}
		thumbPosition={props.lineNode.thumbPosition || ThumbPositionRelativeToNode.default}
		thumbEndPosition={props.lineNode.thumbEndPosition || ThumbPositionRelativeToNode.default}	
		
		onMouseConnectionStartOver={props.onMouseConnectionStartOver}
		onMouseConnectionStartOut={props.onMouseConnectionStartOut}
		onMouseConnectionStartStart={props.onMouseConnectionStartStart}
		onMouseConnectionStartMove={props.onMouseConnectionStartMove}
		onMouseConnectionStartEnd={props.onMouseConnectionStartEnd}

		onMouseConnectionEndOver={props.onMouseConnectionEndOver}
		onMouseConnectionEndOut={props.onMouseConnectionEndOut}
		onMouseConnectionEndStart={props.onMouseConnectionEndStart}
		onMouseConnectionEndMove={props.onMouseConnectionEndMove}
		onMouseConnectionEndEnd={props.onMouseConnectionEndEnd}
		onMouseConnectionEndLeave={props.onMouseConnectionEndLeave}
	></Line>;
}

export interface ILinesProp {
	flow : any[], 
	node : any, 
	getNodeInstance : any, 
	canvasHasSelectedNode : boolean, 
	isSelected : boolean,
	selectedNode : any, 
	shapeRefs,
	onLineMouseOver,
	onLineMouseOut,
	onClickLine,
	touchedNodes,
	positions?: any;
	flowHash? : any;
	onMouseStart: any;
	onMouseMove: any;
	onMouseEnd: any;

	onMouseConnectionStartOver?: any;
	onMouseConnectionStartOut?: any;
	onMouseConnectionStartStart?: any;
	onMouseConnectionStartMove?: any;
	onMouseConnectionStartEnd?: any;

	onMouseConnectionEndOver?: any;
	onMouseConnectionEndOut?: any;
	onMouseConnectionEndStart?: any;
	onMouseConnectionEndMove?: any;
	onMouseConnectionEndEnd?: any;
	onMouseConnectionEndLeave?: any;
}

export const Lines = (
		props : ILinesProp
	) => {

		
	const lines = useMemo(() => {
		return props.flowHash.get(props.node.name).start.map((lineIndex, index) => {
			return props.flow[lineIndex];
		});	
	}, [props.node.name, props.flow, props.flowHash]);
	/*
	const lines = useMemo(() => {
		return props.flow.filter((lineNode, index) => {		
			if (lineNode.startshapeid == props.node.name && lineNode.shapeType === "Line") {
				return true;
			}
			return false;
			})}
		 , [props.node.name, props.flow]);
	*/
	return <>{lines.map((lineNode, index) => {		
			/*
				- lijnen vanuit de huidige node naar een andere node
			*/
			let newPosition ={x:props.node.x, y:props.node.y};
			newPosition = props.positions(props.node.name) || newPosition;

			const newStartPosition =  FlowToCanvas.getStartPointForLine(props.node, newPosition, lineNode, props.getNodeInstance,
				lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
			
			return <React.Fragment key={index}><LineHelper
					flow={props.flow}
					flowHash={props.flowHash}
					positions={props.positions}
					endshapeid={lineNode.endshapeid}
					node={props.node}
					lineNode={lineNode}
					getNodeInstance={props.getNodeInstance}
					canvasHasSelectedNode={props.canvasHasSelectedNode}
					isSelected={props.isSelected}
					selectedNode={props.selectedNode}
					shapeRefs={props.shapeRefs}
					onLineMouseOver={props.onLineMouseOver}
					onLineMouseOut={props.onLineMouseOut}
					onClickLine={props.onClickLine}
					onMouseStart={props.onMouseStart}
					onMouseMove={props.onMouseMove}
					onMouseEnd={props.onMouseEnd}

					onMouseConnectionStartOver={props.onMouseConnectionStartOver}
					onMouseConnectionStartOut={props.onMouseConnectionStartOut}
					onMouseConnectionStartStart={props.onMouseConnectionStartStart}
					onMouseConnectionStartMove={props.onMouseConnectionStartMove}
					onMouseConnectionStartEnd={props.onMouseConnectionStartEnd}

					onMouseConnectionEndOver={props.onMouseConnectionEndOver}
					onMouseConnectionEndOut={props.onMouseConnectionEndOut}
					onMouseConnectionEndStart={props.onMouseConnectionEndStart}
					onMouseConnectionEndMove={props.onMouseConnectionEndMove}
					onMouseConnectionEndEnd={props.onMouseConnectionEndEnd}
					onMouseConnectionEndLeave={props.onMouseConnectionEndLeave}
					
					touchedNodes={props.touchedNodes}	
					newStartPosition={newStartPosition}></LineHelper>		
			</React.Fragment>;
		})
	}</>;
}